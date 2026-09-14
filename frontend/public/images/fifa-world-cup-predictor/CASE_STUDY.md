# FIFA World Cup 2026 — ML Tournament Predictor

> **Data science case study:** predicting every match of a 104-game tournament by training stage-aware XGBoost models on 19,972 historical matches, then distilling 10,000 Monte Carlo tournament simulations into championship probabilities.

**Role:** End-to-end data science — data pipeline, feature engineering, modeling, simulation, analysis
**Stack:** Python · XGBoost · pandas · NumPy · scikit-learn
**Core result:** 75% group-stage accuracy · 91.7% knockout accuracy (ROC-AUC 0.90) · full probability distribution over tournament outcomes for all 48 teams

---

## 1 · The Problem

Football match prediction is deceptively hard. A single knockout match is close to a coin flip for evenly-matched teams, bookmakers compress decades of knowledge into single odds, and the World Cup's new 48-team format has **never happened before** — there is no historical data for this exact tournament structure.

So instead of asking *"who wins each match?"*, I reframed it as a **probability problem**:

1. Can I estimate P(home win / draw / away win) for any pair of national teams from historical data?
2. Can I then propagate those match-level probabilities through the entire tournament structure to get **championship odds for all 48 teams**?

The second question is what a Monte Carlo simulation answers — and it's what makes this a statistics project, not a classification demo.

---

## 2 · Data

![Data Pipeline](portfolio/01_data_pipeline.png)

Four raw sources, cleaned and unified into one training set:

| Source | Size | Provides |
|---|---|---|
| International match results | **19,972 matches** (2006–2026) | World Cups, qualifiers, friendlies — the backbone for ELO ratings and form |
| WC 2022 match & player stats | 12 stat tables | Possession, shots, cards — the most recent tournament benchmark |
| Club league data (Understat) | 6 top leagues, 2015–2022 | Player-level xG, xA, form — proxied up to national teams |
| WC historical database | 25+ tables, 1930–2022 | Titles, stages reached, manager records |

**Key data decisions:**

- **Training window = World Cups 2006–2018 only.** International football's variance makes friendlies and qualifiers noisy; a model trained on 4 clean tournaments (256 matches) beat one trained on everything.
- **Every feature is pre-match.** Nothing that leaks the result — no goals scored, no possession *of that match* — enters the feature vector.
- **Both perspectives encoded.** Every signal exists for home *and* away sides, so the model can learn asymmetries.

---

## 3 · Feature Engineering — 37 Features, 7 Families

![Feature Engineering](portfolio/02_feature_engineering.png)

| Family | Count | Signals |
|---|---|---|
| ELO ratings | 3 | `home_elo`, `away_elo`, `elo_diff` — strength from replaying all 19,972 matches through an ELO engine (K=40) |
| Recent form | 4 | rolling last-5 / last-10 results per side |
| Head-to-head | 9 | historic win rate, goal difference — overall *and* per side |
| Player quality | 8 | club-aggregated form score, **star-player form**, xG/90, xA/90 |
| WC pedigree | 8 | titles, avg stage last-3 WCs, KO win rate, appearances |
| Manager | 4 | WC win rate, experience |
| Context | 1 | `knockout_flag` — routes to the right model |

The player-quality family is the one I'm proudest of: since national squads are drawn from clubs, I aggregated **Understat club statistics per national team** — so Spain's attack partially reflects the xG their players actually generate for Real Madrid, Barcelona, etc. That's a proxy most match predictors skip.

---

## 4 · Modeling — Two Stage-Aware XGBoost Models

![Model Architecture](portfolio/03_model_architecture.png)

One insight drives the design: **group football and knockout football are different problems.**

- Group matches can end in a draw → **multiclass** model (H/D/A), `multi:softprob`, 204 trees
- Knockout matches always produce a winner (extra time, penalties) → **binary** model (H/A), `binary:logistic`, 145 trees

Training data: 192 group matches (H 42.6% / A 35.2% / D 22.3%) and 64 knockout matches from WC 2006–2018.

| Model | Task | Accuracy | Secondary metric |
|---|---|---|---|
| Group stage | 3-class | **75.0%** | F1 0.714 |
| Knockout | 2-class | **91.7%** | ROC-AUC 0.900 |

Models saved in XGBoost's **native JSON format** — pickle-free, portable across environments (a lesson learned the hard way; see §7).

---

## 5 · What the Models Learned

![Feature Importance](portfolio/04_feature_importance.png)

Feature importance by gain share, extracted from the trained models, revealed two distinct regimes:

**Group stage — influence is spread evenly.** The top feature (`elo_diff`, 6.5%) barely outweighs manager quality (6.1%), away titles (5.7%) and form (~3.8%). Winning group games requires *everything working together*.

**Knockouts — pedigree concentrates.** `away_wc_titles` alone holds **13.8%** of gain; the top 3 features carry 35% of all importance. When the pressure maxes out, tournament history separates teams.

`elo_diff` ranks top-2 in both — the relative-strength signal built by replaying 19,972 matches is the backbone of the system.

---

## 6 · Monte Carlo Simulation — 10,000 Tournaments

![Monte Carlo Flow](portfolio/05_monte_carlo.png)

With match probabilities in hand, the tournament becomes a stochastic process:

1. **Pre-compute** all C(48,2) = **1,128 matchups** × 2 models = 2,256 probability vectors at startup — the simulation itself never calls a model, making 10,000 tournament runs pure lookups
2. **Sample** each match outcome from its cached probability vector
3. **Build 12 group tables** — points → goal difference → goals for, with the 8 best third-placed teams advancing (new 2026 format)
4. **Play the knockout bracket** recursively — R32 → R16 → QF → SF → Final, ELO updated after every result
5. **Repeat × 10,000** — over **1 million matches** simulated
6. **Aggregate** — champion frequency per team = P(team wins the World Cup)

The output isn't one bracket prediction — it's the **full space of what could happen**, including advancement probabilities at every round for all 48 teams.

---

## 7 · Results

![Simulation Results](portfolio/06_simulation_results.png)

**Championship odds (2,000-run run shown):**

| Team | Semis | Final | **Champion** |
|---|---|---|---|
| Argentina | 35.5% | 26.3% | **17.1%** |
| Spain | 32.0% | 20.6% | **13.3%** |
| France | 27.5% | 19.9% | **13.2%** |
| Morocco | 32.8% | 19.1% | **10.8%** |
| Germany | 35.9% | 20.3% | **10.2%** |
| England | 24.4% | 16.5% | **10.0%** |

The simulation surfaces non-obvious structure: **Germany reaches the semis most often (35.9%) but converts finals less often than Argentina** — draw luck in the bracket matters as much as team strength. A single-bracket prediction can't show this; a distribution can.

---

## 8 · Challenges & Debugging

Three failures taught me the most in this project:

**Corrupted training targets.** The inherited dataset had every group match labelled "draw" and every knockout match "away win" — the models were confidently learning noise. I rebuilt the labelling from WC 2022 raw data with strict score parsing ("2–1" → 2:1), restoring a balanced H/D/A distribution.

**Pickled-model version fragility. sklearn's `LabelEncoder` pickle broke across sklearn 1.6 → 1.9.** Fix: keep XGBoost models in native JSON (pickle-free) and ship a script that regenerates the tiny encoder deterministically. Now the whole system survives dependency upgrades.

**Missing metadata crash.** An empty `team_wc_history.csv` crashed model loading with `EmptyDataError`. Rebuilt it for all 48 qualified teams with title history — and added defensive loading so the pipeline degrades gracefully instead of dying.

---

## 9 · What I'd Do Next

- **Calibration checking** — reliability curves per class; if P(draw)=0.22 says 22%, the Monte Carlo inherits that honesty
- **Time-decay weighting** — 2006 matches shouldn't count as much as 2018 in training
- **Poisson goal model** — predicting scorelines, not just outcomes, would improve the goal-difference tiebreakers
- **Backtesting against WC 2022** — hold out the last tournament and score the simulation's pre-tournament odds against reality

---

*All figures, metrics and rankings in this case study are extracted from the project's actual datasets, trained model artifacts, and simulation runs — not illustrative placeholders.*
