// "The Workshop" (Toolbox section): every drawer and tool comes from this one
// array. Adding a tool = one line in a drawer's `tools`. The tool / drawer
// counters in the header are computed from it, so they never need editing.
// Keep it in line with the Skills section of docs/master-cv.md; four tools per
// drawer is what fits one laptop viewport.
//
//   tile  = monogram tile background        label = drawer label + rule colour
//   desc  = laptop one-liner                short = phone one-liner
//   mono  = 2-3 letter monogram (optional; falls back to the name's first two letters)

export const TOOL_DRAWERS = [
  {
    key: 'A',
    name: 'DATA',
    desc: 'Querying, cleaning and shaping data.',
    short: 'Query & shape',
    tile: '#B5533C',
    label: '#E58A72',
    tools: [
      { name: 'Python', mono: 'Py' },
      { name: 'SQL', mono: 'SQL' },
      { name: 'Pandas', mono: 'Pd' },
      { name: 'NumPy', mono: 'Np' },
    ],
  },
  {
    key: 'B',
    name: 'MODELS',
    desc: 'Training and evaluating ML and DL models.',
    short: 'Train & evaluate',
    tile: '#9C7128',
    label: '#DDB362',
    tools: [
      { name: 'scikit-learn', mono: 'Sk' },
      { name: 'XGBoost', mono: 'XG' },
      { name: 'PyTorch', mono: 'Pt' },
      { name: 'TensorFlow', mono: 'TF' },
    ],
  },
  {
    key: 'C',
    name: 'BUILD',
    desc: 'APIs, interfaces and storage.',
    short: 'APIs & interfaces',
    tile: '#C0662F',
    label: '#ECA06C',
    tools: [
      { name: 'FastAPI', mono: 'Fa' },
      { name: 'React', mono: 'Re' },
      { name: 'MongoDB', mono: 'Mg' },
      { name: 'PostgreSQL', mono: 'Pg' },
    ],
  },
  {
    key: 'D',
    name: 'SHIP',
    desc: 'Versioning, packaging and deploying.',
    short: 'Version & deploy',
    tile: '#5E4E3E',
    label: '#C9B8A2',
    tools: [
      { name: 'Docker', mono: 'Dk' },
      { name: 'Git', mono: 'Gt' },
      { name: 'MLflow', mono: 'ML' },
      { name: 'AWS', mono: 'Aw' },
    ],
  },
];

// Shown as "CURRENTLY LEARNING · <tool>" in the bottom line. Leave empty to hide it.
export const NEXT_TOOL = '';

export const toolCount = (drawers = TOOL_DRAWERS) => drawers.reduce((n, d) => n + d.tools.length, 0);
export const monogramOf = (tool) => tool.mono || tool.name.slice(0, 2);
