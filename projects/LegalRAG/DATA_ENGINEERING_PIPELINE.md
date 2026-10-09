# Data Engineering & Indexing Pipeline

This document details the data engineering, text processing, chunking strategies, and artifact serialization mechanisms engineered for **LegalRAG**.

---

## 1. Raw Corpus & Jurisdiction Diversity

The primary dataset originates from the Hugging Face dataset `overthelex/indian-court-decisions` (config: `high_courts`, split: `train`).

### 1.1 Ingestion & Streaming Strategy
To handle large-scale judicial archives reliably without host memory thrashing:
- **Streaming Pipeline**: Ingested with `datasets.load_dataset(..., streaming=True)`.
- **Reproducible Shuffling**: Shuffled with `buffer_size=50000, seed=42` to ensure uniform cross-jurisdictional representation.
- **Corpus Scale**: **100,000 High Court decisions** collected across 24 state High Courts.

### 1.2 Jurisdiction Distribution

| High Court Bench | Code Identifier | Judgments in Corpus | % of Corpus |
| :--- | :---: | :---: | :---: |
| **Allahabad / Lucknow** | `18_6` | 21,498 | 21.50% |
| **Calcutta** | `19_16` | 19,772 | 19.77% |
| **Bombay** | `10_8` | 19,679 | 19.68% |
| **Madras** | `1_12` | 10,471 | 10.47% |
| **Gujarat** | `24_17` | 8,555 | 8.56% |
| **Madhya Pradesh** | `22_18` | 6,961 | 6.96% |
| **Delhi** | `16_20` | 3,289 | 3.29% |
| **Kerala** | `14_25` | 2,268 | 2.27% |
| **Punjab & Haryana, Patna, Karnataka, etc.** | Misc | 7,507 | 7.50% |
| **Total** | **24 Benches** | **100,000** | **100.0%** |

---

## 2. Text Profiling & Quality Sanitization

```text
[Raw Ingested Judgment]
         │
         ▼
[Profiling & Scanner] ────► Control Char Density > 1.0%? ──► REJECT / DROP (762 docs, 0.76%)
         │
         ▼ (Pass)
[Regex Sanitizer] ────────► Strip Non-Printable ASCII [\x00-\x1f\x7f-\x9f]
         │                  Preserve Paragraph Breaks (\n\n) & Statutory Symbols (Sections, §§)
         ▼
[Clean Parquet Artifact] ─► legal_judgments_clean.parquet (485.4 MB, 100,000 records)
```

### 2.1 Character Corruption Profiling
Legal judgments scanned from court archives often contain OCR artifacts and non-printable control characters.
- **Corrupted Sequences Found**: Non-printable ASCII `\x00-\x08`, `\x0b`, `\x0c`, `\x0e-\x1f`.
- **Rejection Threshold**: Any document with control character density $> 1.0\%$ of its total character count was flagged as severely corrupted.
- **Outcome**: **762 corrupted records (0.76%)** were filtered out during quality gating.

### 2.2 Normalization Rules
1. Non-printable control characters stripped regex-wise: `[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]`.
2. Multiple horizontal spaces collapsed to a single space.
3. Multi-line whitespace normalized to double newlines `\n\n` to maintain paragraph structure for semantic chunking.
4. Serialized to `legal_judgments_clean.parquet` (485.4 MB).

---

## 3. `LegalChunker`: Structural Document Partitioning

Legal arguments require balanced chunk boundaries:
- **Too small (<500 chars)**: Divorces statutory holdings from their supporting facts.
- **Too large (>3000 chars)**: Dilutes dense vector representations with background procedural narratives.

```text
               1,200 Character Window (CHUNK_SIZE)
 ┌─────────────────────────────────────────────────────────────┐
 │ ...The petitioner filed a revision under Section 397 CrPC. │
 │ The learned Sessions Judge dismissed the petition on the    │
 │ grounds that interim orders are bar under Section 397(2)... │
 └──────────────────────────────┬──────────────────────────────┘
                                │ 200 Char Overlap (CHUNK_OVERLAP)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ ...grounds that interim orders are bar under Section 397(2).│
 │ The High Court in exercise of inherent jurisdiction under   │
 │ Section 482 can quash proceedings if manifest injustice...  │
 └─────────────────────────────────────────────────────────────┘
```

### 3.1 Locked Hyperparameters
- **Splitter**: `RecursiveCharacterTextSplitter`
- **Separators**: `["\n\n", "\n", " ", ""]` (respects natural legal paragraph breaks before sentence/word boundaries)
- `CHUNK_SIZE`: **1,200 characters** (~200–250 words)
- `CHUNK_OVERLAP`: **200 characters** (~35–40 words)
- `MIN_CHUNK_LENGTH`: **100 characters** (prunes orphan headings, registrar stamps, and dates)

### 3.2 Partitioning Statistics
- **Total Produced Chunks**: **538,079 Chunks**
- **Average Chunks per Judgment**: 5.38 chunks
- **Artifact Size**: `legal_chunks.parquet` (260.7 MB compressed)
- **Primary Key Schema**:
  - `chunk_id`: Formatted as `{cnr}_chunk_{chunk_index}` (e.g. `WBCHCJ0003822020_1_2020-01-28_0`)
  - `cnr`: Unique Case Number Record identifier
  - `court_code`: State High Court numerical identifier
  - `decision_date`: Date of pronouncement (YYYY-MM-DD)
  - `text`: Chunk excerpt text (100–1200 characters)

---

## 4. Dual-Index Build & Serialization

```text
                             538,079 Partitioned Chunks
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     [BM25 Lexical Indexer]                         [Dense Embedding Pipeline]
     • Tokenize: [a-zA-Z0-9]+                       • BAAI/bge-base-en-v1.5
     • BM25Okapi(k1=1.5, b=0.75)                    • Sharded on 2x Tesla T4 GPUs
     • Pickle Serialization                         • 108 Embedding Shards (.npy)
                 │                                               │
                 ▼                                               ▼
            bm25.pkl                                        dense.index
            (578.8 MB)                                      (1.65 GB, FAISS IndexFlatIP)
```

### 4.1 BM25 Lexical Serialization (`bm25.pkl`)
- **Tokenizer**: Custom regex lowercasing: `[a-zA-Z0-9]+`
- **Format**: Pickled dictionary containing the pre-computed inverted index and chunk IDs:
  ```python
  {
      "bm25": <rank_bm25.BM25Okapi object>,
      "chunk_ids": ["WBCHCJ0003822020_1_2020-01-28_0", ...]
  }
  ```
- **Size on Disk**: **578.8 MB**

### 4.2 Dense Vector Index (`dense.index`)
- **Model**: `BAAI/bge-base-en-v1.5` (768 dimensions)
- **GPU Inference**: Embeddings generated across 2 × Tesla T4 GPUs on Kaggle, saved as 108 `.npy` matrix files (`emb_0000.npy` to `emb_0107.npy`).
- **Index Structure**: `faiss.IndexFlatIP` storing 538,079 L2-normalized 768-dimensional float32 vectors.
- **Size on Disk**: **1.65 GB**

---

## 5. Artifact Provisioning & Zero-Bloat Deployment

```text
┌─────────────────────────────────────────────────────────┐
│              Hugging Face Hub Repository                │
│             siddhu23/LegalRag_Dataset                   │
│                                                         │
│   • bm25.pkl (578.8 MB)                                 │
│   • dense.index (1.65 GB)                               │
│   • legal_chunks.parquet (260.7 MB)                     │
└───────────────────────────┬─────────────────────────────┘
                            │ On-demand download at startup
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  FastAPI Docker Service                 │
│                                                         │
│   • Lightweight container image (<500 MB base)          │
│   • Multi-stage build with non-root user (UID 1000)     │
│   • Auto-caches artifacts in /artifacts volume          │
│   • Peak Serving RAM: ~10.5 GB                          │
└─────────────────────────────────────────────────────────┘
```

1. **Clean Image Separation**: Large model weights and index binaries are **never committed to Git** and **never baked into Docker layers**.
2. **Dynamic Provisioning**: `src/legalrag/api/provisioning.py` checks local volume cache; if missing, it pulls from Hugging Face Hub using `huggingface_hub.hf_hub_download`.
3. **Fail-Closed Verification**: Startup readiness probes verify checksums and chunk count consistency ($N = 538,079$) before marking `/ready` as healthy.
