import { TODO } from './schema.js';

// Existing page content (backend/data.py description + tech stack) moved into the shared schema.
// Everything marked TODO is hidden on the live page until it is written.
export default {
  slug: 'bitcoingraphguard',
  title: 'BitcoinGraphGuard',
  tagline: 'A graph model scored on 822k Bitcoin wallets, reaching a PR-AUC of 0.801.',
  year: 2026,
  links: {
    demo: TODO, // TODO: live demo URL
    github: TODO, // TODO: repository URL
  },
  demoNote: TODO, // TODO: e.g. 'Demo runs on demand' (only if it applies)
  // Shelf popup only (data/bookPreview.js); the project page ignores this block.
  preview: {
    summary: TODO, // TODO: 1-2 sentences, max ~220 chars (falls back to overview.lead, then the shelf description)
    image: TODO, // TODO: { src, alt } screenshot (falls back to the shelf thumbnail, then the book-cover block)
    caption: TODO, // TODO: figure caption under the screenshot
    stats: TODO, // TODO: 3 × { value, label, short? } (falls back to the numbers in the shelf result line)
  },
  meta: {
    role: TODO, // TODO: your role on this project
    timeline: TODO, // TODO: start – end
    deployedOn: TODO, // TODO: where it runs
  },
  stats: TODO, // TODO: 4 × { value, label }
  overview: {
    lead: TODO, // TODO: one-sentence overview
    approach: TODO, // TODO
    evaluation: TODO, // TODO
    serving: TODO, // TODO
  },
  stack: [{ group: 'Tools', items: ['Graph ML'] }],
  chapters: {
    architecture: { subtitle: TODO, flow: TODO, decisions: TODO }, // TODO
    dataPipeline: { subtitle: TODO, steps: TODO, figure: TODO, footprint: TODO }, // TODO
    machineLearning: { subtitle: TODO, highlight: TODO, list: TODO, finding: TODO }, // TODO
    platform: { subtitle: TODO, figure: TODO, notes: TODO, latency: TODO }, // TODO
    results: { subtitle: TODO, metrics: TODO, table: TODO, next: TODO }, // TODO
  },
};
