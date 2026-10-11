import { TODO } from './schema.js';

// Existing page content (backend/data.py description, stack, links, gallery images
// and subtitles) moved into the shared schema. Everything marked TODO is hidden on
// the live page until it is written.
const IMG = '/images/delhi-air-quality-risk-forecasting';

export default {
  slug: 'delhi-air-quality-risk-forecasting',
  title: 'Delhi Air Quality Risk Forecasting',
  tagline: 'Multi-horizon forecasting, CPCB risk alerting, and causal policy evaluation.',
  year: 2026,
  links: {
    demo: 'https://siddhu-exe-air-quality-risk-forecasting-dashboardapp-w5wwow.streamlit.app/',
    github: 'https://github.com/siddhu-exe/Air-Quality-Risk-Forecasting',
    kaggle: 'https://www.kaggle.com/datasets/siddharthdongardive/delhi-air-quality-monitoring-dataset-2023-2026',
  },
  demoNote: TODO, // TODO: e.g. 'Demo runs on demand' (only if it applies)
  meta: {
    role: TODO, // TODO: your role on this project
    timeline: TODO, // TODO: start – end
    deployedOn: TODO, // TODO: where it runs
  },
  stats: TODO, // TODO: 4 × { value, label }
  overview: {
    lead: "An end-to-end operational ML system and econometric audit delivering 1h/6h/24h air quality forecasts, automated CPCB/GRAP emergency risk alerts, and causal evaluation of Delhi's Diwali firecracker ban across 7 continuous monitoring stations.",
    approach: TODO, // TODO
    evaluation: TODO, // TODO
    serving: TODO, // TODO
  },
  stack: [{ group: 'Tools', items: ['Python', 'PostgreSQL', 'LightGBM', 'Statsmodels', 'Streamlit'] }],
  chapters: {
    architecture: {
      subtitle: 'The complete system architecture, from data collection to prediction.',
      flow: TODO, // TODO: request/data path nodes
      decisions: TODO, // TODO
      figures: [
        { src: `${IMG}/02_system_architecture.png`, alt: 'System architecture of the Delhi air quality forecasting project.' },
      ],
    },
    dataPipeline: {
      subtitle: 'From raw data to production-ready predictions and features.',
      steps: TODO, // TODO
      figure: { src: `${IMG}/03_postgres_erd_schema.png`, alt: 'PostgreSQL entity-relationship schema for the air quality data.' },
      footprint: TODO, // TODO
    },
    machineLearning: {
      subtitle: 'How the model learns, evaluates, and predicts outcomes.',
      highlight: TODO, // TODO
      list: TODO, // TODO
      finding: TODO, // TODO
      figures: [
        { src: `${IMG}/04_forecasting_performance.png`, alt: 'Forecasting performance across the 1h, 6h and 24h horizons.' },
        { src: `${IMG}/05_severe_episode_tracking.png`, alt: 'Tracking of severe air quality episodes by the model.' },
      ],
    },
    platform: {
      subtitle: 'Interactive dashboards and prediction experiences built for users.',
      figure: { src: `${IMG}/01_dashboard_hero.png`, alt: 'The Streamlit dashboard showing air quality forecasts and risk alerts.' },
      notes: TODO, // TODO
      latency: TODO, // TODO
    },
    results: {
      subtitle: 'The final outcome of the project and its key achievements.',
      metrics: TODO, // TODO
      table: TODO, // TODO
      next: TODO, // TODO
      figures: [
        { src: `${IMG}/06_cost_sensitive_threshold.png`, alt: 'Cost-sensitive alert threshold selection.' },
        { src: `${IMG}/07_diwali_causal_analysis.png`, alt: 'Causal analysis of the Diwali firecracker ban.' },
      ],
    },
  },
};
