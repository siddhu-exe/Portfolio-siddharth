import { TODO } from './schema.js';

// Copy and numbers come from the project repo: portfolio/PORTFOLIO_SITE_GUIDE.md, portfolio/RESUME.md and
// docs/CASE_STUDY.md (themselves drawn from reports/modeling/live_retrain, reports/live and reports/metrics).
const IMG = '/images/delhi-air-quality-risk-forecasting';

export default {
  slug: 'delhi-air-quality-risk-forecasting',
  title: 'Delhi Air Quality Risk Forecasting',
  tagline:
    'Hourly air-quality forecasts for seven Delhi stations, every one scored against "copy the last value", on a live pipeline that found and fixed the gap between the data the models were trained on and the data they are served.',
  year: 2026,
  links: {
    demo: 'https://air-quality-risk-forecasting.vercel.app',
    github: 'https://github.com/siddhu-exe/Air-Quality-Risk-Forecasting',
    kaggle: 'https://www.kaggle.com/datasets/siddharthdongardive/delhi-air-quality-monitoring-dataset-2023-2026',
    api: 'https://ca-delhi-air-api.lemoncliff-0c3c829f.centralindia.azurecontainerapps.io/api/docs',
  },
  demoNote: 'No live forecast is being issued while the upstream feed lags',
  // Shelf popup only (data/bookPreview.js); the project page ignores this block.
  preview: {
    summary:
      'Hourly AQI and PM2.5 forecasts for seven Delhi stations, scored against persistence. A live pipeline found train/serve skew, showed a plain rule beats ML at 1h, and handled dead data sources with a probe, a shadow feed and a gate.',
    image: {
      src: `${IMG}/dashboard_overview_desktop.webp`,
      alt: 'Delhi Air Forecast dashboard overview with a notice that readings are delayed and no current forecast is issued.',
    },
    caption: 'The Delhi Air Forecast dashboard on the live API',
    stats: [
      { value: '−0.05 → +0.30', label: '6h skill vs persistence', short: '6h skill' },
      { value: '+0.553', label: '1h skill, rule vs +0.344 model', short: '1h rule' },
      { value: '7', label: 'Delhi stations', short: 'Stations' },
    ],
    stack: ['Python', 'PostgreSQL', 'LightGBM', 'FastAPI', 'Azure', 'GitHub Actions', 'React', 'Vercel'],
  },
  meta: {
    role: 'ML Engineer · pipeline, models, live system',
    timeline: TODO, // TODO: start – end
    deployedOn: 'GitHub Actions · Supabase · Azure Container Apps · Vercel',
  },
  stats: [
    { value: '−0.05 → +0.30', label: '6h skill vs persistence, frozen vs retrained' },
    { value: '+0.553 vs +0.344', label: '1h skill: rule vs model (persistence = 0)' },
    { value: '7', label: 'Delhi stations, hourly' },
    { value: '91.8 h', label: "Age of OpenAQ's newest value at the probe" },
  ],
  overview: {
    lead: "Delhi's AQI is a 24-hour rolling average (lag-1 autocorrelation about 0.998), so \"the next value equals the current value\" is very hard to beat, and a forecast that does not beat it is not worth publishing.",
    leadAccent: 'very hard to beat',
    approach:
      'Pipeline. 105 CPCB/DPCC spreadsheets for 7 CAAQMS stations, ETL with QC into PostgreSQL, a leakage-audited feature matrix, CPCB-method AQI recomputed from raw telemetry for years the official table does not cover. Models. LightGBM for 1h and 6h, a Ridge + persistence hybrid for 24h, CPCB/GRAP risk classes with cost-sensitive alert cutoffs chosen on validation only, and a causal (interrupted time series, placebo) study of the Diwali firecracker ban that concludes the effect is not identifiable.',
    evaluation:
      'The goal was a forecast people could trust, which meant measuring skill against persistence everywhere, with confidence intervals, and being willing to ship a plain rule where a model loses.',
    serving:
      'Live system. Scheduled GitHub Actions jobs (ingest, forecast, score, shadow ingest) write to Supabase Postgres; a read-only FastAPI on Azure Container Apps serves a React dashboard on Vercel. Models are hash-pinned and run inside the job, with no model server.',
  },
  stack: [
    { group: 'Data', items: ['Python', 'PostgreSQL / Supabase'] },
    { group: 'Modeling', items: ['LightGBM', 'scikit-learn', 'statsmodels'] },
    { group: 'Serving', items: ['FastAPI', 'Azure Container Apps', 'GitHub Actions'] },
    { group: 'Interface', items: ['React + TypeScript + Vite', 'Tailwind', 'TanStack Query', 'Vercel'] },
    { group: 'Testing', items: ['pytest', 'Playwright'] },
  ],
  chapters: {
    architecture: {
      subtitle: 'How the live system fits together.',
      flow: [
        {
          parallel: [
            { kind: 'Source', title: 'OpenAQ', sub: 'primary' },
            { kind: 'Shadow', title: 'WAQI', sub: 'never feeds forecasts' },
          ],
        },
        {
          parallel: [
            { kind: 'Job', title: 'ingest', sub: 'hourly at :10' },
            { kind: 'Job', title: 'forecast', sub: 'hourly at :25' },
            { kind: 'Job', title: 'score', sub: 'daily 20:40 UTC' },
            { kind: 'Job', title: 'shadow ingest', sub: 'hourly at :20' },
          ],
        },
        { kind: 'Store', title: 'Supabase', sub: 'Postgres, schema aq' },
        { kind: 'Serve', title: 'FastAPI', sub: 'Azure Container Apps' },
        { kind: 'Output', title: 'React', sub: 'Vercel' },
      ],
      flowCaption: 'Scheduled jobs write to one database; a read-only API and the dashboard sit on top. No model server.',
      decisions: [
        {
          title: 'Persistence is the bar, not zero.',
          why: 'AQI is a 24-hour rolling average (lag-1 autocorrelation about 0.998), so every result is reported as skill against copying the last value, with 95% day-block bootstrap intervals.',
        },
        {
          title: 'Test data is scored once.',
          why: 'Choices are made on Sep–Oct 2025 validation; the Nov–Dec 2025 test winter is only used for the final score.',
        },
      ],
      figures: [
        {
          src: `${IMG}/10_architecture.webp`,
          caption: 'Scheduled GitHub Actions jobs write to Supabase; a read-only FastAPI on Azure serves the React dashboard on Vercel.',
          alt: 'Diagram: OpenAQ and WAQI feed four GitHub Actions jobs, which write to Supabase Postgres, read by a FastAPI service on Azure and a React dashboard on Vercel.',
        },
      ],
    },
    dataPipeline: {
      subtitle: 'From government spreadsheets to a leakage-audited feature matrix.',
      steps: [
        { title: 'Ingest', body: '105 CPCB/DPCC spreadsheets for 7 CAAQMS stations, loaded into PostgreSQL.' },
        { title: 'Clean', body: 'QC in the ETL; CPCB-method AQI recomputed from raw telemetry for years the official table does not cover.' },
        { title: 'Features', body: 'A leakage-audited feature matrix; choices made on validation only, test scored once.' },
      ],
      figure: {
        src: `${IMG}/21_splits_timeline.webp`,
        caption: 'Chronological splits: train, validation (Sep–Oct 2025) and the Nov–Dec 2025 test winter.',
        alt: 'Daily citywide mean AQI from 2024 to 2025 with the train, validation and test windows shaded.',
      },
    },
    machineLearning: {
      subtitle: 'Three findings: train/serve skew, a rule that beats ML at 1h, and dead live sources.',
      highlight: {
        eyebrow: '6h skill vs persistence, test winter',
        value: '−0.05 → +0.30',
        label: 'after retraining on the AQI the service actually sees (95% CI +0.24 to +0.35). Persistence = 0.',
        chips: ['LightGBM 1h/6h', 'Ridge + persistence 24h', 'window-update rule', '95% day-block bootstrap'],
      },
      listTitle: 'Test winter, skill vs persistence',
      list: [
        { title: 'Skew, 6h: frozen −0.046 vs retrained +0.303', direction: 'retrain on the served AQI' },
        { title: '1h: rule +0.553 vs model +0.344', direction: 'the rule wins' },
        { title: '6h: rule +0.007 vs model +0.309', direction: 'the model wins' },
        { title: 'Dead sources: probe, shadow, gate', direction: 'see Platform' },
      ],
      finding:
        'No live forecast is being issued today. OpenAQ is behind real time, so the forecast job skips stale stations and the dashboard shows a notice and the last issued forecast as history. The skill numbers here are test-window and replay numbers, not live-scored ones; the live scoreboard fills in once forecasts mature. AQI 1h skill against plain persistence is mostly the window identity, not forecasting; the 24h AQI model has low skill and is labelled experimental; 24h PM2.5 is withheld. The replay window is Sep to Oct, a calmer season than the winter test; the 24h replay skill is not distinguishable from zero. Live AQI is recomputed from pollutants, not the official CPCB value; no NOx, NO or solar and no ITO weather on the live feed. No upstream source is both reachable and fresh (data.gov.in refuses connections; OpenAQ lags); the WAQI gate currently fails for lack of overlap with OpenAQ. The Diwali causal question cannot be answered with this data (the ban applied in every year studied).',
      figures: [
        {
          src: `${IMG}/60_train_serve_skew.webp`,
          caption:
            'Finding 1, train/serve skew. The live feed can only compute AQI from pollutants, and that series sits about 5.5 points above the official AQI the first models were trained on. On the live basis the frozen models lose their skill; retrained on the recomputed AQI (same architecture, same features) they recover it. Frozen vs retrained skill against persistence: 1h -0.084 [-0.421, +0.127] vs +0.339 [+0.267, +0.395]; 6h -0.046 [-0.235, +0.092] vs +0.303 [+0.243, +0.351]; 24h +0.080 [+0.041, +0.114] vs +0.090 [+0.051, +0.126]. An isotonic recalibration of the frozen models was tried first and rejected on validation.',
          alt: 'Dot-and-interval chart of skill against persistence at 1h, 6h and 24h for the frozen models and the live-consistent retrain.',
        },
        {
          src: `${IMG}/61_baselines_by_horizon.webp`,
          caption:
            'Finding 2, a rule beats ML at 1h; ML wins at 6h. Recomputed AQI is a trailing 24h mean, so most of what looks like 1h forecast skill is arithmetic: the hours leaving the window are already known. A parameter-free window-update rule has test skill +0.553 at 1h; the tuned model has +0.344 and loses to the rule (-0.467, CI [-0.594, -0.375]). At 6h the rule is indistinguishable from persistence (+0.007) and the model wins (+0.309 against persistence, +0.304 against the rule). So the service serves the rule at 1h and the model at 6h.',
          alt: 'Chart of skill against persistence at 1h, 6h and 24h for the window-update rule and the model, with confidence intervals.',
        },
        {
          src: `${IMG}/31_extrapolation_fix.webp`,
          caption: 'Trees cannot predict above the highest value they were trained on; the Ridge + persistence hybrid can.',
          alt: 'Tree model capped at the training maximum next to the Ridge and persistence hybrid.',
        },
        {
          src: `${IMG}/32_episode_forecast.webp`,
          caption: 'A 24-hour forecast over a smog episode: actual, persistence and the hybrid.',
          alt: 'A 30-day winter window at one station showing actual AQI, persistence and the 24h hybrid forecast.',
        },
      ],
    },
    platform: {
      subtitle: 'Finding 3, dead live sources: probe, shadow mode, gate.',
      figure: {
        src: `${IMG}/dashboard_overview_desktop.webp`,
        mobileSrc: `${IMG}/dashboard_overview_mobile.webp`,
        caption:
          'Delhi Air Forecast with no fresh data: a notice, the data age and the last issued forecast labelled as past, rather than an invented forecast.',
        alt: 'Delhi Air Forecast overview page showing a notice that readings are delayed and no current forecast is issued.',
        windowTitle: 'air-quality-risk-forecasting.vercel.app',
      },
      notes: [
        {
          title: 'Probe from where the job runs',
          body: "On 2026-10-11 from a GitHub runner (US egress): api.data.gov.in refused the connection, and OpenAQ's newest value was 91.8 h old, so the lag was the source's, not a network effect.",
        },
        {
          title: 'Shadow, not trusted',
          body: 'WAQI is ingested hourly into a separate table that forecast, scoring and API code cannot read (grants and tests enforce it), so it can be compared without being trusted.',
        },
        {
          title: 'A gate fixed in advance',
          body: 'PM only, ITO excluded, the hour offset chosen on the first half of the overlap and scored on the second, a per-station pass, run weekly with the result posted to a GitHub issue. It currently fails because there is no overlap yet.',
        },
      ],
      latency: TODO, // not applicable; leave hidden
      figures: [
        {
          src: `${IMG}/dashboard_model_health_desktop.webp`,
          mobileSrc: `${IMG}/dashboard_model_health_mobile.webp`,
          caption: 'Model health: skill against copy-last, source lag and data freshness per station.',
          alt: 'Model health page of the Delhi Air Forecast dashboard with skill cards, source lag and a data freshness table.',
        },
        {
          src: `${IMG}/dashboard_stations_desktop.webp`,
          mobileSrc: `${IMG}/dashboard_stations_mobile.webp`,
          caption: 'Stations across Delhi.',
          alt: 'Stations page of the Delhi Air Forecast dashboard.',
        },
      ],
    },
    results: {
      subtitle: 'Test winter results with persistence beside every number, and a replay on stored readings.',
      metrics: [
        { value: '+0.303', label: 'AQI 6h skill vs persistence (MAE 8.474 vs 12.153)' },
        { value: '+0.553', label: 'AQI 1h skill, rule (MAE 1.041 vs persistence 2.330)' },
        { value: '+0.364', label: 'PM2.5 6h skill (MAE 64.642 vs persistence 101.666)' },
      ],
      table: {
        title: 'Live basis, test winter 2025-11-01 to 12-31 (scored once). Skill = 1 - MAE_model / MAE_persistence, 95% day-block bootstrap',
        columns: ['PRODUCT', 'MODEL MAE', 'PERSISTENCE MAE', 'SKILL VS PERSISTENCE'],
        rows: [
          ['AQI 1h, window-update rule', '1.041', '2.330', '+0.553 [+0.510, +0.591]'],
          ['AQI 1h, LightGBM (not served)', '1.540', '2.330', '+0.339 [+0.267, +0.395]'],
          ['AQI 6h, LightGBM', '8.474', '12.153', '+0.303 [+0.243, +0.351]'],
          ['AQI 24h, hybrid (experimental)', '33.233', '36.520', '+0.090 [+0.051, +0.126]'],
          ['PM2.5 1h', '24.971', '31.281', '+0.202 [+0.183, +0.219]'],
          ['PM2.5 6h', '64.642', '101.666', '+0.364 [+0.316, +0.407]'],
          ['PM2.5 24h (withheld)', 'withheld', '75.416', 'no skill (-0.102 [-0.238, +0.010])'],
        ],
      },
      next: [
        'Issue live forecasts by themselves the first hour a source is fresh, and score them as they mature.',
        'Re-run the WAQI gate weekly; if it passes, re-fit the live models on PM-only inputs before using it.',
        'Re-run the source probe if the primary feed keeps lagging.',
      ],
      figures: [
        {
          src: `${IMG}/62_replay_skill.webp`,
          caption:
            'Replay of the production code on stored readings, 2026-09-01 to 2026-10-07 (a sanity check, not a live result). Skill vs persistence, with MAE and persistence MAE: AQI 1h +0.514 [+0.460, +0.564] (0.90 vs 1.84); AQI 6h +0.206 [+0.124, +0.285] (6.89 vs 8.67); AQI 24h -0.014 [-0.104, +0.058] (26.39 vs 26.03); PM2.5 1h +0.084 [+0.053, +0.110] (8.90 vs 9.72); PM2.5 6h +0.208 [+0.140, +0.270] (16.71 vs 21.10).',
          alt: 'Chart of replay skill against persistence for AQI 1h, 6h, 24h and PM2.5 1h and 6h, with confidence intervals.',
        },
        {
          src: `${IMG}/30_skill_vs_persistence.webp`,
          caption:
            'The original models on the official AQI (headline metrics): 1h MAE 2.29 vs persistence 2.40 (+0.047), 6h 11.84 vs 12.72 (+0.069), 24h 34.11 vs 38.34 (+0.110).',
          alt: 'MAE and RMSE skill against persistence at 1h, 6h and 24h for the original models on the official AQI.',
        },
        {
          src: `${IMG}/50_alert_tradeoff.webp`,
          caption: 'Severe-AQI alerts at 24h: precision and recall at three cutoffs, model against persistence.',
          alt: 'Precision and recall of Severe-AQI alerts at three cutoffs, model versus persistence.',
        },
        {
          src: `${IMG}/51_diwali_identification.webp`,
          caption: 'Why a naive Diwali before/after fails: pre-trend, placebo and ITS. The ban effect is not identifiable.',
          alt: 'Estimated jump in AQI after Diwali under five designs, showing why a naive before/after comparison fails.',
        },
      ],
    },
  },
};
