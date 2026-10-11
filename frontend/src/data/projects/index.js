// Registry of per-project page content, keyed by slug. Add a project by dropping
// a file in this folder (see schema.js) and listing it here. Volumes 7-10 (churn, retail,
// sales dashboard, IPL) are unpublished from the shelf, so their files are kept but not registered.
import legalrag from './legalrag.js';
import delhi from './delhi-air-quality-risk-forecasting.js';
import bitcoin from './bitcoingraphguard.js';
import fifa from './fifa-world-cup-predictor.js';
import truthmates from './truthmates.js';
import kalachain from './kalachain.js';

export const projectContent = Object.fromEntries(
  [legalrag, delhi, bitcoin, fifa, truthmates, kalachain].map((p) => [p.slug, p])
);
