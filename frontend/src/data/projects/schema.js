// Shared schema for the project ("inside the book") page. Every project is one
// file in this folder exporting a plain object of this shape; ProjectPage
// renders them all through the same template, so only the content differs.
//
// Fields owned by the Project Shelf are NOT repeated here. `volume`, `tag`,
// `spineColor`, `keyResult` (the shelf's `result`) and `category` come from the
// same list the shelf renders (src/data/projectPage.js merges them in), so a
// book's page can never drift from its spine.
//
// Empty content: set a field to `TODO` (null) and leave a `// TODO:` note. The
// template hides every block whose data is empty — no placeholders reach the
// live site. collectTodos() below lists what is still open for a project.
//
// {
//   slug, title, tagline, year,
//   links:    { demo, github, kaggle? },          // placeholders ('#', bare github.com) count as missing
//   demoNote,                                     // e.g. 'Demo runs on demand'
//   preview?: { summary, image: { src, alt }, caption, stats: [{ value, label, short? }], stack: [] },
//                                                 // shelf popup only; every field optional (see data/bookPreview.js)
//   meta:     { role, timeline, deployedOn },     // a missing value hides its label
//   stats:    [{ value, label }],                 // 4 on laptop, shown 2x2 on mobile
//   overview: { lead, leadAccent?, approach, evaluation, serving },
//   stack:    [{ group, items: [] }],
//   chapters: {
//     architecture:    { subtitle, flow: [{ kind, title, sub, parallel?: [{ kind, title, sub }] }],
//                        flowCaption?, decisions: [{ title, why }], figures? },
//     dataPipeline:    { subtitle, steps: [{ title, body }], figure: { src, caption, alt },
//                        footprint?: [{ label, value, percent }], footprintTitle?, footprintNote?, figures? },
//     machineLearning: { subtitle, highlight: { eyebrow?, value, label, chips: [] },
//                        listTitle?, list: [{ title, direction }], finding?, figures? },
//     platform:        { subtitle, figure: { src, mobileSrc?, caption, alt, windowTitle? },
//                        notes: [{ title, body }], latencyTitle?, latency?: [{ stage, value }], figures? },
//     results:         { subtitle, metrics: [{ value, label }],
//                        table?: { title?, columns: [], rows: [[]] }, next: [], figures? },
//   },
// }
// `figures` (every chapter, optional) is a list of extra { src, caption, alt }
// images shown at the end of the chapter, for projects whose existing page
// content is image-only.

/** Marks a field that still needs writing. Renders as "not there" (hidden). */
export const TODO = null;

/** Site owner, printed on every cover. */
export const AUTHOR = 'Siddharth Dongardive';

/** The five chapters every project has, in order. Titles are fixed; only subtitle + content vary. */
export const CHAPTERS = [
  { key: 'architecture', id: 'architecture', num: '01', title: 'Architecture', short: 'Architecture' },
  { key: 'dataPipeline', id: 'data-pipeline', num: '02', title: 'Data Pipeline', short: 'Data' },
  { key: 'machineLearning', id: 'machine-learning', num: '03', title: 'Machine Learning', short: 'ML' },
  { key: 'platform', id: 'platform', num: '04', title: 'Platform', short: 'Platform' },
  { key: 'results', id: 'results', num: '05', title: 'Results', short: 'Results' },
];

/** Every TODO (null) leaf in a project file, as dotted paths. Used for the hand-off report. */
export function collectTodos(project) {
  const out = [];
  const walk = (node, path) => {
    if (node === null) {
      out.push(path);
    } else if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, `${path}[${i}]`));
    } else if (node && typeof node === 'object') {
      Object.entries(node).forEach(([k, v]) => walk(v, path ? `${path}.${k}` : k));
    }
  };
  walk(project, '');
  return out;
}
