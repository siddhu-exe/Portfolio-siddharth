# MineSafe AI → Portfolio Site: Hand-off Guide

Everything needed to add this project to the portfolio site (`/home/siddharth/Desktop/Projects/projects/Portfolio`).
Follow `Portfolio/docs/ADDING_PROJECTS.md` and `Portfolio/docs/CHAPTER_PAGE.md`. Facts and copy: `ROCKEFELLER_PORTFOLIO.md`.
Regenerate drawn figures: `backend/.venv/bin/python portfolio/scripts/generate_portfolio_images.py`.

## 1. Steps
1. Copy images:
   ```bash
   D=/home/siddharth/Desktop/Projects/projects/Portfolio/frontend/public/images/minesafe-ai
   mkdir -p $D && cp portfolio/images/*.png $D/
   ```
2. Add `("MineSafe AI", [...tech], "description")` to `_CATEGORIES` and a `_DETAILS["MineSafe AI"]` entry in `Portfolio/backend/data.py`; mirror in `frontend/src/data/fallbackProjects.js`.
3. Create `frontend/src/data/projects/minesafe-ai.js` (copy `legalrag.js`) and register it in `index.js`.
4. Restart the backend, open the shelf, click the book, then **View Full Project**.

## 2. Ready-to-paste
```python
"MineSafe AI": {
    "subtitle": "Zone risk, crack reports and emergency alerts on one map.",
    "sort_order": 12, "tag": "ML", "published": True,
    "result": "4 trained models · 56K crack images · 60+ endpoints",
    "spineColor": "#4A433C",
    "thumbnail": "/images/minesafe-ai/10_architecture.png",
    "heroImage": "/images/minesafe-ai/10_architecture.png",
    "gallery_overrides": {
        "architecture": ["/images/minesafe-ai/10_architecture.png"],
        "pipeline": ["/images/minesafe-ai/20_data_model.png", "/images/minesafe-ai/31_data_distribution.png"],
        "ml": ["/images/minesafe-ai/32_ml_stack.png", "/images/minesafe-ai/35_crack_model.png", "/images/minesafe-ai/36_xgboost_results.png"],
        "platform": ["/images/minesafe-ai/33_crack_workflow.png", "/images/minesafe-ai/34_roles.png"],
        # also available: 30_risk_scoring.png (add to "pipeline" for a scroll row)
        "results": [],   # add dashboard/map screenshots here once captured
    },
},
```
Set `sort_order` to the next free number. Links: github `https://github.com/siddhu-exe/rockefeller`, demo `https://rockefeller-jade.vercel.app` (only after the demo works).

| Gallery key | Heading subtitle |
|---|---|
| architecture | React, FastAPI, MongoDB and four ML models behind one alerting pipeline. |
| pipeline | Fourteen collections and the data the risk model learns from. |
| ml | How a zone's score is built, and what happens when a model is down. |
| platform | The crack-report workflow and who is allowed to do what. |
| results | Dashboard and map views. |

Image ratios: 1 image = 16:9, 2 = 4:3 each, 3+ = scroll row. `10_architecture` and `32_ml_stack` are 16:9; the others are 4:3 / 16:9-ish.

## 3. Open items
- Capture app screenshots (`40`–`44`, §13 of the spec) after the Render backend is back up and `vercel.json` is added.
- Team project of 4; state Siddharth's role (frontend, backend, all four models) and keep the paper marked as an unpublished draft.
- Do not add unmeasured numbers (see §12 of the spec). XGBoost 90.4% is on synthetic data.
