import { TODO } from './schema.js';

// Copy and numbers come from projects/Rockefeller/ROCKEFELLER_PORTFOLIO.md. No model metrics beyond
// those listed there are claimed. XGBoost's score is on synthetic data and the crack labels are
// algorithmic, so both are worded that way on purpose.
export default {
  slug: 'minesafe-ai',
  title: 'MineSafe AI',
  tagline:
    'A mine-safety platform that scores landslide and rockfall risk per zone, tracks blasts, cracks and rainfall, and routes alerts to the right people in real time.',
  year: 2026,
  links: {
    demo: TODO, // TODO: add https://rockefeller-jade.vercel.app once the Render backend is up and vercel.json SPA rewrite is added
    github: 'https://github.com/siddhu-exe/rockefeller',
  },
  demoNote: TODO,
  // Shelf popup only (data/bookPreview.js); the project page ignores this block.
  preview: {
    summary:
      'React, FastAPI and MongoDB with four ML models behind one API: zone risk, crack severity, rainfall forecasts and blast anomalies, with role-based alerts over WebSocket and push.',
    image: {
      src: '/images/minesafe-ai/10_architecture.png',
      alt: 'MineSafe AI architecture diagram: React frontend, FastAPI backend, MongoDB and four ML models.',
    },
    caption: 'The MineSafe AI system architecture',
    stats: [
      { value: '4', label: 'Trained models', short: 'Models' },
      { value: '56,092', label: 'Crack images', short: 'Images' },
      { value: '60+', label: 'API endpoints', short: 'Endpoints' },
    ],
    stack: ['React', 'FastAPI', 'MongoDB', 'XGBoost', 'Prophet', 'Keras', 'Isolation Forest', 'Groq', 'WebSocket'],
  },
  meta: {
    role: 'Frontend, backend and all four models (team of 4)',
    timeline: TODO, // TODO: start – end
    deployedOn: 'Vercel (frontend) · Render (backend)',
  },
  stats: [
    { value: '4', label: 'Trained models' },
    { value: '56,092', label: 'Crack images' },
    { value: '60+', label: 'API endpoints' },
    { value: '36', label: 'District rainfall models' },
  ],
  overview: {
    lead: 'Mine teams juggle rainfall, slope, blasting and crack inspections in separate tools. MineSafe AI puts them on one map and scores every zone.',
    leadAccent: 'one map',
    approach:
      'Four model families sit behind one API: XGBoost for zone risk, an EfficientNetV2S crack model, Prophet rainfall forecasts and an Isolation Forest for blast anomalies. A weighted rule engine takes over if a model fails to load.',
    evaluation:
      'XGBoost reaches 90.4% accuracy on a synthetic set, and the crack model 87.4% validation accuracy against an 84.9% majority baseline. Crack severity labels are algorithmic, not human-labelled.',
    serving:
      'A React + Vite frontend on Vercel talks to a FastAPI + MongoDB backend on Render. Critical events reach workers through WebSocket and browser push, with Admin, Safety Officer and Field Worker roles.',
  },
  stack: [
    { group: 'Models', items: ['XGBoost', 'Prophet', 'Keras', 'Isolation Forest', 'Groq'] },
    { group: 'Backend', items: ['FastAPI', 'MongoDB', 'Beanie', 'WebSocket'] },
    { group: 'Interface', items: ['React', 'Vite', 'MUI', 'Deck.gl', 'MapLibre', 'Leaflet', 'Recharts'] },
    { group: 'Deploy', items: ['Vercel', 'Render'] },
  ],
  chapters: {
    architecture: {
      subtitle: 'React, FastAPI, MongoDB and four ML models behind one alerting pipeline.',
      flow: [
        { kind: 'Input', title: 'Zones', sub: 'cracks, blasts, rain' },
        { kind: 'Serve', title: 'FastAPI', sub: 'REST + JWT' },
        {
          parallel: [
            { kind: 'Model', title: 'ML models', sub: 'four families' },
            { kind: 'Store', title: 'MongoDB', sub: '14 collections' },
          ],
        },
        { kind: 'Output', title: 'Alerts', sub: 'WebSocket + push' },
      ],
      flowCaption: 'From field signals to alerts, left to right.',
      decisions: [
        {
          title: 'ML first, rules as fallback.',
          why: 'Zone scoring uses the XGBoost model, and a weighted rule engine takes over if a model fails to load, so a zone is never left unscored.',
        },
        {
          title: 'Four model families, one API.',
          why: 'Models load at startup and report their status through an endpoint, so a missing model is visible instead of silent.',
        },
        {
          title: 'Realtime end to end.',
          why: 'WebSocket with auto-reconnect plus service-worker push means a critical crack report reaches workers as it happens.',
        },
      ],
      figures: [
        {
          src: '/images/minesafe-ai/10_architecture.png',
          caption: 'React and Vite on Vercel, FastAPI and MongoDB on Render, with the ML services and the realtime path.',
          alt: 'Architecture diagram of MineSafe AI from the React frontend through FastAPI to MongoDB, the ML services and WebSocket and push alerts.',
        },
      ],
    },
    dataPipeline: {
      subtitle: 'Fourteen collections, and the data each risk model learns from.',
      steps: [
        {
          title: 'Seed',
          body: '45 zones across 24 districts and 38 mines: 17 yellow, 13 green, 10 orange and 5 red.',
        },
        {
          title: 'Train',
          body: '3,600 synthetic zone-days with 11 features for XGBoost, 56,092 SDNET2018 crack images for the CNN, and 65,736 IMD rainfall rows for Prophet.',
        },
        {
          title: 'Refresh',
          body: 'A daily job refreshes rainfall forecasts and predictions at 06:00 IST, configurable through environment variables.',
        },
      ],
      figure: {
        src: '/images/minesafe-ai/20_data_model.png',
        caption: 'The fourteen collections behind zones, alerts, blasts, cracks and workers.',
        alt: 'Data model diagram of the fourteen MongoDB collections used by MineSafe AI.',
      },
      footprintTitle: 'Risk-model training labels',
      footprint: [
        { label: 'Yellow', value: '2,450', percent: 100 },
        { label: 'Green', value: '996', percent: 41 },
        { label: 'Orange', value: '154', percent: 6 },
      ],
      footprintNote: 'No zone in the training set is labelled red, and the labels come from a weighted formula, not real incidents.',
      figures: [
        {
          src: '/images/minesafe-ai/31_data_distribution.png',
          caption: 'Label distribution of the zone-risk training set.',
          alt: 'Chart of the class distribution of the 3,600-row zone-risk training set.',
        },
      ],
    },
    machineLearning: {
      subtitle: 'Four model families, what each was trained on, and how far each result can be trusted.',
      highlight: {
        eyebrow: 'Crack severity model',
        value: '87.4%',
        label: 'validation accuracy after fine-tuning EfficientNetV2S, against an 84.9% majority-class baseline.',
        chips: ['XGBoost', 'EfficientNetV2S', 'Prophet', 'Isolation Forest', 'Groq'],
      },
      listTitle: 'What each model does',
      list: [
        { title: 'XGBoost', direction: 'zone risk, 90.4% on synthetic data' },
        { title: 'EfficientNetV2S', direction: 'crack severity from photos' },
        { title: 'Prophet', direction: '36 district rainfall forecasts' },
        { title: 'Isolation Forest', direction: 'blast anomaly warnings' },
        { title: 'Groq LLM', direction: 'text only: summaries and remarks' },
      ],
      finding:
        'The XGBoost labels come from the same formula as its features, so 90.4% shows it learned the formula, not real mine risk. The crack gain is about 2.5 points over always answering "no crack", and its severity labels come from an OpenCV edge-density score.',
      figures: [
        {
          src: '/images/minesafe-ai/32_ml_stack.png',
          caption: 'The four model families and the data each one was trained on.',
          alt: 'Diagram of the four ML models in MineSafe AI with their training data.',
        },
        {
          src: '/images/minesafe-ai/35_crack_model.png',
          caption: 'Crack model: head-only training versus fine-tuning, validation accuracy.',
          alt: 'Chart of crack-severity model validation accuracy across the two training phases.',
        },
        {
          src: '/images/minesafe-ai/36_xgboost_results.png',
          caption: 'XGBoost zone-risk results on the 720-row test split.',
          alt: 'Chart of XGBoost per-class F1 and top feature importances for zone risk.',
        },
      ],
    },
    platform: {
      subtitle: 'The crack-report workflow, and who is allowed to do what.',
      figure: {
        src: '/images/minesafe-ai/33_crack_workflow.png',
        mobileSrc: TODO,
        caption: 'A crack photo goes from upload to CNN score, admin review and worker alerts.',
        alt: 'Workflow diagram of a crack report from photo upload through the CNN score and admin review to worker notifications.',
      },
      notes: [
        {
          title: 'Crack operations',
          body: 'Workers upload a photo, the CNN scores it and Groq drafts remarks. An admin verifies, marks safe or rejects, and critical cases are routed on.',
        },
        {
          title: 'Role-based access',
          body: 'Admin, Safety Officer and Field Worker roles are enforced in both the API and the UI.',
        },
        {
          title: 'Realtime delivery',
          body: 'In-app notifications, a WebSocket per user and VAPID browser push carry critical events to the people who need them.',
        },
      ],
      latency: TODO,
      figures: [
        {
          src: '/images/minesafe-ai/34_roles.png',
          caption: 'What a field worker, safety officer and admin can each do.',
          alt: 'Diagram of the permissions of the Admin, Safety Officer and Field Worker roles.',
        },
      ],
    },
    results: {
      subtitle: 'What was built, and what the numbers do and do not show.',
      metrics: [
        { value: '4', label: 'Trained models behind one API' },
        { value: '56,092', label: 'Crack images processed' },
        { value: '60+', label: 'API endpoints' },
      ],
      table: {
        title: 'Model results, with their caveats',
        columns: ['MODEL', 'RESULT', 'CAVEAT'],
        rows: [
          ['XGBoost zone risk', '90.4% accuracy, macro F1 0.84', 'Synthetic labels'],
          ['EfficientNetV2S crack', '87.4% val accuracy', '84.9% majority baseline'],
          ['Prophet rainfall', '36 district models', 'No clean holdout yet'],
          ['Isolation Forest', '9 of last 10 anomalies flagged', 'Synthetic blasts'],
        ],
      },
      next: [
        'Report crack-model precision and recall on the 5,612-image test split.',
        'Measure Prophet error on a true holdout year.',
        'Capture live dashboard screenshots and publish a working demo.',
      ],
      figures: [
        {
          src: '/images/minesafe-ai/30_risk_scoring.png',
          caption: 'How a zone score is built from rainfall, slope, blasts and cracks.',
          alt: 'Diagram of how the zone risk score combines rainfall, slope, soil, blast and crack signals.',
        },
      ],
    },
  },
};
