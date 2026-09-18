"""Seed project data — 2 placeholder projects per category (10 total).

Colors are drawn from a fixed palette that avoids pure black/white so book
spines read against the shelf. The color here is the source of truth; the
frontend renders it directly.

Each category carries a subtitle used as the shelf's small caption.
"""

PALETTE = [
    "#D9834A",  # terracotta
    "#E4A356",  # amber
    "#7FA98F",  # sage
    "#6C8EBF",  # slate blue
    "#B5729B",  # mauve
    "#C9695A",  # clay red
    "#5C9EAD",  # teal
    "#D4A24E",  # mustard-gold
    "#8A7FB5",  # violet
    "#A9884E",  # bronze
]

# (name, subtitle, [(title, [tech...], description)])
_CATEGORIES = [
    (
        "Data Analytics",
        "Extracting insights from data to drive better decisions.",
        [
            (
                "Customer Churn Analysis",
                ["Pandas", "SQL", "Matplotlib"],
                "An exploratory analysis of customer behaviour that identifies the "
                "drivers of churn and quantifies their impact, turning raw activity "
                "logs into retention recommendations.",
            ),
            (
                "Retail Sales Analysis",
                ["Pandas", "NumPy", "Seaborn"],
                "A deep dive into multi-store retail sales — seasonality, category "
                "performance and regional trends — surfaced through clear, "
                "decision-ready summaries.",
            ),
        ],
    ),
    (
        "Data Visualization",
        "Transforming complex data into clear and interactive stories.",
        [
            (
                "Sales Dashboard (Tableau)",
                ["Tableau", "SQL", "Excel"],
                "An interactive Tableau dashboard tracking revenue, targets and KPIs "
                "across regions, letting stakeholders slice the numbers without "
                "touching a spreadsheet.",
            ),
            (
                "IPL Data Visualization",
                ["Python", "Plotly", "Pandas"],
                "A visual exploration of a decade of IPL cricket data — player form, "
                "team match-ups and venue effects — rendered as interactive charts "
                "that tell the story at a glance.",
            ),
        ],
    ),
    (
        "Machine Learning",
        "Building predictive models that learn from data.",
        [
            (
                "Delhi Air Quality Risk Forecasting",
                ["Python", "PostgreSQL", "LightGBM", "Statsmodels", "Streamlit"],
                "Operational multi-horizon forecasting (1h, 6h, 24h), cost-sensitive "
                "CPCB risk alerting, and econometric policy evaluation across 7 continuous "
                "Delhi monitoring stations.",
            ),
            (
                "FIFA World Cup Predictor",
                ["Python", "XGBoost", "scikit-learn", "Pandas", "NumPy"],
                "Dual stage-aware XGBoost models predicting every match of the 48-team "
                "2026 tournament, distilled through 10,000 Monte Carlo simulations into "
                "full championship odds.",
            ),
        ],
    ),
    (
        "Deep Learning",
        "Solving complex problems using neural networks and computer vision.",
        [
            (
                "Alzheimer's MRI Detection",
                ["TensorFlow", "CNN", "OpenCV"],
                "A convolutional neural network that classifies brain-MRI scans "
                "across stages of Alzheimer's, built with strong preprocessing and "
                "augmentation for reliable results.",
            ),
            (
                "Plant Disease Detection",
                ["PyTorch", "CNN", "OpenCV"],
                "A vision model that identifies crop diseases from leaf images, "
                "trained to generalise across lighting and background so it works in "
                "the field, not just the lab.",
            ),
        ],
    ),
    (
        "AI Applications",
        "Creating intelligent systems powered by modern AI.",
        [
            (
                "RAG Chatbot",
                ["LangChain", "FastAPI", "OpenAI"],
                "A retrieval-augmented chatbot that answers questions grounded in a "
                "private document set, served through a FastAPI backend with "
                "citations for every response.",
            ),
            (
                "AI Research Assistant",
                ["LangGraph", "RAG", "Chroma"],
                "An agentic research assistant that plans, searches and synthesises "
                "sources into cited briefings, orchestrated as a multi-step "
                "LangGraph workflow.",
            ),
        ],
    ),
]


# Per-category step flow for "The Approach" (data-driven; count varies).
_APPROACH_STEPS = {
    "Data Analytics": ["Collect", "Clean", "Explore", "Insight"],
    "Data Visualization": ["Model Data", "Design", "Build", "Publish"],
    "Machine Learning": ["Data Prep", "Features", "Train", "Evaluate", "Tune"],
    "Deep Learning": ["Collect", "Augment", "Build CNN", "Train", "Validate"],
    "AI Applications": ["Ingest", "Embed", "Retrieve", "Generate", "Serve"],
}

# Gallery sections shown on the Chapter page, in this fixed order. Every
# project gets all five (data-driven — no per-project markup); `images` counts
# per section drive the gallery layout (1 = full width, 2 = side-by-side,
# 3+ = horizontal scroll). Projects with fewer real assets can list 1 image and
# still get the right layout automatically.
_GALLERY_TEMPLATE = [
    ("architecture", "Architecture", "The complete system architecture, from data collection to prediction.", 1),
    ("pipeline", "Data Pipeline", "From raw data to production-ready predictions and features.", 2),
    ("ml", "Machine Learning", "How the model learns, evaluates, and predicts outcomes.", 3),
    ("platform", "Platform", "Interactive dashboards and prediction experiences built for users.", 2),
    ("results", "Results", "The final outcome of the project and its key achievements.", 1),
]

# Per-project emoji + year for the Chapter page header, keyed by title.
_HEADER_META = {
    "FIFA World Cup Predictor": {"emoji": "⚽", "year": 2026},
    "Delhi Air Quality Risk Forecasting": {"emoji": "🌫️", "year": 2026},
}

# Per-project case-study copy, keyed by title. Every field is optional; the
# builder fills sensible defaults so the page always renders.
_DETAILS = {
    "Customer Churn Analysis": {
        "subtitle": "Finding why customers leave — before they do.",
        "problem": "A subscription business was shedding customers without knowing why. "
        "Retention calls were made on gut feel, and no one could name the behaviours that "
        "reliably preceded a cancellation.",
        "data_text": "Twelve months of anonymised account activity — logins, feature usage, "
        "support tickets and billing events — joined across three tables into a single "
        "per-customer view of roughly 40k records.",
        "data_visual": True,
        "metric": "23%",
        "metric_label": "of churn traced to three behaviours",
        "result_visual": False,
        "reflection": "The hardest part wasn't the analysis — it was resisting the urge to "
        "over-explain. One clear chart moved the retention team more than a page of "
        "statistics ever could.",
    },
    "Retail Sales Analysis": {
        "subtitle": "Turning a year of receipts into a plan.",
        "problem": "A multi-store retailer had rich sales history but no shared read on what "
        "was actually driving revenue — seasonality, region and category effects were all "
        "tangled together.",
        "data_text": "Point-of-sale exports across stores and quarters, normalised into a "
        "tidy fact table with date, store, category and margin dimensions.",
        "data_visual": False,
        "metric": "3x",
        "metric_label": "faster monthly reporting cycle",
        "result_visual": True,
        "reflection": "Good analysis is mostly good bookkeeping. Once the data model was "
        "honest, the insights almost wrote themselves.",
    },
    "Sales Dashboard (Tableau)": {
        "subtitle": "One source of truth stakeholders actually open.",
        "problem": "Leadership was drowning in spreadsheets that never agreed with each "
        "other. Every meeting started by arguing about whose numbers were right.",
        "data_text": "A modelled sales mart feeding Tableau, with row-level security so each "
        "region sees only its own performance against target.",
        "data_visual": True,
        "metric": "40%",
        "metric_label": "fewer ad-hoc report requests",
        "result_visual": True,
        "reflection": "A dashboard succeeds when it becomes boring — when people stop "
        "asking for numbers because they already trust the ones on screen.",
    },
    "IPL Data Visualization": {
        "subtitle": "A decade of cricket, told visually.",
        "problem": "Ten seasons of match data held great stories, but they were buried in "
        "rows and columns no fan would ever scroll through.",
        "data_text": "Ball-by-ball and match-level datasets covering teams, venues and "
        "players, reshaped for interactive exploration.",
        "data_visual": False,
        "metric": "10",
        "metric_label": "seasons made explorable at a glance",
        "result_visual": True,
        "reflection": "Charts are an argument. The moment I stopped decorating and started "
        "pointing at one idea per view, the whole thing clicked.",
    },
    "Delhi Air Quality Risk Forecasting": {
        "subtitle": "Multi-horizon forecasting, CPCB risk alerting, and causal policy evaluation.",
        "thumbnail": "/images/delhi-air-quality-risk-forecasting/01_dashboard_hero.png",
        "heroImage": "/images/delhi-air-quality-risk-forecasting/01_dashboard_hero.png",
        "description": "An end-to-end operational ML system and econometric audit delivering 1h/6h/24h air quality forecasts, automated CPCB/GRAP emergency risk alerts, and causal evaluation of Delhi's Diwali firecracker ban across 7 continuous monitoring stations.",
        "links": {
            "github": "https://github.com/Siddharth23052005/Air-quality-risk-forecasting",
            "demo": None,
        },
        "gallery_overrides": {
            "architecture": ["/images/delhi-air-quality-risk-forecasting/02_system_architecture.png"],
            "pipeline": ["/images/delhi-air-quality-risk-forecasting/03_postgres_erd_schema.png"],
            "ml": [
                "/images/delhi-air-quality-risk-forecasting/04_forecasting_performance.png",
                "/images/delhi-air-quality-risk-forecasting/05_severe_episode_tracking.png",
            ],
            "platform": ["/images/delhi-air-quality-risk-forecasting/01_dashboard_hero.png"],
            "results": [
                "/images/delhi-air-quality-risk-forecasting/06_cost_sensitive_threshold.png",
                "/images/delhi-air-quality-risk-forecasting/07_diwali_causal_analysis.png",
            ],
        },
    },
    "FIFA World Cup Predictor": {
        "subtitle": "Forecasting 104 matches through dual stage-aware models and 10,000 tournament simulations.",
        "thumbnail": "/images/fifa-world-cup-predictor/frontpage.png",
        "heroImage": "/images/fifa-world-cup-predictor/03_model_architecture.png",
        "links": {
            "github": "https://github.com/siddhu-exe/Fifa-predictor",
            "demo": "https://fifa-predictor-kohl.vercel.app",
        },
        "gallery_overrides": {
            "architecture": ["/images/fifa-world-cup-predictor/03_model_architecture.svg"],
            "pipeline": [
                "/images/fifa-world-cup-predictor/01_data_pipeline.svg",
                "/images/fifa-world-cup-predictor/02_feature_engineering.svg",
            ],
            "ml": ["/images/fifa-world-cup-predictor/04_feature_importance.svg"],
            "platform": ["/images/fifa-world-cup-predictor/05_monte_carlo.svg"],
            "results": ["/images/fifa-world-cup-predictor/06_simulation_results.svg"],
        },
    },
    "Alzheimer's MRI Detection": {
        "subtitle": "Reading brain scans stage by stage.",
        "problem": "Distinguishing early stages of Alzheimer's from MRI is subtle work, and "
        "the available scans were limited and unevenly distributed across classes.",
        "data_text": "Labelled brain-MRI images across four stages, standardised and heavily "
        "augmented to help the network generalise beyond the training set.",
        "data_visual": True,
        "metric": "94%",
        "metric_label": "validation accuracy across 4 stages",
        "result_visual": True,
        "reflection": "Augmentation did more than any architecture tweak. Teaching the model "
        "what didn't matter was how it learned what did.",
    },
    "Plant Disease Detection": {
        "subtitle": "Diagnosing crops from a single leaf.",
        "problem": "A model that only works on clean lab photos is useless in a field. Real "
        "leaves come with messy light, backgrounds and angles.",
        "data_text": "Thousands of leaf images spanning healthy and diseased classes, "
        "augmented for lighting and orientation robustness.",
        "data_visual": False,
        "metric": "96%",
        "metric_label": "accuracy on unseen field images",
        "result_visual": True,
        "reflection": "The lab-to-field gap humbled me. The win came from making the data "
        "harder, not the model bigger.",
    },
    "RAG Chatbot": {
        "subtitle": "Answers grounded in your own documents.",
        "problem": "General chatbots confidently invent answers. For a private knowledge "
        "base, a plausible-sounding hallucination is worse than no answer at all.",
        "data_text": "A corpus of internal documents chunked, embedded and stored in a vector "
        "index, retrieved at query time to ground every response.",
        "data_visual": True,
        "metric": "100%",
        "metric_label": "of answers returned with citations",
        "result_visual": False,
        "reflection": "Retrieval quality, not the language model, decided everything. Get the "
        "right paragraph in front of the model and the hard part is already done.",
    },
    "AI Research Assistant": {
        "subtitle": "An agent that plans, reads and cites.",
        "problem": "Synthesising research by hand is slow and easy to bias. I wanted a system "
        "that could gather sources and show its work, not just its conclusions.",
        "data_text": "Live retrieval over web and document sources, orchestrated as a "
        "multi-step LangGraph workflow that plans before it writes.",
        "data_visual": False,
        "metric": "5",
        "metric_label": "sources synthesised per briefing, with citations",
        "result_visual": False,
        "reflection": "Giving the agent a plan step changed its character entirely — it went "
        "from a fast guesser to something that could actually be reviewed.",
    },
}


def _slugify(title: str) -> str:
    slug = "".join(c if c.isalnum() else "-" for c in title.lower())
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")


def build_projects():
    projects = []
    idx = 0
    for category, _subtitle, items in _CATEGORIES:
        for title, tech, description in items:
            idx += 1
            color = PALETTE[(idx - 1) % len(PALETTE)]
            slug = _slugify(title)
            bare = color.lstrip("#")
            d = _DETAILS.get(title, {})

            def _img(label, w=1200, h=675):
                text = label.replace(" ", "+")
                return f"https://placehold.co/{w}x{h}/{bare}/F7F1ED?text={text}"

            steps = _APPROACH_STEPS.get(category, ["Explore", "Build", "Ship"])
            meta = _HEADER_META.get(title, {})
            gallery_overrides = d.get("gallery_overrides", {})

            gallery = [
                {
                    "key": key,
                    "heading": heading,
                    "subtitle": subtitle,
                    "images": gallery_overrides.get(key) or [
                        _img(f"{title} — {heading} {n + 1}", 900, 600) for n in range(count)
                    ],
                }
                for key, heading, subtitle, count in _GALLERY_TEMPLATE
            ]

            projects.append({
                "id": idx,
                "title": title,
                "slug": slug,
                "category": category,
                "color": color,
                "emoji": meta.get("emoji", "📘"),
                "year": meta.get("year", 2026),
                "subtitle": d.get("subtitle", description.split(".")[0] + "."),
                "thumbnail": (
                    d.get("thumbnail")
                    or f"https://placehold.co/600x400/{bare}/171717?text={category.replace(' ', '+')}"
                ),
                "heroImage": d.get("heroImage") or _img(title),
                "description": d.get("description", description),
                "problem": d.get("problem", description),
                "data": {
                    "text": d.get("data_text", "A curated dataset assembled and cleaned for "
                            "this project, shaped into an analysis-ready form."),
                    "visual": _img(f"{category} — Data", 900, 640) if d.get("data_visual") else None,
                },
                "approach": {"steps": [{"label": s} for s in steps]},
                "result": {
                    "metric": d.get("metric", "—"),
                    "label": d.get("metric_label", "headline outcome"),
                    "visual": _img(f"{title} — Result", 1000, 620) if d.get("result_visual") else None,
                },
                "reflection": d.get("reflection", "Every project on the shelf leaves a lesson "
                        "behind — this one sharpened how I think about the problem."),
                "links": d.get("links", {
                    "github": "https://github.com/",
                    "demo": None,
                }),
                "gallery": gallery,
                "images": [],
                "project_url": f"/projects/{slug}",
                "tech_stack": tech,
            })

    # Chapter nav: adjacent projects in the same flat, cross-shelf order the
    # shelf itself renders in (previous/next "chapter").
    for i, p in enumerate(projects):
        prev_p = projects[i - 1] if i > 0 else None
        next_p = projects[i + 1] if i < len(projects) - 1 else None
        p["prev"] = {"slug": prev_p["slug"], "title": prev_p["title"]} if prev_p else None
        p["next"] = {"slug": next_p["slug"], "title": next_p["title"]} if next_p else None

    return projects


def build_shelves():
    return [{"name": name, "subtitle": subtitle} for name, subtitle, _ in _CATEGORIES]


PROJECTS = build_projects()
SHELVES = build_shelves()
