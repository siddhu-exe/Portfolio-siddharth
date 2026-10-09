# System Architecture & Technical Specification

This document provides the complete architectural and mathematical specification for the **LegalRAG** retrieval and synthesis engine.

---

## 1. High-Level Architecture Overview

```text
                                  LEGALRAG RETRIEVAL CASCADE
                                  
 ┌────────────────┐
 │ User Ingestion │ ──► Validation & Length Gate (3 <= len <= 4000)
 └───────┬────────┘
         │
         ├───► [BM25 Sparse Retriever] ───────────────────────► Top-50 Sparse Candidates
         │     • BM25Okapi (k1=1.5, b=0.75)
         │     • Regex Tokenizer: [a-zA-Z0-9]+
         │
         └───► [Dense Vector Retriever] ──────────────────────► Top-50 Dense Candidates
               • Query Prefix: "Represent this sentence..."
               • BAAI/bge-base-en-v1.5 (768-dim, L2-normalized)
               • FAISS IndexFlatIP (Cosine Similarity)
                     │
                     ▼
         ┌───────────────────────────────┐
         │ Reciprocal Rank Fusion (RRF)  │ ──► Top-50 Unified Candidates (Recall@50 = 65.79%)
         │ Score(d) = Σ 1 / (60 + rank)  │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │ Neural Cross-Encoder Reranker │ ──► Top-5 Gold Chunks (Recall@1 = 35.61%)
         │ ms-marco-MiniLM-L-6-v2        │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  Grounded Generation (Groq)   │ ──► Grounded Legal Answer +
         │  qwen/qwen3.8-27b (temp=0.0)  │     Verified [Chunk ID: ...] Citations
         └───────────────────────────────┘
```

---

## 2. Retrieval Mathematics & Stage Mechanics

### 2.1 Lexical Sparse Retrieval: BM25Okapi
Lexical search operates over the tokenized representation of all 538,079 chunks. The BM25 score for query $Q = \{q_1, q_2, \dots, q_n\}$ and document chunk $D$ is:

$$\text{Score}_{\text{BM25}}(D, Q) = \sum_{i=1}^{n} \text{IDF}(q_i) \cdot \frac{f(q_i, D) \cdot (k_1 + 1)}{f(q_i, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$

- **Hyperparameters**: $k_1 = 1.5$ (term frequency saturation), $b = 0.75$ (document length penalization).
- **Tokenization Strategy**: Lowercased regular expression matching alphanumeric sequences `\b[a-zA-Z0-9]+\b`. This preserves section numbers (e.g. `138`, `302`, `498a`) and act acronyms (`ipc`, `crpc`, `cpc`, `ni`) without subword fragment dilution.
- **Top-$K$ Pool**: 50 candidates.

### 2.2 Dense Semantic Retrieval: BGE-Base & FAISS
Dense semantic search encodes semantic meaning into a 768-dimensional latent space.
- **Model**: `BAAI/bge-base-en-v1.5` (768 dimensions, 12 layers, 110M parameters).
- **Instruction Query Prefix**: As specified by BGE architecture guidelines, all search queries are prefixed with:
  ```text
  "Represent this sentence for searching relevant passages: "
  ```
- **Vector Metric**: Cosine similarity computed via inner product (`faiss.IndexFlatIP`) over L2-normalized embeddings:

$$\text{Sim}_{\text{Dense}}(q, d) = \langle \mathbf{e}_q, \mathbf{e}_d \rangle = \sum_{j=1}^{768} e_{q,j} \cdot e_{d,j} \quad \text{where } \|\mathbf{e}_q\|_2 = \|\mathbf{e}_d\|_2 = 1.0$$

- **Top-$K$ Pool**: 50 candidates.

### 2.3 Hybrid Fusion: Reciprocal Rank Fusion (RRF)
To merge sparse lexical scores (unbounded positive values) and dense cosine similarities ($[-1, 1]$) without calibration drift, LegalRAG applies **Reciprocal Rank Fusion**:

$$\text{Score}_{\text{RRF}}(d) = \sum_{m \in \{\text{BM25}, \text{Dense}\}} \frac{1}{k + \text{rank}_m(d)}$$

- **Constant $k$**: Set to **60**.
- **Candidate Pool**: Unions the top-50 from BM25 and top-50 from Dense, sorting descending by $\text{Score}_{\text{RRF}}(d)$ to yield the **Top-50 unified candidates**.
- **Empirical Impact**: Broadens overall candidate recall to **65.79% at Top-50**.

### 2.4 Neural Cross-Encoder Reranking
While bi-encoders encode query and document independently, cross-encoders perform full joint self-attention across the concatenated pair $(q, d)$:

$$\text{Score}_{\text{CE}}(q, d) = \text{Softmax}\left( \mathbf{W} \cdot \text{Transformer}([CLS] \circ q \circ [SEP] \circ d \circ [SEP]) \right)$$

- **Model**: `cross-encoder/ms-marco-MiniLM-L-6-v2` (6 layers, 384 hidden dimensions, 22.7M parameters).
- **Sequence Length**: Max 512 tokens.
- **Input**: Top-50 candidates from RRF.
- **Output**: Top-5 highest scoring chunks selected as context for generation.
- **Empirical Impact**: Improves Top-1 precision by **+3.42 percentage points** (32.19% $\to$ 35.61%).

---

## 3. Context Construction & Generation Contract

### 3.1 Prompt Template & Evidence Delimiters
The Top-5 reranked chunks are structured with explicit chunk boundaries to enforce deterministic citation anchoring:

```text
You are a legal research assistant analyzing Indian High Court judgments.
Answer the question based ONLY on the provided context passages.

Context:
--- Chunk ID: WBCHCJ0003822020_1_2020-01-28_0 ---
Calcutta High Court (CNR: WBCHCJ0003822020) | Date: 2020-01-28
[Excerpt text from judgment...]

--- Chunk ID: BOMHC010049212019_1_2019-06-14_2 ---
Bombay High Court (CNR: BOMHC010049212019) | Date: 2019-06-14
[Excerpt text from judgment...]

Instructions:
1. Provide a direct, well-reasoned answer grounded entirely in the context above.
2. Cite every factual holding or statutory point with the exact chunk tag: [Chunk ID: <chunk_id>].
3. If the context does not contain sufficient facts to answer the question, state:
   "The provided judgment context does not contain sufficient evidence to answer this inquiry."
4. Do NOT invent case names, dates, or legal provisions not found in the excerpts.
```

### 3.2 LLM Generation Engine
- **Inference Provider**: Groq Cloud API via official `groq` SDK.
- **Model**: `qwen/qwen3.8-27b` (configured via `GROQ_MODEL_NAME`).
- **Sampling Parameters**: `temperature=0.0` (greedy decoding for maximum reproducibility and factual grounding), `max_tokens=1024`.
- **Client Resilience**: 30-second API timeout with bounded exponential backoff retries and strict exception shielding.

---

## 4. API Specification & Data Contracts

### 4.1 Request Contract (`POST /query`)
```json
{
  "question": "What are the mandatory notice requirements under Section 138 of the Negotiable Instruments Act?"
}
```
- **Validation**: Strict string length validation (3 to 4,000 characters). Extra attributes trigger HTTP `422 Unprocessable Entity`.

### 4.2 Response Contract
```json
{
  "answer": "Under Section 138 of the Negotiable Instruments Act, the payee must issue a demand notice in writing within 30 days of receiving the dishonour memo [Chunk ID: WBCHCJ0003822020_1_2020-01-28_0]. The drawer is afforded a 15-day cure period to discharge the cheque liability [Chunk ID: BOMHC010049212019_1_2019-06-14_2].",
  "citations": [
    {
      "chunk_id": "WBCHCJ0003822020_1_2020-01-28_0",
      "cnr": "WBCHCJ0003822020",
      "court_code": "19_16",
      "decision_date": "2020-01-28",
      "title": "State of West Bengal v. S. Mukherjee"
    },
    {
      "chunk_id": "BOMHC010049212019_1_2019-06-14_2",
      "cnr": "BOMHC010049212019",
      "court_code": "10_8",
      "decision_date": "2019-06-14",
      "title": "ABC Enterprise v. XYZ Traders"
    }
  ],
  "retrieved_chunk_ids": [
    "WBCHCJ0003822020_1_2020-01-28_0",
    "BOMHC010049212019_1_2019-06-14_2",
    "DLHC010029182018_1_2018-09-12_1",
    "MADHC020194822017_1_2017-03-22_4",
    "GUJHC010019282021_1_2021-11-05_0"
  ],
  "retrieve_ms": 2763.4,
  "rerank_ms": 1496.2,
  "generate_ms": 1210.1,
  "total_ms": 5469.7,
  "status": "ok"
}
```

---

## 5. Failure Handling & Observability

```text
┌──────────────────┐
│  Client Request  │
└────────┬─────────┘
         ▼
┌──────────────────┐     Invalid Query Length / Extra Keys
│ Validation Gate  │ ──────────────────────────────────────────► HTTP 422
└────────┬─────────┘
         ▼
┌──────────────────┐     Missing Artifacts / Pipeline Not Ready
│ Readiness Probe  │ ──────────────────────────────────────────► HTTP 503
└────────┬─────────┘
         ▼
┌──────────────────┐     BM25 / FAISS / Cross-Encoder Crash
│ Retrieval Engine │ ──────────────────────────────────────────► HTTP 500 (Sanitized)
└────────┬─────────┘
         ▼
┌──────────────────┐     Groq 404 / 502 / Context Overflow
│ Generation Engine│ ──────────────────────────────────────────► HTTP 502 (Shielded)
└────────┬─────────┘
         ▼
┌──────────────────┐
│ 200 OK Response  │ ──► Monotonic Timers & Verified Citations
└──────────────────┘
```

1. **HTTP 422**: Validation error on query length (<3 or >4000 characters) or unrecognized body fields.
2. **HTTP 503**: Service warming up or artifacts provisioning from Hugging Face Hub.
3. **HTTP 500**: Internal retrieval or reranker computation failure (sanitized error message with server-side stack trace logged).
4. **HTTP 502**: LLM provider failure or upstream API rate limit.
