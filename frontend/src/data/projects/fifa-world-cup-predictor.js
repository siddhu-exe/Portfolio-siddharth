import { TODO } from './schema.js';

// Existing page content (backend/data.py description, stack, links, gallery images
// and subtitles) moved into the shared schema. Everything marked TODO is hidden on
// the live page until it is written.
const IMG = '/images/fifa-world-cup-predictor';

export default {
  slug: 'fifa-world-cup-predictor',
  title: 'FIFA World Cup Predictor',
  tagline: 'Forecasting 104 matches through dual stage-aware models and 10,000 tournament simulations.',
  year: 2026,
  links: {
    demo: 'https://fifa-predictor-kohl.vercel.app',
    github: 'https://github.com/siddhu-exe/Fifa-predictor',
  },
  demoNote: TODO, // TODO: e.g. 'Demo runs on demand' (only if it applies)
  // Shelf popup only (data/bookPreview.js); the project page ignores this block.
  preview: {
    summary:
      'Dual stage-aware XGBoost models predict every match of the 48-team 2026 tournament; 10,000 Monte Carlo simulations turn those predictions into full championship odds.',
    image: TODO, // TODO: dedicated screenshot (falls back to the shelf thumbnail)
    caption: 'Project cover: FIFA World Cup 2026 predictions',
    stats: TODO, // TODO: 3 × { value, label }
  },
  meta: {
    role: TODO, // TODO: your role on this project
    timeline: TODO, // TODO: start – end
    deployedOn: TODO, // TODO: where it runs
  },
  stats: TODO, // TODO: 4 × { value, label }
  overview: {
    lead: 'Dual stage-aware XGBoost models predicting every match of the 48-team 2026 tournament, distilled through 10,000 Monte Carlo simulations into full championship odds.',
    approach: TODO, // TODO
    evaluation: TODO, // TODO
    serving: TODO, // TODO
  },
  stack: [{ group: 'Tools', items: ['Python', 'XGBoost', 'scikit-learn', 'Pandas', 'NumPy'] }],
  chapters: {
    architecture: {
      subtitle: 'The complete system architecture, from data collection to prediction.',
      flow: TODO, // TODO: request/data path nodes
      decisions: TODO, // TODO
      figures: [{ src: `${IMG}/03_model_architecture.svg`, alt: 'Model architecture of the World Cup predictor.' }],
    },
    dataPipeline: {
      subtitle: 'From raw data to production-ready predictions and features.',
      steps: TODO, // TODO
      figure: { src: `${IMG}/01_data_pipeline.svg`, alt: 'Data pipeline from raw football data to model-ready features.' },
      footprint: TODO, // TODO
      figures: [{ src: `${IMG}/02_feature_engineering.svg`, alt: 'Feature engineering steps for the match models.' }],
    },
    machineLearning: {
      subtitle: 'How the model learns, evaluates, and predicts outcomes.',
      highlight: TODO, // TODO
      list: TODO, // TODO
      finding: TODO, // TODO
      figures: [{ src: `${IMG}/04_feature_importance.svg`, alt: 'Feature importance for the match prediction models.' }],
    },
    platform: {
      subtitle: 'Interactive dashboards and prediction experiences built for users.',
      figure: { src: `${IMG}/05_monte_carlo.svg`, alt: 'Monte Carlo tournament simulation flow.' },
      notes: TODO, // TODO
      latency: TODO, // TODO
    },
    results: {
      subtitle: 'The final outcome of the project and its key achievements.',
      metrics: TODO, // TODO
      table: TODO, // TODO
      next: TODO, // TODO
      figures: [{ src: `${IMG}/06_simulation_results.svg`, alt: 'Championship odds from 10,000 tournament simulations.' }],
    },
  },
};
