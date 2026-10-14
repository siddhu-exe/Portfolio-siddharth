import { TODO } from './schema.js';

// Copy and numbers come from projects/Air quality risk forecasting/PORTFOLIO_SITE_GUIDE.md
// (itself drawn from reports/metrics/headline_metrics.csv, reports/classification and reports/causal).
const IMG = '/images/delhi-air-quality-risk-forecasting';

export default {
  slug: 'delhi-air-quality-risk-forecasting',
  title: 'Delhi Air Quality Risk Forecasting',
  tagline:
    'Forecasts, alerts and a causal test of the Diwali firecracker ban, every one scored against a hard-to-beat persistence baseline.',
  year: 2026,
  links: {
    demo: 'https://siddhu-exe-air-quality-risk-forecasting-dashboardapp-w5wwow.streamlit.app/',
    github: 'https://github.com/siddhu-exe/Air-Quality-Risk-Forecasting',
    kaggle: 'https://www.kaggle.com/datasets/siddharthdongardive/delhi-air-quality-monitoring-dataset-2023-2026',
  },
  demoNote: 'Replays a backtest, not a live feed',
  // Shelf popup only (data/bookPreview.js); the project page ignores this block.
  preview: {
    summary:
      'A PostgreSQL ETL, 124 leakage-safe features and 1h/6h/24h models feed CPCB/GRAP alerts. An ITS and placebo analysis shows the Diwali-ban effect cannot be identified.',
    image: {
      src: `${IMG}/40_dashboard_overview.png`,
      alt: "Delhi Air Forecast dashboard showing tomorrow's city AQI, an 80% range and what to do.",
    },
    caption: 'The Delhi Air Forecast dashboard (sample readings, backtest outputs)',
    stats: [
      { value: '162,096', label: 'Hourly telemetry rows', short: 'Rows' },
      { value: '+11%', label: '24h skill vs persistence', short: '24h skill' },
      { value: '7', label: 'CAAQMS stations', short: 'Stations' },
    ],
    stack: ['Python', 'PostgreSQL', 'LightGBM', 'Ridge', 'Statsmodels', 'FastAPI', 'React', 'Streamlit'],
  },
  meta: {
    role: 'ML Engineer · data engineering, modeling, causal analysis, dashboards',
    timeline: TODO, // TODO: start – end
    deployedOn: 'Streamlit Cloud (legacy) · React dashboard in progress',
  },
  stats: [
    { value: '162,096', label: 'Hourly telemetry rows' },
    { value: '124', label: 'Leakage-safe features' },
    { value: '+11%', label: '24h skill vs persistence' },
    { value: 'p = 0.51', label: 'Diwali ITS level shift' },
  ],
  overview: {
    lead: "Delhi's winter smog is forecast here at 1, 6 and 24 hours, turned into CPCB/GRAP alerts, and used to test whether the Diwali firecracker ban worked. The real point is honest evaluation.",
    leadAccent: 'honest evaluation',
    approach:
      'An idempotent PostgreSQL 16 ETL feeds 124 backward-looking features. LightGBM forecasts 1h and 6h; a 50/50 Ridge + persistence hybrid forecasts 24h after trees failed to extrapolate (MAE 98.24 → 34.11).',
    evaluation:
      'AQI is a 24-hour rolling average, so copying the last value is very strong. Every model is scored on the held-out Nov–Dec 2025 winter against it, with bootstrap CIs; thresholds are chosen on validation only.',
    serving:
      'A FastAPI backend and a React dashboard (plus the original Streamlit app) read pre-computed backtest files. The new dashboard runs on sample data until live ingest is switched on.',
  },
  stack: [
    { group: 'Data', items: ['PostgreSQL', 'Python', 'Pandas'] },
    { group: 'Modeling', items: ['LightGBM', 'Ridge', 'Statsmodels'] },
    { group: 'Serving', items: ['FastAPI', 'Streamlit'] },
    { group: 'Interface', items: ['React', 'TypeScript'] },
  ],
  chapters: {
    architecture: {
      subtitle: 'From raw government spreadsheets to risk alerts.',
      flow: [
        { kind: 'Input', title: 'Raw data', sub: '105 CPCB/DPCC files' },
        { kind: 'Clean', title: 'ETL + QC', sub: 'sentinels nulled' },
        { kind: 'Store', title: 'PostgreSQL 16', sub: 'idempotent upserts' },
        { kind: 'Features', title: '124 features', sub: 'no leakage' },
        { kind: 'Model', title: 'Forecasts', sub: '1h · 6h · 24h' },
        { kind: 'Decide', title: 'CPCB / GRAP', sub: 'cutoffs on validation' },
        { kind: 'Output', title: 'Dashboard', sub: 'FastAPI + React' },
      ],
      flowCaption: 'Every stage writes files the next one reads.',
      decisions: [
        {
          title: 'Persistence is the bar, not zero.',
          why: 'AQI is a 24h rolling average (lag-1 r ≈ 0.998), so every result is reported as skill against copying the last value.',
        },
        {
          title: 'Test data is scored once.',
          why: 'Hyper-parameters and alert thresholds are chosen on Sep–Oct 2025 validation; Nov–Dec 2025 is only used for the final score.',
        },
      ],
      figures: [{ src: `${IMG}/10_architecture.png`, caption: 'Seven stages from raw spreadsheets to risk alerts, plus the causal question and evaluation rules.', alt: 'Seven-stage pipeline from raw CPCB spreadsheets to risk alerts and dashboards.' }],
    },
    dataPipeline: {
      subtitle: 'From messy spreadsheets to a leakage-safe feature matrix.',
      steps: [
        { title: 'Ingest', body: '105 CPCB/DPCC files across 7 stations, loaded idempotently with source-file lineage.' },
        { title: 'Clean', body: 'Sentinel values nulled per cell; QC flags kept as JSONB; 2023–24 AQI recomputed by the CPCB method.' },
        { title: 'Features', body: '124 lag, rolling, seasonal, weather and spatial features, with a written leakage audit.' },
      ],
      figure: {
        src: `${IMG}/20_data_model.png`,
        caption: 'Relational model for stations, telemetry and official AQI.',
        alt: 'PostgreSQL data model for stations, telemetry and official AQI.',
      },
      footprintTitle: 'Records',
      footprint: [
        { label: 'Telemetry rows (PostgreSQL)', value: '162,096', percent: 100 },
        { label: 'Official AQI rows', value: '57,946', percent: 36 },
      ],
      footprintNote: 'Public Kaggle export: 220,042 hourly rows.',
    },
    machineLearning: {
      subtitle: 'Skill against persistence, and the 24h model that had to be redesigned.',
      highlight: {
        eyebrow: '24h MAE after the fix',
        value: '34.11',
        label: 'down from 98.24, because trees cannot predict above the training maximum (~347).',
        chips: ['LightGBM 1h/6h', 'Ridge + persistence 24h', 'bootstrap CIs'],
      },
      listTitle: 'Test winter vs persistence',
      list: [
        { title: '1h: MAE skill +0.047, RMSE skill −0.332', direction: 'no real skill' },
        { title: '6h: MAE skill +0.069', direction: 'modest gain' },
        { title: '24h: MAE skill +0.110 (+0.099 in 2024)', direction: 'holds across winters' },
      ],
      finding:
        'More winters, weather features, a raw PM2.5 target and a much larger tuning budget barely moved the 24h forecast. PM2.5 itself beats persistence at 1h and 6h.',
      figures: [
        { src: `${IMG}/30_skill_vs_persistence.png`, caption: 'MAE skill against persistence at 1h, 6h and 24h.', alt: 'MAE skill against persistence at 1h, 6h and 24h.' },
        { src: `${IMG}/31_extrapolation_fix.png`, caption: 'Trees capped at ~347 versus the Ridge + persistence hybrid (MAE 98.24 → 34.11).', alt: 'Tree model capped at the training maximum next to the Ridge and persistence hybrid.' },
        { src: `${IMG}/32_episode_forecast.png`, caption: 'A real Severe episode: forecast, actual and persistence.', alt: 'A severe pollution episode: forecast, actual and persistence.' },
      ],
    },
    platform: {
      subtitle: 'The dashboard people read the forecast in.',
      figure: {
        src: `${IMG}/40_dashboard_overview.png`,
        mobileSrc: TODO, // TODO: tall phone screenshot (falls back to the laptop screenshot)
        caption: "Delhi Air Forecast: tomorrow's AQI with an 80% range, advice, and the station map. Sample readings.",
        alt: 'Delhi Air Forecast dashboard overview page.',
        windowTitle: 'delhi air forecast',
      },
      notes: [
        { title: 'Four pages', body: 'Overview, Stations, Operations (GRAP outlook) and Model health.' },
        { title: 'Shows its own skill', body: 'Model health scores every forecast against copy-last and says when the model is losing.' },
        { title: 'Not live yet', body: 'It reads backtest files and sample data; a live ingest pipeline is built but switched off.' },
      ],
      latency: TODO, // not applicable (batch files); leave hidden
      figures: [
        { src: `${IMG}/43_dashboard_model_health.png`, caption: 'Model health: skill against copy-last, coverage and data freshness.', alt: 'Model health page of the Delhi Air Forecast dashboard.' },
        { src: `${IMG}/42_dashboard_operations.png`, caption: 'Operations: the GRAP stage outlook.', alt: 'Operations page of the Delhi Air Forecast dashboard.' },
        { src: `${IMG}/41_dashboard_stations.png`, caption: 'Stations across Delhi.', alt: 'Stations page of the Delhi Air Forecast dashboard.' },
      ],
    },
    results: {
      subtitle: "What alerting costs, and what the data can't tell us.",
      metrics: [
        { value: '+11%', label: '24h MAE skill vs persistence' },
        { value: '61% / 74%', label: 'Severe recall / precision at the 401 cutoff' },
        { value: 'p = 0.51', label: 'Diwali ITS shift (not identifiable)' },
      ],
      table: {
        title: '24h Severe-AQI alert operating points (test winter)',
        columns: ['POLICY', 'CUTOFF', 'RECALL', 'PRECISION'],
        rows: [
          ['Statutory CPCB', '401', '61.1%', '73.9%'],
          ['Compromise', '380', '78.9%', '64.4%'],
          ['Validation-optimal (5:1 cost)', '274.5', '99.8%', '42.9%'],
        ],
      },
      next: TODO, // TODO: what you would do next (3 short items)
      figures: [
        { src: `${IMG}/50_alert_tradeoff.png`, caption: 'Severe-alert precision and recall at three cutoffs, against persistence.', alt: 'Precision and recall of Severe-AQI alerts at three cutoffs, model versus persistence.' },
        { src: `${IMG}/51_diwali_identification.png`, caption: 'Why a naive Diwali before/after fails: pre-trend, placebo and ITS.', alt: 'Why a naive Diwali before/after comparison fails: pre-trend, placebo and ITS.' },
      ],
    },
  },
};
