# Portfolio Assets — Usage Guide

How to use the 6 diagrams and the case study in your portfolio website. Everything lives in this `portfolio/` folder.

## What's in This Folder

| File | What it is | Use it for |
|---|---|---|
| `CASE_STUDY.md` | Full written case study (9 sections) | The project page body / README section |
| `01_data_pipeline.png` | 4 data sources → ELO engine → features → 2 models | "Data" section |
| `02_feature_engineering.png` | All 37 features in 7 families | "Feature Engineering" section |
| `03_model_architecture.png` | Two stage-aware XGBoost models + class balance | "Modeling" section |
| `04_feature_importance.png` | Real gain-share importances from both models | "Modeling" / "Interpretation" section |
| `05_monte_carlo.png` | 6-step simulation flow (cache → sample → groups → KO → ×10k → aggregate) | "Simulation" section |
| `06_simulation_results.png` | Champion odds, deep-run table, ELO leaders | "Results" section |
| `*.svg` (same names) | Vector versions of all 6 diagrams | Same as PNGs — use if your site supports SVG |

**Formats:** PNGs are 2560px wide (2× retina, ~250–330 KB each). SVGs scale to any size and are ~10–15 KB. Prefer **SVG** if your site allows it; fall back to **PNG** for platforms that only accept raster (e.g. some CMS uploaders).

## Recommended Page Structure

Use this order — it's the narrative arc the case study follows:

1. **Hero** — project title + 4 stat chips: `75% group accuracy` · `91.7% KO accuracy` · `19,972 matches` · `10,000 simulations`
2. **Problem** (§1 of case study)
3. **Data** (§2) — place `01_data_pipeline.png` at the top
4. **Features** (§3) — `02_feature_engineering.png`
5. **Modeling** (§4–5) — `03_model_architecture.png` then `04_feature_importance.png`
6. **Simulation** (§6) — `05_monte_carlo.png`
7. **Results** (§7) — `06_simulation_results.png`
8. **Challenges** (§8) + **Future work** (§9) — text only

## Copy-Paste Snippets

### For a Markdown-based site (GitHub README, Next.js MDX, Astro, Docusaurus)

The case study already embeds images with relative paths, so the simplest setup:

```
your-portfolio/
└── projects/
    └── fifa-predictor/
        ├── index.md          ← rename CASE_STUDY.md to this
        └── portfolio/        ← copy this whole folder here
```

Then in `index.md`, the existing `![...](portfolio/01_data_pipeline.png)` links just work.

### For a React/JSX site

```jsx
import pipeline from './assets/01_data_pipeline.png'
import features from './assets/02_feature_engineering.png'
import architecture from './assets/03_model_architecture.png'
import importance from './assets/04_feature_importance.png'
import monteCarlo from './assets/05_monte_carlo.png'
import results from './assets/06_simulation_results.png'

<img src={pipeline} alt="Data pipeline: 4 sources through ELO engine into 2 XGBoost models" />
```

*(Convert the case study text to JSX, or render the .md with a markdown loader.)*

### For Notion / WordPress / Wix / Squarespace

Drag-and-drop the **PNG files** directly. Copy the case study text section by section — Notion strips image links, so re-insert each PNG where its section heading appears.

### For a PDF (interview handout)

```bash
# any md-to-pdf tool, e.g. pandoc:
pandoc CASE_STUDY.md -o case-study.pdf
# or open CASE_STUDY.md in VS Code / Typora and "Export to PDF"
```

The images are high-resolution (2560px) so they print crisply.

## Alt Text (accessibility + SEO)

When embedding, use these alt texts — they describe what each diagram actually shows:

- **01:** "Data pipeline: 19,972 international matches, WC 2022 stats, 6 club leagues and a WC database flow through an ELO engine and feature engineering into a 256-match training set and two XGBoost models"
- **02:** "Feature engineering map: 37 features organized into 7 families — ELO, recent form, head-to-head, player quality, WC pedigree, manager and match context"
- **03:** "Two-model architecture: one 37-feature vector routed by knockout flag to a multiclass group-stage model or a binary knockout model"
- **04:** "Feature importance by gain: group model spreads influence evenly while the knockout model concentrates on World Cup pedigree"
- **05:** "Monte Carlo flow: pre-computed probability cache, sampled match outcomes, 12 group tables, recursive knockout bracket, repeated 10,000 times"
- **06:** "Simulation results: Argentina 17.1% championship probability, Spain 13.3%, France 13.2%, with deep-run rates and ELO leaders"

## Image Captions (optional, if your site shows captions)

- 01 — *Four raw sources distilled into one clean training set.*
- 02 — *Every signal encoded for both sides of the match.*
- 03 — *Group play allows draws; knockouts don't — two different problems, two models.*
- 04 — *Extracted from the trained models, not illustrative.*
- 05 — *Zero model calls during simulation — everything pre-cached.*
- 06 — *2,000 tournament runs distilled into championship odds.*

## Quick Quality Checks Before Publishing

- [ ] Images not blurry — PNGs are 2560px; don't upscale beyond that
- [ ] Diagrams legible on mobile — they're wide (1280 logical px); your site should let them scroll or stack (see CSS below)
- [ ] All numbers match the case study text (they were extracted from the real repo, so they will)
- [ ] Credit yourself — the case study is written first-person, ready to publish as-is

### Mobile-friendly embedding CSS

The diagrams are wide. If your site is responsive, wrap them so they scroll horizontally on small screens instead of shrinking to illegibility:

```css
.diagram-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.diagram-scroll img {
  min-width: 800px;   /* keeps text inside diagrams readable */
  width: 100%;
}
```

```html
<figure class="diagram-scroll">
  <img src="portfolio/05_monte_carlo.png" alt="Monte Carlo flow" />
</figure>
```

## Interview Talking Points

Each diagram maps to a question interviewers actually ask:

| If they ask… | Show / talk about |
|---|---|
| "How did you handle the data?" | 01 — the WC-only training window decision and leakage prevention |
| "What features mattered?" | 04 — elo_diff top-2 in both models; the club-to-national xG proxy |
| "Why two models?" | 03 — draws exist in groups, never in knockouts |
| "How do you know it works?" | 06 + §7 — accuracy metrics and the Germany/Argentina draw-luck finding |
| "Tell me about a hard bug" | §8 — corrupted targets and the sklearn pickle fragility |
| "What would you improve?" | §9 — calibration, time-decay, WC 2022 backtest |
