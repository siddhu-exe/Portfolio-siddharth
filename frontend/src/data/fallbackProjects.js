// Used only if the backend is unreachable, so the shelf never renders empty.
const PALETTE = ['#D9834A', '#E4A356', '#7FA98F', '#6C8EBF', '#B5729B', '#C9695A', '#5C9EAD', '#D4A24E'];

const CATS = [
  {
    category: 'Data Analytics',
    projects: [
      { title: 'Customer Churn Analysis', tech: ['Pandas', 'SQL', 'Matplotlib'] },
      { title: 'Retail Sales Analysis', tech: ['Pandas', 'NumPy', 'Seaborn'] },
    ],
  },
  {
    category: 'Data Visualization',
    projects: [
      { title: 'Sales Dashboard (Tableau)', tech: ['Tableau', 'SQL', 'Excel'] },
      { title: 'IPL Data Visualization', tech: ['Python', 'Plotly', 'Pandas'] },
    ],
  },
  {
    category: 'Machine Learning',
    projects: [
      {
        title: 'Delhi Air Quality Risk Forecasting',
        tech: ['Python', 'PostgreSQL', 'LightGBM', 'Statsmodels', 'Streamlit'],
        thumbnail: '/images/delhi-air-quality-risk-forecasting/fig01.png',
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
            images: ['/images/delhi-air-quality-risk-forecasting/02_system_architecture.png'],
          },
          {
            key: 'pipeline',
            heading: 'Data Pipeline',
            subtitle: 'From raw data to production-ready predictions and features.',
            images: ['/images/delhi-air-quality-risk-forecasting/03_postgres_erd_schema.png'],
          },
          {
            key: 'ml',
            heading: 'Machine Learning',
            subtitle: 'How the model learns, evaluates, and predicts outcomes.',
            images: [
              '/images/delhi-air-quality-risk-forecasting/04_forecasting_performance.png',
              '/images/delhi-air-quality-risk-forecasting/05_severe_episode_tracking.png',
            ],
          },
          {
            key: 'platform',
            heading: 'Platform',
            subtitle: 'Interactive dashboards and prediction experiences built for users.',
            images: ['/images/delhi-air-quality-risk-forecasting/01_dashboard_hero.png'],
          },
          {
            key: 'results',
            heading: 'Results',
            subtitle: 'The final outcome of the project and its key achievements.',
            images: [
              '/images/delhi-air-quality-risk-forecasting/06_cost_sensitive_threshold.png',
              '/images/delhi-air-quality-risk-forecasting/07_diwali_causal_analysis.png',
            ],
          },
        ],
      },
      {
        title: 'FIFA World Cup Predictor',
        tech: ['Python', 'XGBoost', 'scikit-learn', 'Pandas', 'NumPy'],
        thumbnail: '/images/fifa-world-cup-predictor/frontpage.png',
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
      { title: "Alzheimer's MRI Detection", tech: ['TensorFlow', 'CNN', 'OpenCV'] },
      { title: 'Plant Disease Detection', tech: ['PyTorch', 'CNN', 'OpenCV'] },
    ],
  },
  {
    category: 'AI Applications',
    projects: [
      { title: 'RAG Chatbot', tech: ['LangChain', 'FastAPI', 'OpenAI'] },
      { title: 'AI Research Assistant', tech: ['LangGraph', 'RAG', 'Chroma'] },
    ],
  },
];

let counter = 0;
const projects = CATS.flatMap(({ category, projects: catProjects }) =>
  catProjects.map((p) => {
    const id = ++counter;
    return {
      id,
      title: p.title,
      slug: p.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      category,
      color: PALETTE[(id - 1) % PALETTE.length],
      thumbnail: p.thumbnail || null,
      emoji: p.emoji || '📘',
      year: p.year || 2026,
      links: p.links || { github: 'https://github.com/', demo: null },
      gallery: p.gallery || null,
      description:
        p.description ||
        `${p.title} is a placeholder ${category} project. A real description and imagery will be added in a later pass.`,
      images: [],
      project_url: `/projects/${p.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`,
      tech_stack: p.tech,
    };
  })
);

// Chapter nav: adjacent projects in flat order, same convention as the backend.
projects.forEach((p, i) => {
  const prevP = projects[i - 1];
  const nextP = projects[i + 1];
  p.prev = prevP ? { slug: prevP.slug, title: prevP.title } : null;
  p.next = nextP ? { slug: nextP.slug, title: nextP.title } : null;
});

export const fallbackProjects = projects;
