# LegalRAG → Portfolio Site: Hand-off Guide (for an LLM / developer)

Everything needed to add **LegalRAG** as a new book on the Siddharth Dongardive portfolio site
(`/home/siddharth/Desktop/Projects/projects/Portfolio`) lives in this folder. Read this file top to bottom, then
follow the site's own guides: `Portfolio/docs/ADDING_PROJECTS.md` (shelf/book),
`Portfolio/docs/CHAPTER_PAGE.md` (gallery/page), `Portfolio/docs/PROJECT_GUIDE.md` (architecture).

Files here: `images/` (all visuals, see §5), `scripts/generate_portfolio_images.py` (regenerates the 8 charts),
and longer write-ups (`CASE_STUDY.md`, `SYSTEM_ARCHITECTURE.md`, `DATA_ENGINEERING_PIPELINE.md`,
`EMPIRICAL_EVALUATION.md`, `RESUME_AND_INTERVIEW_GUIDE.md`) plus `README.md` (GitHub-style showcase).

> **Accuracy warning.** Some older text in this folder overstates results (see §7). When writing site copy, use the
> numbers and wording in this guide, not the older docs.

---

## 1. Steps to add the project (summary)

1. Copy the images (§5) into `Portfolio/frontend/public/images/legalrag/`.
2. In `Portfolio/backend/data.py`:
   - add the tuple to `_CATEGORIES` (§3.1),
   - add a `_DETAILS["LegalRAG"]` entry incl. `gallery_overrides` (§3.2, §5),
   - add `_HEADER_META["LegalRAG"]` (§3.3),
   - set `links` (GitHub / demo) wherever other projects' links are set (`build_projects()` or a per-project
     override — check how existing projects do it).
3. Mirror it in `Portfolio/frontend/src/data/fallbackProjects.js`.
4. Restart the backend (`cd backend && uvicorn main:app --reload --port 8000`), open the shelf, click the book,
   then **View Full Project**; check each gallery section's layout (1 image = full width, 2 = side by side,
   3+ = scroll row).

The slug is auto-generated from the title; with title `LegalRAG` it should be `legalrag` — confirm in the API
(`GET /api/projects/legalrag`) before hard-coding image folder names. The image folder name should match the slug
(`/images/<slug>/…`, per CHAPTER_PAGE.md).

---

## 2. Project facts (single source of truth for copy)

| Field | Value |
|---|---|
| Name | LegalRAG |
| One-liner | Hybrid-retrieval, citation-grounded question answering over 100,000 Indian High Court judgments. |
| Role framing | **AI Engineer / GenAI Engineer** (applies pre-trained models; trains none). Never write "ML Engineer". |
| GitHub | https://github.com/siddhu-exe/LegalRag |
| Live demo | https://legalrag-six.vercel.app (React UI on Vercel) |
| Demo caveat | The FastAPI backend runs on an AWS EC2 `t3.xlarge` that is **stopped when idle** to save cost. When it is down the UI shows a standby screen and queries do not work. Mention this near the demo link. |
| Year | 2026 |
| Corpus | 100,000 judgments, 24 High Courts, source HF dataset `overthelex/indian-court-decisions` (`high_courts`, `train`) |
| Index size | 538,079 chunks (1,200 chars, 200 overlap) |
| Benchmark | 497 evidence-grounded gold questions, 5 types: Reasoning 149, Outcome 118, Fact 100, Legal Provision 80, Multi-Hop 50 |

### Tech stack (for `tech_stack` / chips — keep to ~8–10)
`Python`, `FastAPI`, `FAISS`, `BM25 (rank-bm25)`, `sentence-transformers (BGE)`, `Cross-Encoder`, `Groq`,
`React + TypeScript`, `Docker`, `AWS EC2`. Others if more room: `Pydantic v2`, `Hugging Face Hub`, `Vite`,
`Tailwind CSS`, `pytest`.

### How it works (5 stages)
1. **BM25** (k1=1.5, b=0.75, regex tokenizer) top-50.
2. **Dense** `BAAI/bge-base-en-v1.5` (768-d) + FAISS `IndexFlatIP`, top-50.
3. **Reciprocal Rank Fusion** (k=60) → 50 candidates.
4. **Cross-encoder rerank** `cross-encoder/ms-marco-MiniLM-L-6-v2` → top-5.
5. **Grounded generation** with Groq (`qwen/qwen3.8-27b`, temperature 0), then `[Chunk ID: …]` citations are
   extracted and any ID not in the top-5 context is dropped. API returns the answer, citations, and per-stage
   latency (`retrieve_ms`, `rerank_ms`, `generate_ms`, `total_ms`).

### Engineering highlights (true, defensible)
- **Evaluation harness is the differentiator**: Recall@k scoreboard for four retrievers + LLM-judge generation
  metrics + failure taxonomy on a 497-question benchmark whose gold chunks are substring-verified.
- **Fail-closed production service**: `production` mode never falls back to stub components; `/health` (liveness)
  vs `/ready` (503 until artifacts + models are loaded); sanitized error bodies (500 retrieval / 502 generation /
  503 not ready) so provider errors, keys, and paths never reach clients.
- **Artifacts provisioned at startup** from Hugging Face Hub (~2.5 GB, never baked into the Docker image).
- **Debugged real artifact-contract bugs** against production data (BM25 pickle format mismatch, missing BGE query
  instruction on dense queries) and pinned them with regression tests.
- Measured on CPU with the real index: ~10.5 GB peak RAM, ~29 s cold start, ~4.3 s retrieval+rerank per query
  (BM25 2.6 s, dense 0.14 s, rerank 1.5 s); typical end-to-end ~7–10 s including Groq.

### Key results (use these exact numbers)

Retrieval Recall@k (497 questions, judgment-level):

| Retriever | @1 | @5 | @10 | @50 |
|---|---|---|---|---|
| BM25 | **42.66%** | **53.32%** | **57.75%** | 63.98% |
| Dense (BGE) | 19.72% | 27.36% | 33.40% | 44.67% |
| Hybrid RRF | 32.19% | 51.11% | 56.14% | **65.79%** |
| Hybrid RRF + cross-encoder | 35.61% | 48.69% | 55.94% | **65.79%** |

Generation (LLM judge, 1–4 scale): relevance 3.10, faithfulness 3.40, citation correctness 3.25, overall 3.09;
unsupported-claim rate 14.9%; hallucination rate 22.7%.

Failure taxonomy (497 questions): retrieval failure 255 (51.3% of **all questions**), clean success 194 (39.0%),
low relevance 21, citation/context issue 19, grounding failure 8. When the right judgment **is** in the top-5
context, 194 of 242 (80.2%) answers are clean successes.

**Honest headline findings** (these make the case study credible — keep them):
- BM25 beats the dense model at top-1 (42.7% vs 19.7%): statutory section numbers need exact lexical match.
- RRF widens the candidate pool (65.8% @50), but the reranker trades recall for precision: Recall@1 +3.4pp
  (32.2% → 35.6%) yet Recall@5 −2.4pp (51.1% → 48.7%), because MS-MARCO is not adapted to Indian legal text.
- Retrieval, not the LLM, is the main bottleneck: of the 303 non-clean answers, 255 (≈84%) are retrieval failures.

---

## 3. Ready-to-paste data for `backend/data.py`

Adapt names/format to what the file actually uses; verify `_CATEGORIES` and the allowed `tag` values first.

### 3.1 `_CATEGORIES` tuple
Category: there is no GenAI category in the docs' examples (they show "Machine Learning"); check the file. Either add
to the closest existing category or add a new one such as `("Generative AI", "Systems built on top of language
models.", [...])` (see "Adding a new category" in ADDING_PROJECTS.md; optionally add `_APPROACH_STEPS`).

```python
("LegalRAG",
 ["Python", "FastAPI", "FAISS", "BM25", "BGE Embeddings", "Cross-Encoder", "Groq", "React", "Docker", "AWS EC2"],
 "A hybrid-retrieval RAG system over 100,000 Indian High Court judgments that answers legal questions with "
 "citations to the exact retrieved passages, evaluated on a 497-question gold benchmark.")
```

### 3.2 `_DETAILS["LegalRAG"]`
```python
"LegalRAG": {
    "subtitle": "Legal answers you can trace back to the judgment.",
    "description": (
        "LegalRAG answers legal questions over 100,000 Indian High Court judgments (538,079 searchable chunks). "
        "A BM25 + dense (BGE) hybrid retriever feeds Reciprocal Rank Fusion and a cross-encoder reranker, and a "
        "Groq-hosted LLM writes an answer that cites the passages it used. The project's focus is measurement: a "
        "497-question evidence-grounded benchmark scores retrieval Recall@k, answer faithfulness, citation "
        "correctness, and where failures come from. Served through a fail-closed FastAPI backend with per-stage "
        "latency reporting and a React interface."
    ),
    "problem": "Generic RAG struggles with legal text: exact statute numbers, long judgments, and the cost of an invented citation.",
    "data_text": "100,000 High Court judgments across 24 courts, cleaned and split into 538,079 overlapping chunks.",
    "metric": "65.8%",
    "metric_label": "Recall@50 of the correct judgment (hybrid RRF)",
    "reflection": "Retrieval, not the LLM, caused about 84% of the bad answers — so improving search mattered more than swapping models.",
    "published": True,
    "sort_order": 1,            # choose per site: flagship -> low number; renumbering shifts the others
    "tag": "NLP",               # or "AGENTS"/"APP" if NLP is not a valid tag in the file
    "spineColor": "#2B3A55",    # deep navy; any colour works, text contrast is automatic
    "result": "65.8% Recall@50 · 497-question benchmark",
    "gallery_overrides": { ... },   # see §5.3
},
```

### 3.3 `_HEADER_META`
```python
"LegalRAG": {"emoji": "⚖️", "year": 2026},   # if the multi-part emoji renders badly use "📜"
```

### 3.4 Links
`links.github = "https://github.com/siddhu-exe/LegalRag"`, `links.demo = "https://legalrag-six.vercel.app"`.

### 3.5 `fallbackProjects.js`
Mirror title, tech, description, `sortOrder`, `tag`, `published`, `spineColor`, `result`, links, and the gallery
image paths so the offline view matches.

---

## 4. Section copy for the gallery subtitles (optional, replaces the template text)

| key | Heading | Suggested subtitle |
|---|---|---|
| architecture | Architecture | How a question travels through hybrid retrieval, fusion, reranking, and cited generation. |
| pipeline | Data Pipeline | From 100,000 raw judgments to 538,079 searchable chunks, and what each request costs in time. |
| ml | Machine Learning | How each retriever and the generated answers were measured on 497 gold questions. |
| platform | Platform | The query console and the answer view with citations tied to source judgments. |
| results | Results | Where the system fails, and why retrieval is the bottleneck. |

(Gallery subtitles live in `_GALLERY_TEMPLATE` for all projects; only change per-project text if the site supports
it. Do not edit the shared template just for this project.)

---

## 5. Images — which one goes where

All files are in `portfolio/images/`. Copy the ones listed to `Portfolio/frontend/public/images/legalrag/` and
reference them as `/images/legalrag/<filename>`. PNGs are 300-DPI (large, 0.2–0.6 MB each); the 8 chart images also
exist as `.svg` (vector, same name) if a sharper or lighter file is preferred. Frame ratios: 1 image = 16:9,
2 images = 4:3 each, 3+ = scroll row — wide images are cropped/fitted by the frame, so check the preview.

### 5.1 Image catalogue

| File | Size | What it shows |
|---|---|---|
| `01_end_to_end_rag_architecture.png` | 4800×3000 | Full query path: BM25 + dense → RRF → cross-encoder → Groq → cited answer |
| `02_data_ingestion_indexing_pipeline.png` | 4800×2700 | Corpus ingestion, cleaning, chunking (538,079), index and artifact building |
| `03_retrieval_benchmark_comparison.png` | 4200×2400 | Recall@k for BM25 / Dense / RRF / reranked |
| `04_generation_eval_llm_judge.png` | 4800×2100 | LLM-judge scores (relevance, faithfulness, citation, overall) |
| `05_failure_taxonomy_distribution.png` | 4800×2100 | Root-cause failure breakdown (retrieval 51.3% of all questions) |
| `06_latency_waterfall_breakdown.png` | 4200×2100 | Per-stage latency waterfall |
| `07_question_type_performance.png` | 4200×2100 | Scores across the 5 legal question types |
| `08_citation_grounding_preview.png` | 4500×2550 | How `[Chunk ID]` citations are tied to retrieved passages |
| `09_ui_query_console.png` | 1351×699 | Real UI screenshot: query box + "Synthesize Precedents" |
| `10_ui_grounded_answer_citations.png` | 1351×700 | Real UI screenshot: synthesized answer with citation badges + cited authorities |
| `11_ui_synthesis_in_progress.png` | 1352×699 | Real UI screenshot: live 3-stage progress with timer |

(The three UI screenshots were copied from the repo-root files `page1.png`, `page2.png`,
`2026-09-25_00-49.png`; the originals are untouched.)

### 5.2 Where each is used

| Site slot | Image(s) | Reason |
|---|---|---|
| `thumbnail` / book-preview modal image | `09_ui_query_console.png` | Most recognisable single view of the product |
| Gallery `architecture` (1 image, 16:9) | `01_end_to_end_rag_architecture.png` | System overview |
| Gallery `pipeline` (2 images) | `02_data_ingestion_indexing_pipeline.png`, `06_latency_waterfall_breakdown.png` | Offline data pipeline + online request pipeline |
| Gallery `ml` (3 images, scroll row) | `03_retrieval_benchmark_comparison.png`, `04_generation_eval_llm_judge.png`, `07_question_type_performance.png` | Retrieval, generation, and per-type evaluation |
| Gallery `platform` (2 images) | `09_ui_query_console.png`, `10_ui_grounded_answer_citations.png` | The real interface |
| Gallery `results` (1 image, 16:9) | `05_failure_taxonomy_distribution.png` | The honest finding: retrieval is the bottleneck |
| Spare / optional | `08_citation_grounding_preview.png`, `11_ui_synthesis_in_progress.png` | Add `08` as a 4th `ml` image or swap into `platform` (making it 3 → scroll row); `11` shows the live progress state |

### 5.3 `gallery_overrides`
```python
"gallery_overrides": {
    "architecture": ["/images/legalrag/01_end_to_end_rag_architecture.png"],
    "pipeline": [
        "/images/legalrag/02_data_ingestion_indexing_pipeline.png",
        "/images/legalrag/06_latency_waterfall_breakdown.png",
    ],
    "ml": [
        "/images/legalrag/03_retrieval_benchmark_comparison.png",
        "/images/legalrag/04_generation_eval_llm_judge.png",
        "/images/legalrag/07_question_type_performance.png",
    ],
    "platform": [
        "/images/legalrag/09_ui_query_console.png",
        "/images/legalrag/10_ui_grounded_answer_citations.png",
    ],
    "results": ["/images/legalrag/05_failure_taxonomy_distribution.png"],
},
```
`thumbnail` (and legacy `heroImage`) are auto-generated placeholders; set them to
`/images/legalrag/09_ui_query_console.png` if the build code allows a per-project override — check `build_projects()`.

Copy command (from the LegalRAG repo root):
```bash
mkdir -p /home/siddharth/Desktop/Projects/projects/Portfolio/frontend/public/images/legalrag
cp portfolio/images/0[1-7]_*.png portfolio/images/09_*.png portfolio/images/10_*.png \
   /home/siddharth/Desktop/Projects/projects/Portfolio/frontend/public/images/legalrag/
```

---

## 6. Optional wording for the shelf row, book modal, and chapter page

- **Shelf `result` line** (one line, hide with `""`): `65.8% Recall@50 · 497-question benchmark`
- **Book modal / chapter intro**: the `description` in §3.2.
- **Three bullets if the site needs "highlights"**:
  - 100,000 judgments → 538,079 chunks, hybrid BM25 + BGE retrieval with RRF and cross-encoder reranking.
  - 497-question evidence-grounded benchmark with an LLM judge and a root-cause failure taxonomy.
  - Fail-closed FastAPI service with per-stage latency and a React UI; backend runs on EC2 and is off when idle.

---

## 7. Claims to avoid (found while auditing; also see `docs/WHAT_TO_FIX.md`)

- ❌ "51% of failures are retrieval" — 51.3% is the share of **all 497 questions**. Of failures it is ≈84%.
- ❌ "89.2% factual faithfulness" and "93.8% citation accuracy" (appear in `README.md`, `CASE_STUDY.md`,
  `RESUME_AND_INTERVIEW_GUIDE.md`): not backed by the evaluation tables. Use faithfulness **3.40/4** and citation
  correctness **3.25/4**, or the unsupported-claim rate 14.9%.
- ❌ "verified" / "verifiable" citations — the code only checks that the cited chunk ID is in the retrieved top-5; it
  does not check that the chunk supports the sentence. Say "citations tied to retrieved passages".
- ❌ "hallucination drops below 2% when context is present" — the table shows 8 of 242 (3.3%) severe cases.
- ❌ "Multi-stage Docker", "GitHub Actions CI", "React 18": the Dockerfile is single-stage, no CI workflow is in
  the repo, and the frontend uses React 19. The older `portfolio/README.md` still lists these.
- ❌ EC2 type: it is `t3.xlarge` (some older docs say `t4.xlarge`).
- ⚠️ Per `docs/WHAT_TO_FIX.md`, the same AI model wrote the benchmark questions, answered them, and graded the
  answers, and the deployed generation model (Qwen on Groq) was not the one benchmarked. If space allows, phrase results as "on the project's own benchmark".
- ⚠️ Don't present the live demo as always-on (see §2 caveat).
