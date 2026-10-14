import { TODO } from './schema.js';

// Copy and numbers come from projects/BitcoinGraphGuard/PORTFOLIO_SITE_GUIDE.md
// (every figure there traces to results/ or reports/ in the project repo).
// All aggregate metrics are pooled over steps, not means of per-step values.
export default {
  slug: 'bitcoingraphguard',
  title: 'BitcoinGraphGuard',
  tagline:
    'Temporal fraud detection on the Elliptic++ Bitcoin graph, tested on the future, with a drift-aware API that knows when it stops working.',
  year: 2026,
  links: {
    demo: 'https://bitcoin-graph-delta.vercel.app',
    github: 'https://github.com/siddhu-exe/BitcoinGraphGuard',
  },
  demoNote: TODO,
  // Shelf popup only (data/bookPreview.js); the project page ignores this block.
  preview: {
    summary:
      'XGBoost, GraphSAGE, HeteroRGCN and HGT are benchmarked on Elliptic++ with strict temporal splits. A tuned XGBoost wins at 0.80 PR-AUC, and the step-43 collapse is diagnosed as covariate drift.',
    image: {
      src: '/images/bitcoingraphguard/07_ui_overview.png',
      alt: 'BitcoinGraphGuard dashboard overview page with the headline and four project cards.',
    },
    caption: 'The BitcoinGraphGuard dashboard overview',
    stats: [
      { value: '822,942', label: 'Bitcoin wallets', short: 'Wallets' },
      { value: '0.80', label: 'Test PR-AUC, steps 35-49', short: 'PR-AUC' },
      { value: '49', label: 'Time steps', short: 'Steps' },
    ],
    stack: ['Python', 'XGBoost', 'PyTorch Geometric', 'FastAPI', 'SHAP', 'Captum', 'React', 'TypeScript', 'Docker', 'GitHub Actions'],
  },
  meta: {
    role: 'Data Scientist / ML Engineer',
    timeline: TODO, // TODO: start – end
    deployedOn: 'Render (API) · Vercel (dashboard)',
  },
  stats: [
    { value: '203,769', label: 'Transactions' },
    { value: '822,942', label: 'Wallets' },
    { value: '49', label: 'Time steps' },
    { value: '49', label: 'Automated tests' },
  ],
  overview: {
    lead: 'BitcoinGraphGuard tests fraud models on the future, not a random split. Its real focus is knowing when a model stops working.',
    leadAccent: 'knowing when',
    approach:
      'XGBoost, GraphSAGE, HeteroRGCN and a heterogeneous graph transformer are compared under one frozen temporal protocol, then the step-43 collapse is diagnosed.',
    evaluation:
      'Fit on steps 1-24, validate on 25-34, test on 35-49. PR-AUC is the primary metric, and retraining is tested walk-forward under label delay.',
    serving:
      'A FastAPI service labels every prediction with how reliable that time step has been, next to a lag-safe drift monitor and a React dashboard.',
  },
  stack: [
    { group: 'Models', items: ['XGBoost', 'PyTorch Geometric'] },
    { group: 'Explainability', items: ['SHAP', 'Captum'] },
    { group: 'Serving', items: ['Python', 'FastAPI', 'Docker', 'GitHub Actions'] },
    { group: 'Interface', items: ['React', 'TypeScript'] },
  ],
  chapters: {
    architecture: {
      subtitle: 'Notebooks produce saved artifacts; a tabular-only API and a lag-safe monitor consume them.',
      flow: [
        { kind: 'Input', title: 'Elliptic++', sub: 'tx + wallet graph' },
        { kind: 'Train', title: 'Notebooks', sub: 'Colab / Kaggle' },
        { kind: 'Store', title: 'Artifacts', sub: 'frozen model' },
        {
          parallel: [
            { kind: 'Serve', title: 'FastAPI', sub: 'tau* = 0.435' },
            { kind: 'Monitor', title: 'Drift monitor', sub: 'lag-safe' },
          ],
        },
        { kind: 'Output', title: 'Dashboard', sub: 'React' },
      ],
      flowCaption: 'From dataset to dashboard, left to right.',
      decisions: [
        {
          title: 'Temporal splits only.',
          why: 'Fraud models are used on the future. Random splits leak it, so every metric here is train-on-past, test-on-future.',
        },
        {
          title: 'Heavy ML off the laptop.',
          why: 'Training runs in generated Colab and Kaggle notebooks. The serving side excludes PyTorch and PyG, so the API stays small.',
        },
        {
          title: 'Unknown labels are never supervision.',
          why: '157,205 transactions are unlabeled. They are never treated as licit, which would quietly inflate every score.',
        },
      ],
      figures: [
        {
          src: '/images/bitcoingraphguard/01_system_architecture.png',
          caption: 'Dataset to notebooks to artifacts, then the API, the monitor and the dashboard.',
          alt: 'System architecture diagram of BitcoinGraphGuard from the Elliptic++ dataset through notebooks and saved artifacts to the API, monitor and dashboard.',
        },
      ],
    },
    dataPipeline: {
      subtitle: 'A 49-step temporal graph of transactions and wallets, split strictly by time.',
      steps: [
        {
          title: 'Source',
          body: 'Elliptic++: 203,769 transactions, 822,942 wallets and four directed edge types over 49 time steps.',
        },
        {
          title: 'Label',
          body: '4,545 illicit and 42,019 licit transactions. The 157,205 unknown ones are never used as supervision.',
        },
        {
          title: 'Split',
          body: 'Fit on steps 1-24, validate on 25-34, refit on 1-34, test on 35-49 (16,670 labeled, 1,083 illicit). Scaler fit on training steps only.',
        },
      ],
      figure: {
        src: '/images/bitcoingraphguard/03_regime_shift_per_step.png',
        caption: 'Per-step XGBoost PR-AUC and illicit prevalence, with the drift window shaded.',
        alt: 'Chart of XGBoost PR-AUC and illicit prevalence per time step, with the window from step 43 onward shaded.',
      },
      footprintTitle: 'Label breakdown',
      footprint: [
        { label: 'Unknown', value: '157,205', percent: 100 },
        { label: 'Licit', value: '42,019', percent: 27 },
        { label: 'Illicit', value: '4,545', percent: 3 },
      ],
      footprintNote: 'Illicit prevalence is 6.5% in the test window and 2.53% in steps 43-49.',
    },
    machineLearning: {
      subtitle: 'Four model families under one protocol, why XGBoost won, and what it relies on.',
      highlight: {
        eyebrow: 'The diagnosis',
        value: '1.0000',
        label: 'adversarial AUC between steps 1-34 and 43-49: the data changed, the signal did not vanish.',
        chips: ['XGBoost', 'GraphSAGE', 'HeteroRGCN', 'HGT', 'MLP', 'Logistic regression'],
      },
      listTitle: 'How the collapse was checked',
      list: [
        { title: 'Adversarial validation', direction: 'separates the two regimes' },
        { title: 'Leak audit', direction: 'no leakage found' },
        { title: 'Permutation check', direction: 'signal is real' },
        { title: '5-fold CV inside steps 43-49', direction: 'PR-AUC 0.9199' },
        { title: 'SHAP, Captum, relation ablation', direction: 'what each model relies on' },
      ],
      finding:
        'A well-tuned XGBoost beat every graph model under the same protocol. The graph models were tuned less deeply, so this is a result for this protocol, not a claim about graph methods. XGBoost relies 61.5% on local features, and Local_feature_53 is its top SHAP feature.',
      figures: [
        {
          src: '/images/bitcoingraphguard/02_model_comparison.png',
          caption: 'Test PR-AUC for seven models, steps 35-49, pooled.',
          alt: 'Bar chart of test PR-AUC for XGBoost, GraphSAGE, HGT, MLP, HeteroRGCN, logistic regression and the prevalence baseline.',
        },
        {
          src: '/images/bitcoingraphguard/05_xgboost_shap_top_features.png',
          caption: 'The 15 features XGBoost relies on most, by SHAP value.',
          alt: 'Bar chart of the top 15 SHAP features for the XGBoost model.',
        },
        {
          src: '/images/bitcoingraphguard/04_retraining_vs_label_delay.png',
          caption: 'Static versus expanding-window retraining by label delay, with 95% intervals.',
          alt: 'Chart of PR-AUC for static and expanding-window retraining policies at label delays of 1 to 5 steps.',
        },
      ],
    },
    platform: {
      subtitle: 'A FastAPI service with per-step confidence, a drift monitor, and a React dashboard.',
      figure: {
        src: '/images/bitcoingraphguard/07_ui_overview.png',
        mobileSrc: TODO,
        caption: 'The React dashboard: overview, retraining, monitoring and a live prediction page.',
        alt: 'BitcoinGraphGuard dashboard overview page with the headline and four project cards.',
        windowTitle: 'bitcoin-graph-delta.vercel.app',
      },
      notes: [
        {
          title: 'Confidence context',
          body: 'Each prediction is tagged reliable (steps 35-42), degraded (43-49) or unknown after. It is a historical regime label, not a probability of being right.',
        },
        {
          title: 'Lag-safe monitor',
          body: 'A decision at step t reads labels from steps up to t minus the delay only. LagViolationError blocks anything that would read a label not yet available.',
        },
        {
          title: 'CI consistency gates',
          body: 'CI reproduces a pinned prediction, checks the 165 feature names and order, and fails if metrics silently fall back. 49 tests run on every change.',
        },
      ],
      latency: TODO,
      figures: [
        {
          src: '/images/bitcoingraphguard/06_monitoring_signal_tradeoff.png',
          caption: 'Nine candidate drift signals: false-alarm rate against detection lead.',
          alt: 'Chart comparing nine monitoring signals by false-alarm rate and detection lead.',
        },
      ],
    },
    results: {
      subtitle: "What the benchmark shows, including what didn't work.",
      metrics: [
        { value: '0.80', label: 'Test PR-AUC (XGBoost)' },
        { value: '0.92 → 0.04', label: 'PR-AUC, steps 35-42 vs 43-49' },
        { value: '0.69', label: 'PR-AUC with retraining at 1-step delay' },
      ],
      table: {
        title: 'Test scoreboard, steps 35-49',
        columns: ['MODEL', 'PR-AUC', 'ROC-AUC', 'F1 (ILLICIT)'],
        rows: [
          ['XGBoost, optimized (served)', '0.8013', '0.9281', '0.7818'],
          ['GraphSAGE', '0.6209', '0.9044', '0.5945'],
          ['HGT', '0.4861', '0.8937', '0.3106'],
          ['2-layer MLP', '0.4768', '0.8912', '0.5759'],
          ['HeteroRGCN', '0.4682', '0.8946', '0.5295'],
          ['Logistic regression', '0.2917', '0.8828', '0.4385'],
          ['Prevalence baseline', '0.0650', '0.5000', '0.1220'],
        ],
      },
      next: [
        'Tune the graph models as deeply as XGBoost to make the comparison fair.',
        'Validate the monitoring thresholds on more than one dataset and one regime change.',
        'Add experiment tracking and data versioning (planned, not built).',
      ],
    },
  },
};
