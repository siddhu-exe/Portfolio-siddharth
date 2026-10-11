import { TODO } from './schema.js';

// Existing page content (backend/data.py description + tech stack) moved into the shared schema.
// Everything marked TODO is hidden on the live page until it is written.
export default {
  slug: 'ipl-data-visualization',
  title: 'IPL Data Visualization',
  tagline: 'A decade of cricket, told visually.',
  year: 2026,
  links: {
    demo: TODO, // TODO: live demo URL
    github: TODO, // TODO: repository URL
  },
  demoNote: TODO, // TODO: e.g. 'Demo runs on demand' (only if it applies)
  meta: {
    role: TODO, // TODO: your role on this project
    timeline: TODO, // TODO: start – end
    deployedOn: TODO, // TODO: where it runs
  },
  stats: TODO, // TODO: 4 × { value, label }
  overview: {
    lead: 'A visual exploration of a decade of IPL cricket data — player form, team match-ups and venue effects — rendered as interactive charts that tell the story at a glance.',
    approach: TODO, // TODO
    evaluation: TODO, // TODO
    serving: TODO, // TODO
  },
  stack: [{ group: 'Tools', items: ['Python', 'Plotly', 'Pandas'] }],
  chapters: {
    architecture: { subtitle: TODO, flow: TODO, decisions: TODO }, // TODO
    dataPipeline: { subtitle: TODO, steps: TODO, figure: TODO, footprint: TODO }, // TODO
    machineLearning: { subtitle: TODO, highlight: TODO, list: TODO, finding: TODO }, // TODO
    platform: { subtitle: TODO, figure: TODO, notes: TODO, latency: TODO }, // TODO
    results: { subtitle: TODO, metrics: TODO, table: TODO, next: TODO }, // TODO
  },
};
