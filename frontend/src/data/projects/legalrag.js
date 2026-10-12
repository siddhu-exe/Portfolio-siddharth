import { TODO } from './schema.js';

// Copy comes from the LegalRAG design (Laptop v2 / Mobile v2). Result numbers
// (scoreboard + judge scores) are from projects/LegalRAG/PORTFOLIO_SITE_GUIDE.md
// "Key results" — the design left them as [—].
export default {
  slug: 'legalrag',
  title: 'LegalRAG',
  tagline:
    'Hybrid-retrieval question answering over 100,000 Indian High Court judgments, with every answer citing its sources.',
  year: 2026,
  links: {
    demo: 'https://legalrag-six.vercel.app',
    github: 'https://github.com/siddhu-exe/LegalRag',
  },
  demoNote: 'Demo runs on demand',
  // Shelf popup only (data/bookPreview.js); the project page ignores this block.
  preview: {
    summary:
      'A BM25 + BGE hybrid retriever, RRF fusion and a cross-encoder reranker feed a Groq-hosted LLM. A 497-question benchmark measures recall, faithfulness and citation correctness.',
    image: {
      src: '/images/legalrag/10_ui_grounded_answer_citations.png',
      alt: 'LegalRAG interface showing a synthesized answer with citation badges.',
    },
    caption: 'LegalRAG answering a case-law question with citations',
    stats: [
      { value: '100,000', label: 'High Court judgments', short: 'Judgments' },
      { value: '538,079', label: 'Searchable chunks', short: 'Chunks' },
      { value: '497', label: 'Benchmark questions', short: 'Eval questions' },
    ],
    stack: ['Python', 'FastAPI', 'FAISS', 'BM25', 'Groq', 'React', 'BGE', 'Cross-Encoder', 'Docker', 'AWS EC2'],
  },
  meta: {
    role: TODO, // TODO: your role on this project
    timeline: TODO, // TODO: start – end
    deployedOn: 'AWS EC2 · FastAPI + React',
  },
  stats: [
    { value: '100,000', label: 'High Court judgments' },
    { value: '538,079', label: 'Searchable chunks' },
    { value: '497', label: 'Benchmark questions' },
    { value: '5', label: 'Pipeline stages' },
  ],
  overview: {
    lead: 'LegalRAG answers legal questions over 538,079 chunks of court judgments. Its real focus is measurement: how good the answers are, and where they fail.',
    leadAccent: 'measurement',
    approach:
      'A BM25 + dense (BGE) hybrid retriever feeds Reciprocal Rank Fusion and a cross-encoder reranker. A Groq-hosted LLM writes an answer that cites its passages.',
    evaluation:
      'A 497-question evidence-grounded benchmark scores Recall@k, faithfulness, citation correctness, and where failures come from.',
    serving: 'A fail-closed FastAPI backend with per-stage latency reporting and a React interface.',
  },
  stack: [
    { group: 'Retrieval', items: ['BM25', 'BGE', 'FAISS', 'Cross-Encoder'] },
    { group: 'Generation', items: ['Groq'] },
    { group: 'Serving', items: ['Python', 'FastAPI', 'Docker', 'AWS EC2'] },
    { group: 'Interface', items: ['React'] },
  ],
  chapters: {
    architecture: {
      subtitle: 'How a question becomes a cited answer.',
      flow: [
        { kind: 'Input', title: 'Question', sub: 'user query' },
        {
          parallel: [
            { kind: 'Lexical', title: 'BM25', sub: 'exact terms' },
            { kind: 'Dense', title: 'BGE + FAISS', sub: 'meaning' },
          ],
        },
        { kind: 'Fuse', title: 'RRF', sub: 'k = 60' },
        { kind: 'Rerank', title: 'Cross-encoder', sub: 'MiniLM-L6' },
        { kind: 'Generate', title: 'Groq LLM', sub: 'top-5 context' },
        { kind: 'Output', title: 'Cited answer', sub: 'sources linked' },
      ],
      flowCaption: 'Request path, left to right.',
      decisions: [
        {
          title: 'Hybrid retrieval, not dense-only.',
          why: 'Legal text mixes exact references (sections, case names) with paraphrased reasoning. BM25 catches the first, dense embeddings the second.',
        },
        {
          title: 'Every answer cites its passages.',
          why: 'A legal answer is only useful if the reader can check it. Citations also make faithfulness measurable.',
        },
      ],
    },
    dataPipeline: {
      subtitle: 'From raw judgments to 538,079 searchable chunks.',
      steps: [
        { title: 'Source', body: '100,000 judgments from Indian High Courts.' },
        {
          title: 'Chunk',
          body: 'Recursive splitter: 1,200 characters, 200 overlap, 100 minimum → 538,079 chunks.',
        },
        { title: 'Index', body: 'BM25 for keywords, plus a FAISS inner-product index over BGE-base embeddings.' },
      ],
      figure: {
        src: '/images/legalrag/02_data_ingestion_indexing_pipeline.png',
        caption: 'Corpus ingestion, cleaning, chunking and index building.',
        alt: 'Diagram of the LegalRAG data pipeline: judgments are ingested, cleaned, split into chunks, and indexed for BM25 and dense search.',
      },
      footprintTitle: 'Index footprint',
      footprint: [
        { label: 'Dense index', value: '1.65 GB', percent: 100 },
        { label: 'BM25 index', value: '579 MB', percent: 35 },
        { label: 'Chunk store', value: '261 MB', percent: 16 },
      ],
      footprintNote: 'About 2.5 GB of index artifacts in total.',
    },
    machineLearning: {
      subtitle: 'Retrieval, reranking, and how the whole system is graded.',
      highlight: {
        eyebrow: 'The benchmark',
        value: '497',
        label: 'evidence-grounded questions, each tied to the passage that answers it.',
        chips: ['fact', 'reasoning', 'legal provision', 'outcome', 'multi-hop'],
      },
      listTitle: 'What the LLM judge scores',
      list: [
        { title: 'Answer relevance', direction: 'higher is better' },
        { title: 'Faithfulness', direction: 'higher is better' },
        { title: 'Citation correctness', direction: 'higher is better' },
        { title: 'Unsupported-claim rate', direction: 'lower is better' },
        { title: 'Hallucination rate', direction: 'lower is better' },
      ],
      finding:
        'The reranker improved Recall@1 over hybrid RRF but slightly lowered Recall@5 and Recall@10, likely because the MS-MARCO reranker was trained on web search, not legal text.',
    },
    platform: {
      subtitle: 'The API and interface people actually use.',
      figure: {
        src: '/images/legalrag/10_ui_grounded_answer_citations.png',
        mobileSrc: TODO, // TODO: tall phone screenshot (falls back to the laptop screenshot)
        caption: 'The React interface answering with citations tied to the retrieved passages.',
        alt: 'LegalRAG interface showing a synthesized answer with citation badges and a list of cited authorities.',
        windowTitle: 'legalrag — live demo',
      },
      notes: [
        { title: 'Fail-closed', body: 'If a stage fails, the API returns an error instead of an unsupported answer.' },
        {
          title: 'Per-stage latency',
          body: 'Every response reports how long retrieval, reranking and generation took.',
        },
        { title: 'On-demand hosting', body: 'Runs on AWS EC2 and is stopped when idle.' },
      ],
      latency: TODO, // TODO: median ms per stage — [{ stage: 'Retrieve', value: '… ms' }, Rerank, Generate, Total]
    },
    results: {
      subtitle: "What the benchmark shows, including what didn't work.",
      metrics: [
        { value: '3.40', label: 'Faithfulness (1–4)' },
        { value: '3.25', label: 'Citation correctness (1–4)' },
        { value: '22.7%', label: 'Hallucination rate' },
      ],
      table: {
        title: 'Retrieval scoreboard',
        columns: ['RETRIEVER', 'RECALL@1', 'RECALL@5', 'RECALL@10'],
        rows: [
          ['BM25 only', '42.66%', '53.32%', '57.75%'],
          ['Dense only (BGE)', '19.72%', '27.36%', '33.40%'],
          ['Hybrid RRF', '32.19%', '51.11%', '56.14%'],
          ['Hybrid RRF + reranker', '35.61%', '48.69%', '55.94%'],
        ],
      },
      next: TODO, // TODO: what you would do next (3 short items)
    },
  },
};
