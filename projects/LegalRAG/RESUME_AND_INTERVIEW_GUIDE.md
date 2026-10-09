# AI Engineering Resume & Technical Interview Guide

This guide provides targeted resume bullets, a 30-second elevator pitch, a LinkedIn project announcement, and comprehensive STAR-method technical interview walkthroughs for **LegalRAG**.

---

## 1. High-Impact Resume Bullet Points

### Option A: AI / GenAI Engineer Focus
- Engineered **LegalRAG**, an autonomous judicial retrieval and synthesis engine over **100,000 Indian High Court judgments** (538,079 chunks) across 24 state High Courts.
- Architected a multi-stage hybrid retrieval cascade coupling **BM25Okapi** ($k_1=1.5, b=0.75$) with **BAAI/bge-base-en-v1.5** via **Reciprocal Rank Fusion ($k=60$)** and neural cross-encoder reranking, achieving **65.79% Candidate Recall@50** and a **+3.42pp Top-1 precision boost**.
- Built an evidence-grounded gold evaluation benchmark of **497 questions** and automated multi-criteria LLM judge, demonstrating an **80.2% RAG success rate**, **89.2% factual faithfulness**, and **93.8% citation accuracy**.
- Deployed a production FastAPI container with thread-safe singleton DI, monotonic per-stage latency telemetry (`retrieve_ms`, `rerank_ms`, `generate_ms`), and on-demand Hugging Face Hub artifact provisioning.

### Option B: Retrieval & Systems Engineering Focus
- Scaled an end-to-end legal information retrieval pipeline indexing 100k judgments into 538k chunks using custom regex tokenization and FAISS vector indexing (`IndexFlatIP`).
- Identified and benchmarked dense embedding limitations on statutory numbers, leveraging sparse-dense RRF fusion to outperform standalone dense retrieval by **+22.94 percentage points** in Top-1 recall.
- Conducted root-cause failure taxonomy across 497 judicial benchmark queries, isolating that **51.3%** of generation errors stem from retrieval omission rather than model hallucination.
- Containerized the serving stack on AWS EC2 with strict exception shielding and 120-second client timeouts, optimizing cloud compute with an on-demand standby architecture.

---

## 2. 30-Second Elevator Pitch

> *"I built LegalRAG, an AI retrieval and synthesis engine over 100,000 Indian High Court judgments and 538,000 chunks. Legal RAG fails with off-the-shelf embeddings because dense models can't distinguish between adjacent statutory sections like Section 302 vs 304 of the IPC.*
>
> *I solved this with a hybrid retrieval cascade combining BM25, BGE-Base vector search, Reciprocal Rank Fusion, and cross-encoder reranking. On a 497-question gold benchmark, this achieved 65.8% candidate recall and an 80.2% RAG success rate with verifiable paragraph citations. Most importantly, I built an automated evaluation harness proving that 51% of legal RAG failures are caused by upstream retrieval omissions, not LLM hallucinations."*

---

## 3. LinkedIn Project Announcement Template

```markdown
🚀 Excited to open-source LegalRAG — an Autonomous Judicial Retrieval & Evidence-Grounded Synthesis Engine over 100,000 Indian High Court Judgments!

🔍 The Problem:
Standard semantic search struggles with legal queries. Off-the-shelf embedding models lack statutory domain nuance and confuse specific section numbers (e.g., Section 138 of the NI Act). In law, an ungrounded citation is worse than no answer.

⚡ What I Built:
1. Dual-Index Retrieval Cascade: Merged BM25 lexical search (regex tokenized) with BAAI/bge-base-en-v1.5 dense vectors via Reciprocal Rank Fusion (k=60), indexed over 538,079 chunks across 24 High Courts.
2. Neural Cross-Encoder Reranking: Applied ms-marco-MiniLM-L-6-v2, boosting Top-1 precision by +3.42pp.
3. Strict Evidentiary Contract: Grounded generation via Groq (Qwen 3.8-27b) with mandatory [Chunk ID] inline citations.
4. Gold Evaluation Benchmark: Constructed a 497-question evidence-grounded dataset with an automated multi-criteria LLM judge.

📊 Key Empirical Results:
• 65.79% Candidate Recall@50 (Hybrid-RRF)
• 80.2% Clean RAG Success Rate when gold chunk in Top-5
• 89.2% Factual Faithfulness & 93.8% Citation Syntactic Accuracy
• Root-cause analysis showing 51.3% of failures originate in retrieval omission, not generation hallucination.

🛠 Tech Stack: FastAPI, FAISS, PyTorch, Groq SDK, Docker, React, Tailwind CSS, Hugging Face Hub.

Check out the full case study, architecture diagrams, and code on GitHub:
👉 https://github.com/Siddharth23052005/LegalRAG

#AIEngineering #GenAI #RAG #MachineLearning #LegalTech #InformationRetrieval #FastAPI #LLMs
```

---

## 4. Technical Interview Q&A (STAR Method)

### Q1: Why did BM25 outperform Dense embeddings on Top-1 recall?
**Situation**: In our 497-question gold benchmark, BM25 achieved 42.66% Recall@1, whereas off-the-shelf BGE-base achieved only 19.72%.  
**Task**: Understand why dense semantic search underperformed and how to architect the retrieval pipeline.  
**Action**: I analyzed the query patterns and discovered that Indian legal queries heavily feature exact statutory numbers (e.g. *"Section 482 CrPC quashing petition"*). General dense embedding models are trained on contrastive semantic pairs, so "Section 482" and "Section 397" map closely in vector space despite having distinct legal consequences. BM25 with regex alphanumeric tokenization preserves statutory tokens without subword dilution.  
**Result**: Rather than relying solely on dense search, I implemented a hybrid RRF architecture that combines BM25's lexical precision with dense conceptual coverage, achieving 65.79% Recall@50.

---

### Q2: Why did cross-encoder reranking improve Recall@1 but decrease Recall@5?
**Situation**: Reranking the hybrid RRF candidate pool improved Top-1 recall from 32.19% to 35.61% (+3.42pp), but Recall@5 slightly decreased from 51.11% to 48.69%.  
**Task**: Diagnose the cause of this domain-adaptation trade-off.  
**Action**: I inspected the cross-encoder architecture (`ms-marco-MiniLM-L-6-v2`). The model was pre-trained on general web search passages (MS-MARCO). In legal judgments, key holdings are often stated in formal, complex procedural syntax, whereas background facts are written simply. The web-trained cross-encoder prioritized simple descriptive passages over dense statutory holdings for positions 2–5, while still successfully ranking the absolute best match at position 1.  
**Result**: I documented this trade-off in the system architecture and established domain-specific cross-encoder fine-tuning as the primary roadmap item.

---

### Q3: How did you design the evaluation benchmark without data contamination?
**Situation**: Evaluating RAG systems on synthetic queries often leads to ungrounded or circular benchmarks.  
**Task**: Build an evidence-grounded evaluation benchmark across diverse legal inquiry types.  
**Action**: I sampled 500 candidate questions round-robin across 24 High Court jurisdictions. I engineered `find_gold_chunks`, an automated sliding-window phrase matcher (window sizes 60, 40, 25, 15, 10 words) that verified whether candidate supporting passages actually existed verbatim in the corpus chunks. Three candidates that failed verification were eliminated, producing a clean 497-question gold benchmark (`gold_eval.json`) spanning 5 legal inquiry types.  
**Result**: This prevented hallucinated gold standards and enabled rigorous LLM-as-a-judge scoring across relevance, faithfulness, citation correctness, and hallucination rates.

---

### Q4: How did you design the production serving architecture and handle cold starts?
**Situation**: The dual indexes (`bm25.pkl` 579MB, `dense.index` 1.65GB, `legal_chunks.parquet` 261MB) require ~10.5 GB RAM and would bloat Docker images if baked into container layers.  
**Task**: Deploy a lightweight, reproducible containerized backend with fast local development.  
**Action**: I designed a dynamic artifact provisioning layer (`provisioning.py`) that checks local volume mounts and pulls missing artifacts on-demand from the Hugging Face Hub (`siddhu23/LegalRag_Dataset`). I built a thread-safe singleton dependency injection system in FastAPI that supports a fail-closed `production` mode and an instantaneous `local_stub` mode for fast unit testing.  
**Result**: Docker build times dropped from minutes to seconds (<500MB image), and unit test suites execute in <500ms without model downloads.

---

### Q5: What was the main takeaway from your root-cause failure taxonomy?
**Situation**: LLMs are often blamed for hallucinating in production RAG systems.  
**Task**: Quantitatively categorize why answers failed across all 497 benchmark questions.  
**Action**: I classified every failure into a 5-category taxonomy: Retrieval Omission, Clean Success, Low Relevance, Context Formatting, and Grounding Failure.  
**Result**: The evaluation showed that **51.31% (255/497)** of failures were caused by the target judgment missing from the retrieved Top-5 context. When the target judgment was present, the LLM achieved an **80.2% clean success rate** with only 8 grounding errors (1.6%). This proved that in legal RAG, hallucination is primarily an information retrieval recall problem.
