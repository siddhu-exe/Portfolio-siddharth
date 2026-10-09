# Engineering Case Study: LegalRAG
## Autonomous Judicial Retrieval & Evidence-Grounded Synthesis over 100,000 Indian High Court Judgments

**Author:** Siddharth Dongardive  
**Role:** AI Engineer / GenAI Systems Engineer  
**Repository:** [github.com/Siddharth23052005/LegalRAG](https://github.com/Siddharth23052005/LegalRAG)  
**Corpus Scale:** 100,000 Indian High Court Judgments · 538,079 Partitioned Chunks · 24 High Courts  

---

## 1. Executive Summary

Legal research in the Indian judicial system is notoriously complex: judgments frequently exceed 30–50 pages of dense, archaic terminology, procedural citations, and complex statutory references across 24 distinct High Court jurisdictions. Traditional dense semantic vector search frequently fails on legal queries because off-the-shelf embedding models lack domain specialization and miss exact statutory provisions (such as *"Section 138 of the Negotiable Instruments Act"* or *"Article 226 of the Constitution"*). Furthermore, standard RAG systems suffer from hallucinated legal holdings and ungrounded case citations.

**LegalRAG** solves this by implementing an end-to-end, evidence-grounded judicial retrieval and synthesis cascade over **100,000 High Court decisions (538,079 chunks)**. The system couples **BM25 lexical retrieval** with **BGE-Base dense vector search** using **Reciprocal Rank Fusion ($k=60$)**, neural cross-encoder reranking (`ms-marco-MiniLM-L-6-v2`), and strict citation-grounded LLM synthesis (`qwen/qwen3.8-27b` via Groq).

Benchmarked against an evidence-grounded dataset of **497 validated legal questions**, LegalRAG achieves:
- **65.79% Candidate Recall@50** via Hybrid-RRF (expanding candidate discovery beyond BM25's 63.98% and Dense's 44.67%).
- **+3.42 percentage point Top-1 Precision boost** via cross-encoder reranking (32.19% $\to$ 35.61%).
- **80.2% RAG Success Rate** when gold context is in Top-5, with **89.2% Factual Faithfulness** and **93.8% Citation Syntactic Accuracy**.
- **Root-cause error attribution**, demonstrating that **51.3%** of all downstream generation errors originate from upstream retrieval omission rather than LLM hallucination.

```text
[100k Judgments] ──► [538,079 Chunks] ──► [BM25 + FAISS Dense] ──► [RRF Fusion] ──► [Cross-Encoder] ──► [Grounded LLM] ──► [Answer + Citations]
```

---

## 2. Problem Statement & Challenges in Legal Information Retrieval

```
                    CHALLENGES IN INDIAN JUDICIAL RAG
                    
┌───────────────────────────┐      ┌───────────────────────────┐
│     Lexical Precision     │      │     Semantic Reasoning    │
│                           │      │                           │
│ • Exact statutory clauses │      │ • Ratio decidendi nuance  │
│ • Section / Act numbers   │      │ • Implicit legal concepts │
│ • Specific bench & dates  │      │ • Conceptual similarity   │
└─────────────┬─────────────┘      └─────────────┬─────────────┘
              │                                  │
              └──────────────► ◄─────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │       High Stakes for Grounding     │
            │                                     │
            │ • Hallucinated precedents are fatal │
            │ • Must cite exact verifiable chunks │
            │ • Strict evidence boundaries        │
            └─────────────────────────────────────┘
```

When building AI systems for judicial analysis in India, three primary obstacles arise:

1. **The Statutory Specificity Problem (Dense Blindness)**: General-purpose dense embeddings (e.g., OpenAI `text-embedding-3`, `bge-base-en-v1.5`) map semantically similar sentences to adjacent vector spaces. In law, however, *Section 302 of the IPC* (Murder) and *Section 304 of the IPC* (Culpable Homicide not amounting to murder) share near-identical context embeddings despite representing fundamentally different statutory offences with distinct penal consequences. Pure dense retrieval produces false positives and scores poor Top-1 recall (**19.72%** on legal benchmarks).
2. **The Procedural Noise Problem**: Indian court orders contain significant boilerplate—appearances, procedural recitals, registrar notations, and OCR scanning artifacts. Without disciplined text cleaning and chunking boundaries, vector indexes get polluted with irrelevant headings and orphaned paragraphs.
3. **The Precedent Hallucination Risk**: LLMs prompted without strict citation constraints tend to fabricate realistic-sounding court case names, CNR numbers, and ratio decidendi. In judicial systems, an ungrounded citation is worse than no answer.

---

## 3. Data Engineering & Indexing at Scale

```
┌─────────────────────────┐
│ 100,000 High Court Docs │  Source: overthelex/indian-court-decisions (24 High Courts)
└────────────┬────────────┘
             │  Deterministic stream (buffer_size=50,000, seed=42)
             ▼
┌─────────────────────────┐
│  OCR & Control Clean    │  Stripped non-printable control chars [\x00-\x1f]
│  (0.76% corrupted drop) │  Artifact: legal_judgments_clean.parquet (485.4 MB)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   LegalChunker Engine   │  chunk_size=1200 chars, chunk_overlap=200 chars, min_length=100
│     (538,079 Chunks)    │  Artifact: legal_chunks.parquet (260.7 MB)
└────────────┬────────────┘
             │
      ┌──────┴──────────────────────────┐
      ▼                                 ▼
┌─────────────────────────┐   ┌───────────────────────────┐
│  BM25 Tokenized Index   │   │  BGE-Base Vector Shards   │
│  Regex [a-zA-Z0-9]+     │   │  768-dim L2-normalized    │
│  k1=1.5, b=0.75         │   │  2x Tesla T4 GPU Compute  │
│  bm25.pkl (578.8 MB)    │   │  dense.index (1.65 GB)    │
└─────────────────────────┘   └───────────────────────────┘
```

### 3.1 Corpus Selection & Cleaning
We ingested **100,000 judgments** from `overthelex/indian-court-decisions` spanning 24 state High Courts (Allahabad, Calcutta, Bombay, Madras, Gujarat, Madhya Pradesh, Delhi, Kerala, Punjab & Haryana, Patna, etc.).
- **Sanitization Gate**: Profiling identified that **762 documents (0.76%)** contained corrupted control character sequences (such as non-printable ASCII `\x00-\x08`, `\x0b`, `\x0c`, `\x0e-\x1f`). A regex filter cleaned these while preserving quotation marks, paragraph structure, and statutory numbering.
- **Clean Parquet**: Serialized to `legal_judgments_clean.parquet` (485.4 MB).

### 3.2 Partitioning with `LegalChunker`
Legal arguments develop over multiple paragraphs. A window that is too small splits statutes from their application; a window that is too large dilutes dense vector representations.
- **Splitter**: `RecursiveCharacterTextSplitter` (separators: `["\n\n", "\n", " ", ""]`)
- `chunk_size`: **1,200 characters** (~200–250 tokens)
- `chunk_overlap`: **200 characters** (~35–40 tokens)
- `min_chunk_length`: **100 characters** (discards orphan headings/page numbers)
- **Output Corpus**: **538,079 Chunks** serialized in `legal_chunks.parquet` (260.7 MB).

### 3.3 Dual-Index Serialization
1. **Sparse Lexical Index (`bm25.pkl`, 578.8 MB)**: Built with `rank-bm25` using `BM25Okapi` ($k_1=1.5, b=0.75$) over lowercased regex tokens `[a-zA-Z0-9]+`.
2. **Dense Vector Index (`dense.index`, 1.65 GB)**: Embeddings generated with `BAAI/bge-base-en-v1.5` (768 dimensions) sharded across 2 × Tesla T4 GPUs into 108 `.npy` files and indexed into a `faiss.IndexFlatIP` inner product structure.
3. **Serving Provisioning**: All artifacts are provisioned from the Hugging Face Hub (`siddhu23/LegalRag_Dataset`) dynamically at container startup, ensuring clean, lightweight container builds.

---

## 4. The Hybrid Retrieval Cascade

```text
               User Inquiry: "Section 138 NI Act mandatory notice requirements"
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
         BM25 Lexical Search                            Dense Semantic Search
       (Exact Section Matching)                       (BAAI/bge-base-en-v1.5)
                 │                                               │
         Top-50 Sparse Pool                              Top-50 Dense Pool
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                             Reciprocal Rank Fusion
                                (RRF Constant k=60)
                                         │
                             Top-50 Merged Candidates
                                (Recall@50 = 65.79%)
                                         │
                                         ▼
                              Cross-Encoder Reranker
                            (ms-marco-MiniLM-L-6-v2)
                                         │
                                 Top-5 Gold Chunks
                                (Recall@1 = 35.61%)
                                         │
                                         ▼
                             Grounded Groq LLM Engine
                             (qwen/qwen3.8-27b, temp=0)
                                         │
                                         ▼
                             Answer with Inline Citations
                             [Chunk ID: WBCHCJ0003822020...]
```

### Stage 1: Dual Lexical & Semantic Retrieval
When a query arrives, it runs against both indexes in parallel:
- **BM25 Search**: Matches statutory keywords, legal numbers, case titles, and section codes.
- **Dense BGE Search**: Matches high-level legal questions and semantic meanings using the BGE search instruction prefix: `"Represent this sentence for searching relevant passages: "`.

### Stage 2: Reciprocal Rank Fusion (RRF)
BM25 scores (unbounded positive floats) and FAISS inner-product scores (cosine similarities in $[-1, 1]$) have incompatible score distributions. Rather than fragile min-max normalization, we combine them via **Reciprocal Rank Fusion**:

$$\text{Score}_{\text{RRF}}(d) = \frac{1}{60 + \text{rank}_{\text{BM25}}(d)} + \frac{1}{60 + \text{rank}_{\text{Dense}}(d)}$$

Where $k=60$ prevents top-ranked outliers in one list from dominating candidates that appear consistently across both. RRF broadens the Top-50 candidate pool to **65.79% recall**.

### Stage 3: Neural Cross-Encoder Reranking
While bi-encoders (Dense) compress documents into isolated vectors, a **Cross-Encoder** (`cross-encoder/ms-marco-MiniLM-L-6-v2`) performs joint full self-attention over the query and candidate chunk simultaneously ($(\text{query}, \text{chunk})$ pair). It scores all Top-50 candidates and selects the **Top-5 most relevant passages**.

### Stage 4: Grounded Synthesis with Citation Contract
The Top-5 retrieved chunks are formatted into the LLM system context with explicit chunk identifiers. Groq (`qwen/qwen3.8-27b`) is instructed under a strict evidentiary contract:
1. Every claim must be grounded in the supplied context.
2. Every legal holding must include an inline citation `[Chunk ID: <id>]`.
3. If the context is insufficient, explicitly acknowledge the limitation rather than hallucinating.

---

## 5. Empirical Evaluation & Key Research Findings

To evaluate the system without subjective bias, we created a **497-question evidence-grounded gold benchmark** (`gold_eval.json`) with verified supporting text passages across 5 distinct judicial question types.

### 5.1 Retrieval Scoreboard Comparison

| Retriever Method | Recall@1 | Recall@5 | Recall@10 | Recall@50 | Key Mechanism |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **BM25 Lexical** | **42.66%** | **53.32%** | **57.75%** | 63.98% | Exact statutory clause & section matching |
| **Dense (BGE-Base)** | 19.72% | 27.36% | 33.40% | 44.67% | Semantic conceptual matching (un-tuned) |
| **Hybrid RRF ($k=60$)** | 32.19% | 51.11% | 56.14% | **65.79%** | Maximum candidate pool breadth |
| **Hybrid + Cross-Encoder** | **35.61%** | 48.69% | 55.94% | **65.79%** | **+3.42pp Top-1 precision improvement** |

```
RETRIEVAL RECALL@K COMPARISON
─────────────────────────────────────────────────────────────────────────────
Recall@1:
  BM25:           █████████████████████ 42.66%
  Dense (BGE):    ██████████ 19.72%
  Hybrid RRF:     ████████████████ 32.19%
  Cross-Encoder:  ██████████████████ 35.61% (+3.42pp over RRF)

Recall@50:
  BM25:           ███████████████████████████████ 63.98%
  Dense (BGE):    ██████████████████████ 44.67%
  Hybrid RRF:     ████████████████████████████████ 65.79% (Best candidate pool)
```

### 5.2 Technical Insight: The Reranker Recall@5 Trade-off
An important empirical finding from our benchmark is that while the cross-encoder improved **Recall@1 (+3.42pp)** over Hybrid RRF, it experienced a minor drop at **Recall@5 (51.11% $\to$ 48.69%)**.

**Root Cause**: `ms-marco-MiniLM-L-6-v2` is pre-trained on general web search (MS-MARCO). In general web corpora, short descriptive paragraphs are rewarded. In specialized Indian legal corpora, key statutory holdings are often embedded in complex procedural sentences. The generic cross-encoder occasionally prioritized well-written background facts over dense statutory holdings. This transparent trade-off demonstrates the necessity of legal domain-specific cross-encoder fine-tuning for future iterations.

### 5.3 Downstream Generation Evaluation (LLM-as-a-Judge)

We deployed an independent automated LLM judge across all 497 benchmark questions evaluating six criteria:

| Evaluation Metric | Score / Rate | Percentage | Benchmark Assessment |
| :--- | :---: | :---: | :--- |
| **Factual Faithfulness** | **3.4004 / 4.0** | **85.0%** | Highly faithful to provided judgment chunks |
| **Citation Correctness** | **3.2515 / 4.0** | **81.3%** | Accurate and valid `[Chunk ID: ...]` references |
| **Answer Relevance** | **3.0966 / 4.0** | **77.4%** | Direct, comprehensive answers to judicial inquiries |
| **Overall Synthesis** | **3.0926 / 4.0** | **77.3%** | Holistic synthesis quality across 5 question types |
| **RAG Success Rate (Top-5 Context Present)** | **80.2%** | **80.2%** | 194 of 242 questions achieved clean, grounded success |
| **Unsupported Claim Rate** | **0.1489** | **14.9%** | Low rate of ungrounded statements |
| **Grounding Failure (Context Present)** | **8 / 497** | **1.61%** | Negligible hallucination when relevant context is provided |

### 5.4 Performance Breakdown by Legal Inquiry Type

| Question Type | Count | Relevance (1-4) | Faithfulness (1-4) | Citation (1-4) | Unsupported Claim Rate | Overall Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Legal Provision** | 80 | **3.5000** | **3.6625** | **3.6375** | **0.0906 (9.1%)** | **3.4375** |
| **Fact Inquiry** | 100 | 3.3300 | 3.4400 | 3.2700 | 0.1388 (13.9%) | 3.1400 |
| **Reasoning / Ratio** | 149 | 3.0604 | 3.5235 | 3.4027 | 0.1250 (12.5%) | 3.1007 |
| **Multi-Hop Synthesis** | 50 | 2.7600 | 3.4000 | 3.2600 | 0.1306 (13.1%) | 3.0200 |
| **Outcome / Decree** | 118 | 2.8136 | 3.0339 | 2.7797 | 0.2347 (23.5%) | 2.8390 |

---

## 6. Root-Cause Failure Analysis

```
FAILURE TAXONOMY (497 BENCHMARK QUESTIONS)
┌─────────────────────────────────────────────────────────────┐
│ Retrieval Omission (Target absent in Top-5) : 51.31% (255)  │
│ Clean Grounded Success                      : 39.03% (194)  │
│ Low Answer Relevance                        :  4.23% (21)   │
│ Context / Citation Syntax Error             :  3.82% (19)   │
│ Grounding Failure (Context present)         :  1.61% (8)    │
└─────────────────────────────────────────────────────────────┘
```

A crucial discovery from our evaluation taxonomy is that **51.31% (255 / 497)** of generation failures were caused directly by **retrieval omission** (the target judgment was not present in the Top-5 context).

When the target judgment *was* successfully retrieved into the Top-5 context (242 questions):
- **194 succeeded cleanly (80.2% success rate)**.
- **Only 8 queries (1.61%) produced hallucinated or ungrounded claims**.

**Core Takeaway**: In legal RAG, hallucination is primarily an **information bottleneck problem**, not a generation flaw. Improving candidate recall is the single highest-leverage optimization for legal AI systems.

---

## 7. Production Engineering & Serving Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           FastAPI Application                           │
│                                                                         │
│   GET /health    GET /ready             POST /query                     │
│  (Liveness)     (Deep Probe)     (Monitored End-to-End Pipeline)        │
│                                                 │                       │
│                         ┌───────────────────────┴───────────────────┐   │
│                         ▼                                           ▼   │
│             [Production Cascade]                            [Local Stubs]│
│         • BM25 + FAISS + Cross-Encoder                 • Instant Dry Run│
│         • Groq Qwen 3.8-27b (temp=0)                   • Unit Test Fast │
│         • Monotonic Latency Timers                     • Zero GPU Need  │
│                                                                         │
│   Telemetry: retrieve_ms | rerank_ms | generate_ms | total_ms           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.1 Production Invariants & Fail-Closed Safety
- **Dual-Mode Dependency Injection**: Thread-safe singleton lifecycle supporting fail-closed `production` mode (validates presence of all 538k chunk artifacts) and explicit `local_stub` mode (for instant unit testing without model downloads).
- **Strict Exception Shielding**: Raw provider exceptions (e.g. Groq 404/502 errors, token overflows) are captured and sanitized into structured HTTP error codes, preventing API secret leaks or unhandled crashes.
- **Monotonic Latency Instrumentation**: Every query records per-stage timing using `time.perf_counter()` (`retrieve_ms`, `rerank_ms`, `generate_ms`, `total_ms`).

### 7.2 Latency Profile on CPU Inference Stack

| Pipeline Stage | Mean Duration | Dominant Factor |
| :--- | :---: | :--- |
| **Query Validation & Prep** | 15 ms | Pydantic regex & string length checks |
| **Dense Search (FAISS IndexFlatIP)** | 139 ms | BGE query encoding + cosine similarity |
| **BM25 Lexical Search** | 2,624 ms | Tokenizing & scoring across 538,079 chunks on CPU |
| **Reciprocal Rank Fusion** | 0.1 ms | Merging & ranking dictionaries ($k=60$) |
| **Cross-Encoder Reranking** | 1,496 ms | Joint self-attention over Top-50 pairs |
| **Groq LLM Generation** | 1,200 ms | Qwen 3.8-27b inference at temp=0 |
| **Total End-to-End Latency** | **~5.47 s** | Production client recommended timeout: **120 s** |

---

## 8. Summary of Contributions & Technical Skills

1. **AI / GenAI Engineering**: Designed, benchmarked, and deployed a hybrid RAG system handling 100,000 court judgments and 538,079 chunks.
2. **Evaluation Infrastructure**: Built a 497-question gold evaluation benchmark and automated multi-criteria LLM judge with failure taxonomy attribution.
3. **Retrieval Engineering**: Mastered BM25 lexical indexing, dense vector search (FAISS), reciprocal rank fusion, and neural cross-encoder reranking.
4. **Production Architecture**: Engineered a production FastAPI service with strict error shielding, thread-safe dependency injection, and Docker multi-stage containerization.
5. **Empirical Rigor**: Documented domain-adaptation trade-offs, cold-start profiles, and retrieval bottleneck dynamics with full experimental honesty.
