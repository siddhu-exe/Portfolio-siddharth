"""Draws the Rockefeller / MineSafe AI portfolio figures into portfolio/images/.

Run from the repo root:  backend/.venv/bin/python portfolio/scripts/generate_portfolio_images.py
Numbers come from the repo itself: backend/app/core/rule_engine.py, backend/app/services/ml_models.py,
backend/scripts/data/zones.json and dataset/model2_training_data.csv. Nothing here is invented.
"""
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "portfolio" / "images"
OUT.mkdir(exist_ok=True)

CREAM, INK, TERRA, BRICK, MOSS, SAND, UMBER = "#F7F1ED", "#171717", "#D9834A", "#B5533C", "#3F8A5A", "#E8B48C", "#4A433C"
RISK = {"green": "#3F8A5A", "yellow": "#E0B93A", "orange": "#D9834A", "red": "#B5533C"}
plt.rcParams.update({"font.family": "DejaVu Sans", "text.color": INK, "axes.edgecolor": UMBER})


def canvas(w, h, title, sub):
    fig = plt.figure(figsize=(w, h), dpi=200, facecolor=CREAM)
    fig.text(0.04, 0.93, title, fontsize=26, fontweight="bold", va="top")
    fig.text(0.04, 0.865, sub, fontsize=13, color=UMBER, va="top")
    return fig


def box(ax, x, y, w, h, head, body="", fc="white", ec=INK, hs=12, bs=9.5):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.004,rounding_size=0.012", fc=fc, ec=ec, lw=1.4))
    ax.text(x + w / 2, y + h - 0.025, head, ha="center", va="top", fontsize=hs, fontweight="bold")
    if body:
        ax.text(x + w / 2, y + h - 0.075, body, ha="center", va="top", fontsize=bs, color=UMBER, linespacing=1.5)


def arrow(ax, a, b, label=""):
    ax.annotate("", xy=b, xytext=a, arrowprops=dict(arrowstyle="-|>", color=INK, lw=1.6))
    if label:
        ax.text((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.018, label, ha="center", fontsize=8.5, color=UMBER)


def bare(fig, rect=(0, 0, 1, 0.82)):
    ax = fig.add_axes(rect); ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis("off"); return ax


def save(fig, name):
    fig.savefig(OUT / name, facecolor=CREAM); plt.close(fig); print("wrote", name)


# 10 -- architecture ---------------------------------------------------------------------------------------------
fig = canvas(16, 9, "MineSafe AI: system architecture", "React dashboard, FastAPI service, MongoDB, four ML models and a realtime layer. Vercel + Render.")
ax = bare(fig)
box(ax, 0.02, 0.58, 0.22, 0.32, "React 18 + Vite", "MUI, React Router\nDeck.gl · MapLibre · Leaflet\nRecharts · Framer Motion\nAxios API client\nRole-gated routes", SAND)
box(ax, 0.02, 0.12, 0.22, 0.34, "Vercel (frontend)", "rockefeller-jade.vercel.app\nVITE_API_URL → Render\nService worker for\nbrowser push", "white")
box(ax, 0.34, 0.36, 0.26, 0.54, "FastAPI (Render)", "JWT auth + role checks\nRule engine: rainfall, slope,\nsoil, blasts, history\nRoutes: zones · alerts · reports ·\ncrack-reports · blasts ·\nexplorations · predictions\nDaily refresh job 06:00 IST", "white", TERRA)
box(ax, 0.34, 0.06, 0.26, 0.22, "Realtime layer", "WebSocket /ws/{user_id}\nWeb push (VAPID)", "white")
box(ax, 0.72, 0.68, 0.26, 0.22, "MongoDB (Beanie ODM)", "14 document collections\nzones · alerts · blasts · cracks…", "white", MOSS)
box(ax, 0.72, 0.32, 0.26, 0.30, "ML + AI services", "XGBoost zone risk\nProphet rainfall (36 districts)\nEfficientNetV2S crack images\nIsolation Forest blasts\nGroq LLM summaries / remarks", "white", BRICK)
box(ax, 0.72, 0.06, 0.26, 0.20, "Roles", "Admin · Safety Officer\nField Worker", "white")
arrow(ax, (0.24, 0.74), (0.34, 0.74), "REST + JWT")
arrow(ax, (0.60, 0.80), (0.72, 0.80)); arrow(ax, (0.60, 0.52), (0.72, 0.48))
arrow(ax, (0.47, 0.36), (0.47, 0.28), "events"); arrow(ax, (0.34, 0.17), (0.24, 0.17), "live alerts")
save(fig, "10_architecture.png")

# 20 -- data model -----------------------------------------------------------------------------------------------
fig = canvas(12, 9, "Data model: 14 collections", "Everything an alert needs lives next to the zone it belongs to. Beanie documents on MongoDB.")
ax = bare(fig)
groups = [
    ("Sites & risk", ["zone", "risk_prediction", "weather_record", "history (landslides)"], SAND),
    ("Field operations", ["blast_event", "exploration", "crack_report", "report"], "#EAD7B8"),
    ("Alerting", ["alert", "notification", "push_subscription"], "#F1C9B4"),
    ("People", ["user", "user_location", "worker_presence"], "#CFE3D4"),
]
for i, (g, items, c) in enumerate(groups):
    x, y = 0.03 + (i % 2) * 0.49, 0.50 - (i // 2) * 0.47
    box(ax, x, y, 0.45, 0.42, g, "\n".join("•  " + t for t in items), c, hs=15, bs=13)
save(fig, "20_data_model.png")

# 30 -- risk scoring ---------------------------------------------------------------------------------------------
fig = canvas(12, 9, "How a zone gets its risk score", "Weighted fallback formula (rule_engine.py) and the XGBoost label cut-offs (ml_models.py).")
a1 = fig.add_axes([0.30, 0.40, 0.62, 0.36])
w = {"Rainfall (24h, cap 350 mm)": 0.40, "Slope (cap 60°)": 0.20, "Soil type": 0.15, "Blasts (7d, cap 10)": 0.15, "Past landslides (cap 5)": 0.10}
a1.barh(list(w)[::-1], list(w.values())[::-1], color=[TERRA, SAND, SAND, SAND, SAND][::-1], edgecolor=INK)
for i, v in enumerate(list(w.values())[::-1]): a1.text(v + 0.008, i, f"{v:.2f}", va="center", fontsize=12, fontweight="bold")
a1.set_xlim(0, 0.5); a1.set_title("Fallback weights (sum = 1.00)", loc="left", fontsize=14, fontweight="bold")
a1.set_facecolor(CREAM); [a1.spines[s].set_visible(False) for s in ("top", "right")]
a2 = fig.add_axes([0.30, 0.10, 0.62, 0.16]); a2.set_xlim(0, 1); a2.set_ylim(0, 2.6); a2.axis("off")
a2.text(0, 2.4, "Score → label", fontsize=14, fontweight="bold")
for row, (name, cuts) in enumerate([("XGBoost (model 2)", [0, .24, .48, .72, 1]), ("Fallback formula", [0, .3, .6, 1])]):
    labs = ["green", "yellow", "orange", "red"] if len(cuts) == 5 else ["green", "yellow", "red"]
    y = 1.2 - row * 1.1
    for l, lo, hi in zip(labs, cuts, cuts[1:]):
        a2.add_patch(plt.Rectangle((lo, y), hi - lo, 0.55, fc=RISK[l], ec=INK))
        a2.text((lo + hi) / 2, y + .27, f"{l}\n{lo:g}–{hi:g}", ha="center", va="center", fontsize=8.5, color="white" if l != "yellow" else INK)
    a2.text(-0.005, y + .27, name, ha="right", va="center", fontsize=10)
save(fig, "30_risk_scoring.png")

# 31 -- data behind the models ----------------------------------------------------------------------------------
zones = json.load(open(ROOT / "backend/scripts/data/zones.json"))
train = pd.read_csv(ROOT / "dataset/model2_training_data.csv")
fig = canvas(14, 8, "The data behind the risk model", f"{len(zones)} seeded zones in {len({z['district'] for z in zones})} districts · {len(train):,} training rows · 11 features")
order = ["green", "yellow", "orange", "red"]
for k, (ttl, counts, rect) in enumerate([("Seed zones by risk level", pd.Series([z["riskLevel"] for z in zones]).value_counts(), [0.07, 0.12, 0.40, 0.64]),
                                          ("Training rows by label (synthetic)", train.risk_label.value_counts(), [0.56, 0.12, 0.40, 0.64])]):
    a = fig.add_axes(rect); vals = [int(counts.get(o, 0)) for o in order]
    a.bar(order, vals, color=[RISK[o] for o in order], edgecolor=INK)
    for i, v in enumerate(vals): a.text(i, v + max(vals) * .015, str(v), ha="center", fontsize=12, fontweight="bold")
    a.set_title(ttl, loc="left", fontsize=14, fontweight="bold"); a.set_facecolor(CREAM)
    [a.spines[s].set_visible(False) for s in ("top", "right")]
fig.text(0.56, 0.05, "No 'red' rows in the training set: the red band is reached only through the 0.72 cut-off on live scores.", fontsize=9.5, color=UMBER)
save(fig, "31_data_distribution.png")

# 32 -- ML stack -------------------------------------------------------------------------------------------------
fig = canvas(16, 9, "Four models, one decision surface", "Each model feeds the rule engine; Groq only writes the words, it never scores risk. Training data is synthetic except SDNET2018 and IMD rainfall.")
ax = bare(fig)
cards = [("XGBoost: zone risk", "11 features, 3,600 synthetic rows\n80/20 split: accuracy 90.4%,\nmacro F1 0.84\n\n→ score 0–1 → green/yellow/\norange/red"),
         ("Prophet: rainfall", "36 district models (.pkl)\n65,736 daily IMD records\n(2019–2023)\n\n→ 30-day forecast"),
         ("EfficientNetV2S: cracks", "SDNET2018, 56,092 images\n5 severity classes\nval accuracy 87.36%\n\n→ crack severity,\nalert threshold 0.68"),
         ("Isolation Forest: blasts", "1,000 synthetic blasts,\n200 trees, contamination 0.10\n\n→ anomaly score\ncritical < −0.15")]
for i, (h, b) in enumerate(cards):
    box(ax, 0.02 + i * 0.245, 0.42, 0.225, 0.40, h, b, "white", [TERRA, MOSS, BRICK, UMBER][i], hs=13, bs=9.5)
box(ax, 0.02, 0.04, 0.955, 0.16, "Rule engine + Groq LLM", "Combines model outputs with live blasts, cracks and rainfall → alerts. Groq drafts zone summaries, alert explanations and crack remarks.", SAND)
save(fig, "32_ml_stack.png")

# 33 -- crack workflow -------------------------------------------------------------------------------------------
fig = canvas(16, 7, "Crack report workflow", "From a photo in the field to a routed emergency notification.")
ax = bare(fig, (0, 0, 1, 0.78))
steps = [("Field worker", "uploads photo +\nlocation"), ("CNN + Groq", "AI risk score,\ndrafted remark"), ("Admin review", "verify · safe ·\nreject"), ("Critical?", "notify-critical\nroutes alert"), ("Workers", "WebSocket + push\nnotification")]
for i, (h, b) in enumerate(steps):
    x = 0.02 + i * 0.198
    box(ax, x, 0.25, 0.16, 0.5, h, b, SAND if i in (0, 4) else "white", hs=13, bs=10.5)
    if i: arrow(ax, (x - 0.038, 0.5), (x, 0.5))
save(fig, "33_crack_workflow.png")

# 34 -- roles -----------------------------------------------------------------------------------------------------
fig = canvas(12, 7, "Role-based access", "Three roles, enforced in the API and mirrored in the UI.")
rows = [("View alerts", 1, 1, 1), ("Submit field / crack reports", 1, 1, 1), ("Acknowledge alerts", 0, 1, 1), ("Emergency actions", 0, 1, 1), ("Resolve alerts", 0, 0, 1), ("Review crack reports", 0, 0, 1), ("Admin panel", 0, 0, 1)]
ax = bare(fig, (0.04, 0.04, 0.92, 0.76)); ax.set_ylim(0, len(rows) + 1)
for j, h in enumerate(["Field Worker", "Safety Officer", "Admin"]): ax.text(0.5 + j * 0.17, len(rows) + .4, h, ha="center", fontsize=12, fontweight="bold")
for i, (n, *v) in enumerate(rows):
    y = len(rows) - i - .1
    ax.text(0.0, y, n, fontsize=12, va="center"); ax.plot([0, .99], [y - .5, y - .5], color=SAND, lw=.8)
    for j, ok in enumerate(v): ax.text(0.5 + j * 0.17, y, "●" if ok else "–", ha="center", va="center", fontsize=15, color=MOSS if ok else UMBER)
save(fig, "34_roles.png")

# 35 -- crack model ----------------------------------------------------------------------------------------------
fig = canvas(14, 8, "Crack severity model (EfficientNetV2S)", "SDNET2018, 56,092 images. Labels are OpenCV edge-density scores, not human labels.")
a = fig.add_axes([0.07, 0.12, 0.40, 0.62]); cls = ["no_crack", "low", "moderate", "high", "critical"]; cnt = [47608, 6424, 1378, 682, 0]
a.bar(cls, cnt, color=[MOSS, "#E0B93A", TERRA, BRICK, UMBER], edgecolor=INK)
for i, v in enumerate(cnt): a.text(i, v + 900, f"{v:,}", ha="center", fontsize=10, fontweight="bold")
a.set_title("Class counts (critical = 0)", loc="left", fontsize=14, fontweight="bold"); a.set_facecolor(CREAM)
a.tick_params(axis="x", labelsize=9); [a.spines[s].set_visible(False) for s in ("top", "right")]
b = fig.add_axes([0.56, 0.12, 0.38, 0.62]); names = ["Always 'no_crack'\n(baseline)", "Phase 1\nhead only", "Phase 2\nfine-tuned (deployed)"]; acc = [84.9, 86.28, 87.36]
b.bar(names, acc, color=[SAND, TERRA, BRICK], edgecolor=INK); b.set_ylim(80, 90)
for i, v in enumerate(acc): b.text(i, v + 0.2, f"{v}%", ha="center", fontsize=12, fontweight="bold")
b.set_title("Validation accuracy (10 + 10 epochs)", loc="left", fontsize=14, fontweight="bold"); b.set_facecolor(CREAM)
b.tick_params(axis="x", labelsize=9); [b.spines[s].set_visible(False) for s in ("top", "right")]
fig.text(0.07, 0.04, "Only ~2.5 points above the baseline; test-split metrics (5,612 images) were not recorded. 224×224 input, ~20.7M parameters.", fontsize=9.5, color=UMBER)
save(fig, "35_crack_model.png")

# 36 -- xgboost results -----------------------------------------------------------------------------------------
fig = canvas(14, 8, "Zone-risk model (XGBoost) on a synthetic set", "3,600 generated zone-days, 720 test rows. Labels come from the same weighted formula, so the setup is circular.")
a = fig.add_axes([0.07, 0.12, 0.38, 0.62]); lab = ["green", "yellow", "orange"]; f1 = [0.86, 0.93, 0.74]
a.bar(lab, f1, color=[RISK[l] for l in lab], edgecolor=INK); a.set_ylim(0, 1.05)
for i, v in enumerate(f1): a.text(i, v + 0.02, f"{v:.2f}", ha="center", fontsize=12, fontweight="bold")
a.set_title("F1 per class (red: no rows)", loc="left", fontsize=14, fontweight="bold"); a.set_facecolor(CREAM)
[a.spines[s].set_visible(False) for s in ("top", "right")]
b = fig.add_axes([0.62, 0.12, 0.33, 0.62]); ft = ["blast_count_7d", "avg_crack_score", "is_monsoon"]; im = [23.6, 18.4, 17.8]
b.barh(ft[::-1], im[::-1], color=TERRA, edgecolor=INK)
for i, v in enumerate(im[::-1]): b.text(v + 0.4, i, f"{v}%", va="center", fontsize=11, fontweight="bold")
b.set_xlim(0, 30); b.set_title("Top 3 of 11 features", loc="left", fontsize=14, fontweight="bold"); b.set_facecolor(CREAM)
[b.spines[s].set_visible(False) for s in ("top", "right")]
fig.text(0.07, 0.04, "Accuracy 90.4%, macro F1 0.84, weighted F1 0.90. Orange recall 0.65. Not evidence of real-world accuracy.", fontsize=9.5, color=UMBER)
save(fig, "36_xgboost_results.png")
