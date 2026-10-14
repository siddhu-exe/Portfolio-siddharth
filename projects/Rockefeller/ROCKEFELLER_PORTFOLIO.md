# MineSafe AI (Rockefeller): Mine Safety Risk Platform

> **Portfolio case-study spec.** Every number comes from this repo: `backend/app/core/rule_engine.py`,
> `backend/app/services/ml_models.py`, `backend/scripts/data/zones.json`, `dataset/` and the project docs. If this file and
> the code disagree, the code wins. **No model accuracy metrics are recorded in the repo, so none are claimed here.**

---

# 1. Identity
- **Title:** MineSafe AI (Rockefeller): Mine Safety Risk Monitoring Platform
- **One-liner:** A full-stack platform that scores landslide/rockfall risk per mine zone, tracks blasts, cracks and rainfall, and routes alerts to the right people in real time.
- **Short description (card):** React + FastAPI + MongoDB platform with four ML models (XGBoost, Prophet, Keras CNN, Isolation Forest), role-based workflows and WebSocket/push alerts.
- **Type / role:** College mini-project, team of 4 (Siddharth Dongardive, Astha Ghag, Trupti Gawai, Nandish Ghela). **Siddharth built the React/Vite frontend and the FastAPI + MongoDB backend, and trained all four models.**
- **Paper:** "Rockefeller Sentinel", unpublished draft, Siddharth first author. Do not present as published.
- **Shelf tag:** `ML` (alt: `APP`) · **Year:** 2026
- **Slug:** `minesafe-ai`
- **Tags:** React, FastAPI, MongoDB, XGBoost, Prophet, Keras, Isolation Forest, Groq, WebSocket, Leaflet/Deck.gl, Vercel, Render

# 2. Links
| | |
|---|---|
| GitHub | https://github.com/siddhu-exe/rockefeller (fork of nandish0403/rockefeller) |
| Frontend (Vercel) | https://rockefeller-jade.vercel.app |
| Backend (Render) | https://rockefeller-backend.onrender.com (health: `/api/health`) |

**Status caveats (as of 2026-10-14):** the Render backend health check timed out (likely free-tier cold start; open it before sharing the link), and Vercel returns 404 for deep links
(`/login`, `/dashboard`…) because there is no `vercel.json` SPA rewrite. Fix both before linking a live demo.

# 3. Problem
Mine safety teams juggle rainfall, slope stability, blasting, crack inspections and worker locations in separate tools.
Risk is noticed late and alerts reach the wrong people. This platform puts those signals on one map, scores each zone,
and pushes critical events to workers the moment they happen.

# 4. What it does
- **Zone risk intelligence:** per-zone score from rainfall, slope, soil, blasts, past landslides and cracks; four risk levels on an interactive map.
- **Crack operations:** photo upload, CNN risk score, Groq-drafted remarks, admin verify / safe / reject, critical-case routing.
- **Blasts and explorations:** event logging with Isolation Forest anomaly warnings.
- **Rainfall forecasting:** 36 district Prophet models, refreshed daily at 06:00 IST.
- **Realtime comms:** in-app notifications, WebSocket (`/ws/{user_id}`), browser push (VAPID).
- **Roles:** Admin, Safety Officer, Field Worker, enforced in API and UI.

# 5. Architecture
`React 18 + Vite` → REST + JWT → `FastAPI` → `MongoDB (Beanie)` + ML services + WebSocket/push. Frontend on Vercel, backend on Render.
Figure: `images/10_architecture.png`.

Frontend: MUI, React Router, Deck.gl, MapLibre, React Leaflet, Recharts, Framer Motion, Axios. Context providers for auth,
notifications and theme. Pages: dashboard, map, zone details, alerts, crack reports, reports, analytics, predictions, IoT sensors, blasts, explorations, admin.

# 6. Data
- **14 collections:** zone, alert, blast_event, crack_report, exploration, history, notification, push_subscription, report, risk_prediction, user, user_location, weather_record, worker_presence (`images/20_data_model.png`).
- **Seed data:** 45 zones across 24 districts and 38 mines (17 yellow, 13 green, 10 orange, 5 red).
- **Risk-model training set:** 3,600 rows, 11 features; labels 2,450 yellow / 996 green / 154 orange / 0 red (`images/31_data_distribution.png`).
- **Rainfall:** IMD rainfall 2019–2023, 65,736 rows, one Prophet model per district (36).

# 7. Machine learning (`images/32_ml_stack.png`)
| Model | Data | Result (honest) |
|---|---|---|
| **XGBoost** zone risk | 3,600 **synthetic** zone-days from a weighted formula (yellow 2,450, green 996, orange 154, red 0); 11 features; 80/20 stratified, 720 test rows | Accuracy 90.4%, macro F1 0.84, weighted F1 0.90. F1: green 0.86, yellow 0.93, orange 0.74 (orange recall 0.65). Top features: blast_count_7d 23.6%, avg_crack_score 18.4%, is_monsoon 17.8%. **Circular:** labels come from the same formula as the features. |
| **EfficientNetV2S** crack severity (TF/Keras) | SDNET2018, 56,092 images (8,484 cracked, 47,608 not). 5 severity classes from an **OpenCV edge-density score, not human labels**: no_crack 47,608, low 6,424, moderate 1,378, high 682, critical 0. Split 42,068 / 8,412 / 5,612 | Phase 1 (head only, 10 epochs) val acc 86.28%; Phase 2 (fine-tune, 10 epochs) **87.36%**, val loss 0.3771, deployed as `model1_best_phase2.keras`. 224×224 input, ~20.7M params, alert threshold 0.68. Always answering "no_crack" scores 84.9%, so the gain is ~2.5 points. Test-split metrics not recorded. |
| **Prophet** rainfall | 65,736 daily IMD records (1,826 days × 36 districts, 2019–2023) | 36 district models, 30-day forecast. No clean holdout error yet; the paper's 8.3 mm/day was tested on a year inside the training data, so do not quote it. |
| **Isolation Forest** blast anomaly | 1,000 synthetic blasts (900 normal, 100 anomalous), 200 trees, contamination 0.10 | Flagged 9 of the last 10 injected anomalies in the Colab check. Severity: critical < −0.15, warning −0.15 to 0, normal ≥ 0. The paper's 94% recall is not shown anywhere; do not quote it. |
| **Groq LLM** | n/a | Text only: zone summaries, alert explanations, crack remarks. |

Figures: `images/32_ml_stack.png`, `35_crack_model.png`, `36_xgboost_results.png`.

**XGBoost settings disagree:** the repo script (`train.py`) uses 200 trees, depth 6, learning rate 0.1; the paper says 300 / 7 / 0.08. Confirm which one the saved model uses. The Colab results above are not saved in the repo.

**Still missing:** crack-model per-class precision/recall and macro F1 on the 5,612-image test split; a clean Prophet holdout error; the XGBoost settings of the saved model.

# 8. Workflows
- **Crack report** (`images/33_crack_workflow.png`): worker uploads photo → CNN + Groq draft → admin review → critical notify → WebSocket/push to workers.
- **Roles** (`images/34_roles.png`): field worker views alerts and submits reports; safety officer acknowledges alerts and runs emergency actions; admin resolves alerts, reviews cracks and manages users.

# 9. Engineering highlights (defensible)
- Resilient scoring: ML primary, weighted rule-engine fallback.
- Four different model families behind one API, loaded at startup with a status endpoint.
- Realtime path end to end: WebSocket with auto-reconnect plus service-worker push.
- Deployed split: Vite on Vercel, FastAPI on Render, CORS allow-list plus preview-deploy regex.
- Daily rainfall/prediction refresh job, configurable by env (`DAILY_REFRESH_*`).

# 10. Stats for the card (4 tiles)
`4` trained models · `56,092` crack images · `60+` API endpoints · `36` district rainfall models

# 11. Repo facts and authorship
- ~18 page routes, 17 backend route modules / 65 route decorators (say "60+ endpoints"), 14 database models, 1 WebSocket endpoint.
- 46 commits on `main` (only branch). 36 (~78%) are under Siddharth's identity (name variants "unknown" 26, "Siddharth23052005" 8, "Siddharth Dongardive" 2); 3 under Trupti's email, 2 Nandish, 1 Astha, 4 Copilot bot. Ignore the "+1.7M lines" figure: it is data and model files.
- No test suite. Rule-engine fallback if a model fails to load; daily rainfall refresh at 06:00 IST.

# 11b. Planned work (do not present as shipped)
A Flutter mobile app is specified in `app.md` but is not in this repo.

# 12. Claims to avoid
- ❌ Flutter mobile app (plan only, `app.md`) · a test suite (none) · "production-ready" · real mine data.
- ❌ The paper's 30-day simulation (47 alerts, 41 correct, 87% precision on 12 synthetic zones), 2.3 s latency, 200 ms WebSocket delivery.
- ❌ Prophet 8.3 mm/day error (leaked holdout) and Isolation Forest 94% recall (unshown).
- ❌ "Published paper": it is a draft.
- ⚠️ Say "90.4% on a synthetic set" for XGBoost, never plain "90% accurate".
- ⚠️ Say "87.4% validation accuracy vs an 84.9% majority baseline" for the crack model; severity labels are algorithmic.
- ⚠️ Present it as a college team project with Siddharth's contribution stated.

# 13. Image checklist
| File | Status |
|---|---|
| `10_architecture.png`, `20_data_model.png`, `30_risk_scoring.png`, `31_data_distribution.png`, `32_ml_stack.png`, `33_crack_workflow.png`, `34_roles.png`, `35_crack_model.png`, `36_xgboost_results.png` | Generated |
| `40_dashboard.png`, `41_map.png`, `42_alerts.png`, `43_crack_reports.png`, `44_predictions.png` (1440×900) | **Needed:** capture once the backend is up |
