// Used only if the backend is unreachable, so the shelf never renders empty.
const PALETTE = ['#D9834A', '#E4A356', '#7FA98F', '#6C8EBF', '#B5729B', '#C9695A', '#5C9EAD', '#D4A24E'];

// Library-binding spine colours for the Project Shelf (mirrors SPINE_COLORS in backend/data.py).
const SPINE_COLORS = ['#7A2E2A', '#2F4A3A', '#C9963C', '#263A52', '#B5533C', '#2B2724'];

const CATS = [
  {
    category: 'Data Analytics',
    projects: [
      { title: 'Customer Churn Analysis', tech: ['Pandas', 'SQL', 'Matplotlib'], sortOrder: 8, tag: 'SQL', published: false, spineColor: '#5C4A3A' },
      { title: 'Retail Sales Analysis', tech: ['Pandas', 'NumPy', 'Seaborn'], sortOrder: 9, tag: 'SQL', published: false, spineColor: '#3F5B54' },
    ],
  },
  {
    category: 'Data Visualization',
    projects: [
      { title: 'Sales Dashboard (Tableau)', tech: ['Tableau', 'SQL', 'Excel'], sortOrder: 10, tag: 'VIZ', published: false, spineColor: '#8C3B2E' },
      { title: 'IPL Data Visualization', tech: ['Python', 'Plotly', 'Pandas'], sortOrder: 11, tag: 'VIZ', published: false, spineColor: '#D9C3A0' },
    ],
  },
  {
    category: 'Machine Learning',
    projects: [
      {
        title: 'Delhi Air Quality Risk Forecasting',
        tech: ['Python', 'PostgreSQL', 'LightGBM', 'Statsmodels', 'FastAPI', 'React'],
        thumbnail: '/images/delhi-air-quality-risk-forecasting/40_dashboard_overview.png',
        sortOrder: 2,
        tag: 'ML',
        published: true,
        result: '+11% 24h skill vs persistence · MAE 98.24 → 34.11',
        spineColor: '#2F4A3A',
        emoji: '🌫️',
        year: 2026,
        description:
          'An end-to-end operational ML system and econometric audit delivering 1h/6h/24h air quality forecasts, automated CPCB/GRAP emergency risk alerts, and causal evaluation of Delhi\'s Diwali firecracker ban across 7 continuous monitoring stations.',
        links: {
          github: 'https://github.com/siddhu-exe/Air-Quality-Risk-Forecasting',
          demo: 'https://siddhu-exe-air-quality-risk-forecasting-dashboardapp-w5wwow.streamlit.app/',
          kaggle: 'https://www.kaggle.com/datasets/siddharthdongardive/delhi-air-quality-monitoring-dataset-2023-2026',
        },
        gallery: [
          {
            key: 'architecture',
            heading: 'Architecture',
            subtitle: 'The complete system architecture, from data collection to prediction.',
            images: ['/images/delhi-air-quality-risk-forecasting/10_architecture.png'],
          },
          {
            key: 'pipeline',
            heading: 'Data Pipeline',
            subtitle: 'From raw data to production-ready predictions and features.',
            images: ['/images/delhi-air-quality-risk-forecasting/20_data_model.png', '/images/delhi-air-quality-risk-forecasting/21_splits_timeline.png'],
          },
          {
            key: 'ml',
            heading: 'Machine Learning',
            subtitle: 'How the model learns, evaluates, and predicts outcomes.',
            images: ['/images/delhi-air-quality-risk-forecasting/30_skill_vs_persistence.png', '/images/delhi-air-quality-risk-forecasting/31_extrapolation_fix.png', '/images/delhi-air-quality-risk-forecasting/32_episode_forecast.png'],
          },
          {
            key: 'platform',
            heading: 'Platform',
            subtitle: 'Interactive dashboards and prediction experiences built for users.',
            images: ['/images/delhi-air-quality-risk-forecasting/40_dashboard_overview.png', '/images/delhi-air-quality-risk-forecasting/43_dashboard_model_health.png'],
          },
          {
            key: 'results',
            heading: 'Results',
            subtitle: 'The final outcome of the project and its key achievements.',
            images: ['/images/delhi-air-quality-risk-forecasting/50_alert_tradeoff.png', '/images/delhi-air-quality-risk-forecasting/51_diwali_identification.png'],
          },
        ],
      },
      {
        title: 'MineSafe AI',
        tech: ['React', 'FastAPI', 'MongoDB', 'XGBoost', 'Prophet', 'Keras', 'Isolation Forest', 'Groq', 'WebSocket'],
        thumbnail: '/images/minesafe-ai/10_architecture.png',
        sortOrder: 5,
        tag: 'ML',
        published: true,
        result: '4 trained models · 56K crack images · 60+ endpoints',
        spineColor: '#4A433C',
        emoji: '⛏️',
        year: 2026,
        description:
          'MineSafe AI (Rockefeller) is a React + FastAPI + MongoDB platform that scores landslide and rockfall risk for each mine zone and routes alerts to the right people. Four models sit behind one API: XGBoost for zone risk, an EfficientNetV2S crack-severity CNN, Prophet rainfall forecasts for 36 districts, and an Isolation Forest for blast anomalies. Crack photos, blasts and rainfall land on one map, and critical events reach workers through WebSocket and browser push, with Admin, Safety Officer and Field Worker roles. A college team project of four; Siddharth built the frontend, the backend and all four models.',
        links: { github: 'https://github.com/siddhu-exe/rockefeller', demo: null },
        gallery: [
          { key: 'architecture', heading: 'Architecture', subtitle: 'The complete system architecture, from data collection to prediction.', images: ['/images/minesafe-ai/10_architecture.png'] },
          { key: 'pipeline', heading: 'Data Pipeline', subtitle: 'From raw data to production-ready predictions and features.', images: ['/images/minesafe-ai/20_data_model.png', '/images/minesafe-ai/31_data_distribution.png'] },
          { key: 'ml', heading: 'Machine Learning', subtitle: 'How the model learns, evaluates, and predicts outcomes.', images: ['/images/minesafe-ai/32_ml_stack.png', '/images/minesafe-ai/35_crack_model.png', '/images/minesafe-ai/36_xgboost_results.png'] },
          { key: 'platform', heading: 'Platform', subtitle: 'Interactive dashboards and prediction experiences built for users.', images: ['/images/minesafe-ai/33_crack_workflow.png', '/images/minesafe-ai/34_roles.png'] },
          { key: 'results', heading: 'Results', subtitle: 'The final outcome of the project and its key achievements.', images: ['/images/minesafe-ai/30_risk_scoring.png'] },
        ],
      },
      {
        title: 'FIFA World Cup Predictor',
        tech: ['Python', 'XGBoost', 'scikit-learn', 'Pandas', 'NumPy'],
        thumbnail: '/images/fifa-world-cup-predictor/frontpage.png',
        sortOrder: 4,
        tag: 'ML',
        published: true,
        result: '91.7% knockout accuracy · ROC-AUC 0.90',
        spineColor: '#7A2E2A',
        emoji: '⚽',
        year: 2026,
        description:
          'Dual stage-aware XGBoost models predicting every match of the 48-team 2026 tournament, distilled through 10,000 Monte Carlo simulations into full championship odds.',
        links: {
          github: 'https://github.com/siddhu-exe/Fifa-predictor',
          demo: 'https://fifa-predictor-kohl.vercel.app',
        },
        gallery: [
          { key: 'architecture', heading: 'Architecture', subtitle: 'The complete system architecture, from data collection to prediction.', images: ['/images/fifa-world-cup-predictor/03_model_architecture.svg'] },
          { key: 'pipeline', heading: 'Data Pipeline', subtitle: 'From raw football data to production-ready predictions.', images: ['/images/fifa-world-cup-predictor/01_data_pipeline.svg', '/images/fifa-world-cup-predictor/02_feature_engineering.svg'] },
          { key: 'ml', heading: 'Machine Learning', subtitle: 'How the model learns, evaluates, and predicts tournament outcomes.', images: ['/images/fifa-world-cup-predictor/04_feature_importance.svg'] },
          { key: 'platform', heading: 'Platform', subtitle: 'Interactive dashboards and prediction experiences built for users.', images: ['/images/fifa-world-cup-predictor/05_monte_carlo.svg'] },
          { key: 'results', heading: 'Results', subtitle: 'The final outcome of the project and its key achievements.', images: ['/images/fifa-world-cup-predictor/06_simulation_results.svg'] },
        ],
      },
    ],
  },
  {
    category: 'Deep Learning',
    projects: [
      {
        title: 'BitcoinGraphGuard',
        tech: ['Python', 'XGBoost', 'PyTorch Geometric', 'FastAPI', 'SHAP', 'Captum', 'React', 'TypeScript', 'Docker', 'GitHub Actions'],
        thumbnail: '/images/bitcoingraphguard/card-thumbnail.png',
        sortOrder: 3,
        tag: 'ML',
        published: true,
        result: '0.80 PR-AUC · drift diagnosed · lag-safe monitoring',
        spineColor: '#7A4A12',
        emoji: '🛡️',
        year: 2026,
        description:
          'BitcoinGraphGuard is a Bitcoin fraud detector that knows when to stop trusting itself, built on real Elliptic++ data (203,769 transactions, 822,942 wallets, about 4.4M edges, 49 time steps) and tested on the future, never a random split. A tuned XGBoost scores 0.80 PR-AUC on steps 35-49 and beats the best graph model (0.62), but all four models collapse after step 43. Walk-forward retraining recovers performance only when labels arrive fast: 0.69 PR-AUC at a one-step label delay, 0.39 at two, 0.14 at three and 0.11 at five. The best model is served through a FastAPI service that labels each prediction with how reliable that time step has been, alongside a lag-safe drift monitor and a React dashboard.',
        links: { github: 'https://github.com/siddhu-exe/BitcoinGraphGuard', demo: 'https://bitcoin-graph-delta.vercel.app' },
        gallery: [
          { key: 'architecture', heading: 'Architecture', subtitle: 'The complete system architecture, from data collection to prediction.', images: ['/images/bitcoingraphguard/card-03_system_architecture.png'] },
          { key: 'pipeline', heading: 'Data Pipeline', subtitle: 'From raw data to production-ready predictions and features.', images: ['/images/bitcoingraphguard/03_regime_shift_per_step.png'] },
          { key: 'ml', heading: 'Machine Learning', subtitle: 'How the model learns, evaluates, and predicts outcomes.', images: ['/images/bitcoingraphguard/02_model_comparison.png', '/images/bitcoingraphguard/card-02_before_after_step43.png', '/images/bitcoingraphguard/card-01_label_delay_recovery.png'] },
          { key: 'platform', heading: 'Platform', subtitle: 'Interactive dashboards and prediction experiences built for users.', images: ['/images/bitcoingraphguard/07_ui_overview.png', '/images/bitcoingraphguard/06_monitoring_signal_tradeoff.png'] },
          { key: 'results', heading: 'Results', subtitle: 'The final outcome of the project and its key achievements.', images: ['/images/bitcoingraphguard/card-01_label_delay_recovery.png'] },
        ],
      },
      { title: "Alzheimer's MRI Detection", tech: ['TensorFlow', 'CNN', 'OpenCV'] },
      { title: 'Plant Disease Detection', tech: ['PyTorch', 'CNN', 'OpenCV'] },
    ],
  },
  {
    category: 'AI Applications',
    projects: [
      {
        title: 'LegalRAG',
        tech: ['Python', 'FastAPI', 'FAISS', 'BM25', 'BGE Embeddings', 'Cross-Encoder', 'Groq', 'React', 'Docker', 'AWS EC2'],
        thumbnail: '/images/legalrag/09_ui_query_console.png',
        sortOrder: 1,
        tag: 'NLP',
        published: true,
        result: '65.8% Recall@50 · 497-question benchmark',
        spineColor: '#263A52',
        emoji: '⚖️',
        year: 2026,
        description:
          "LegalRAG answers legal questions over 100,000 Indian High Court judgments (538,079 searchable chunks). A BM25 + dense (BGE) hybrid retriever feeds Reciprocal Rank Fusion and a cross-encoder reranker, and a Groq-hosted LLM writes an answer that cites the passages it used. The project's focus is measurement: a 497-question evidence-grounded benchmark scores retrieval Recall@k, answer faithfulness, citation correctness, and where failures come from. Served through a fail-closed FastAPI backend with per-stage latency reporting and a React interface. The live demo's backend runs on AWS EC2 and is stopped when idle, so queries only work while it is up.",
        links: {
          github: 'https://github.com/siddhu-exe/LegalRag',
          demo: 'https://legalrag-six.vercel.app',
        },
        gallery: [
          { key: 'architecture', heading: 'Architecture', subtitle: 'The complete system architecture, from data collection to prediction.', images: ['/images/legalrag/01_end_to_end_rag_architecture.png'] },
          { key: 'pipeline', heading: 'Data Pipeline', subtitle: 'From raw data to production-ready predictions and features.', images: ['/images/legalrag/02_data_ingestion_indexing_pipeline.png', '/images/legalrag/06_latency_waterfall_breakdown.png'] },
          { key: 'ml', heading: 'Machine Learning', subtitle: 'How the model learns, evaluates, and predicts outcomes.', images: ['/images/legalrag/03_retrieval_benchmark_comparison.png', '/images/legalrag/04_generation_eval_llm_judge.png', '/images/legalrag/07_question_type_performance.png'] },
          { key: 'platform', heading: 'Platform', subtitle: 'Interactive dashboards and prediction experiences built for users.', images: ['/images/legalrag/09_ui_query_console.png', '/images/legalrag/10_ui_grounded_answer_citations.png'] },
          { key: 'results', heading: 'Results', subtitle: 'The final outcome of the project and its key achievements.', images: ['/images/legalrag/05_failure_taxonomy_distribution.png'] },
        ],
      },
      {
        title: 'TruthMates',
        tech: ['CrewAI'],
        sortOrder: 6,
        tag: 'AGENTS',
        published: true,
        result: '10-agent CrewAI pipeline',
        spineColor: '#B5533C',
        description: 'A 10-agent CrewAI pipeline.',
      },
      {
        title: 'KalaChain',
        tech: [],
        sortOrder: 7,
        tag: 'APP',
        published: true,
        result: '1st place · HackX SFIT 2026',
        spineColor: '#C9963C',
        description: 'First-place project at HackX SFIT 2026.',
      },
      { title: 'RAG Chatbot', tech: ['LangChain', 'FastAPI', 'OpenAI'] },
      { title: 'AI Research Assistant', tech: ['LangGraph', 'RAG', 'Chroma'] },
    ],
  },
];

const DEFAULT_TAGS = {
  'Data Analytics': 'SQL',
  'Data Visualization': 'VIZ',
  'Machine Learning': 'ML',
  'Deep Learning': 'DL',
  'AI Applications': 'NLP',
};

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Same ordering rule as backend/data.py: by sortOrder, unlisted projects last
// in their original order (Array#sort is stable).
const flat = CATS.flatMap(({ category, projects: catProjects }) =>
  catProjects.map((p) => ({ ...p, category }))
).sort((a, b) => (a.sortOrder ?? 1000) - (b.sortOrder ?? 1000));

const projects = flat.map((p, i) => {
  const id = i + 1;
  const { category } = p;
  return {
    id,
    title: p.title,
    slug: slugify(p.title),
    category,
    color: PALETTE[(id - 1) % PALETTE.length],
    thumbnail: p.thumbnail || null,
    // Project Shelf fields: shown when published; empty result hides the metric line.
    published: p.published === true,
    sort_order: p.sortOrder ?? 1000 + id,
    tag: p.tag || DEFAULT_TAGS[category] || '',
    result: p.result || '',
    spineColor: p.spineColor || SPINE_COLORS[(id - 1) % SPINE_COLORS.length],
    emoji: p.emoji || '📘',
    year: p.year || 2026,
    links: p.links || { github: 'https://github.com/', demo: null },
    gallery: p.gallery || null,
    description:
      p.description ||
      `${p.title} is a placeholder ${category} project. A real description and imagery will be added in a later pass.`,
    images: [],
    project_url: `/projects/${slugify(p.title)}`,
    tech_stack: p.tech,
  };
});

// Chapter nav: published books page only through other published books (same as the backend).
[projects.filter((p) => p.published), projects.filter((p) => !p.published)].forEach((chain) =>
  chain.forEach((p, i) => {
    const prevP = chain[i - 1];
    const nextP = chain[i + 1];
    p.prev = prevP ? { slug: prevP.slug, title: prevP.title } : null;
    p.next = nextP ? { slug: nextP.slug, title: nextP.title } : null;
  })
);

export const fallbackProjects = projects;
