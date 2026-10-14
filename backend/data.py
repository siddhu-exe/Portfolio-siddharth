"""Project data: the shelf projects plus a few unpublished seed placeholders.

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

# Library-binding colours for the Project Shelf's flat-list "spines" (distinct
# from PALETTE, which tints the pastel book modal / chapter placeholders).
# Projects without an explicit _DETAILS["spineColor"] cycle through these by index.
SPINE_COLORS = [
    "#7A2E2A",  # oxblood
    "#2F4A3A",  # forest
    "#C9963C",  # mustard
    "#263A52",  # navy
    "#B5533C",  # brick
    "#2B2724",  # charcoal
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
                "MineSafe AI",
                ["React", "FastAPI", "MongoDB", "XGBoost", "Prophet", "Keras", "Isolation Forest", "Groq", "WebSocket"],
                "A full-stack mine-safety platform that scores landslide and rockfall risk per zone "
                "with four ML models, tracks blasts, cracks and rainfall, and routes alerts to the "
                "right people in real time.",
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
                "BitcoinGraphGuard",
                ["Python", "XGBoost", "PyTorch Geometric", "FastAPI", "SHAP", "Captum", "React", "TypeScript", "Docker", "GitHub Actions"],
                "Temporal fraud detection on the Elliptic++ Bitcoin graph: tabular and graph models "
                "compared on a strict train-on-past protocol, the step-43 drift diagnosed, and a "
                "drift-aware API with lag-safe monitoring.",
            ),
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
                "LegalRAG",
                ["Python", "FastAPI", "FAISS", "BM25", "BGE Embeddings", "Cross-Encoder", "Groq", "React", "Docker", "AWS EC2"],
                "A hybrid-retrieval RAG system over 100,000 Indian High Court judgments "
                "that answers legal questions with citations to the exact retrieved "
                "passages, evaluated on a 497-question gold benchmark.",
            ),
            (
                "TruthMates",
                ["CrewAI"],
                "A 10-agent CrewAI pipeline.",
            ),
            (
                "KalaChain",
                [],
                "First-place project at HackX SFIT 2026.",
            ),
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
    "LegalRAG": {"emoji": "⚖️", "year": 2026},
    "BitcoinGraphGuard": {"emoji": "🛡️", "year": 2026},
    "MineSafe AI": {"emoji": "⛏️", "year": 2026},
}

# Per-project case-study copy, keyed by title. Every field is optional; the
# builder fills sensible defaults so the page always renders.
_DETAILS = {
    "LegalRAG": {
        "sort_order": 1,
        "tag": "NLP",
        "published": True,
        "spineColor": "#263A52",
        "result": "65.8% Recall@50 · 497-question benchmark",
        # Figures and wording come from projects/LegalRAG/PORTFOLIO_SITE_GUIDE.md.
        "subtitle": "Legal answers you can trace back to the judgment.",
        "description": "LegalRAG answers legal questions over 100,000 Indian High Court judgments "
        "(538,079 searchable chunks). A BM25 + dense (BGE) hybrid retriever feeds Reciprocal Rank "
        "Fusion and a cross-encoder reranker, and a Groq-hosted LLM writes an answer that cites the "
        "passages it used. The project's focus is measurement: a 497-question evidence-grounded "
        "benchmark scores retrieval Recall@k, answer faithfulness, citation correctness, and where "
        "failures come from. Served through a fail-closed FastAPI backend with per-stage latency "
        "reporting and a React interface. The live demo's backend runs on AWS EC2 and is stopped when "
        "idle, so queries only work while it is up.",
        "problem": "Generic RAG struggles with legal text: exact statute numbers, long judgments, "
        "and the cost of an invented citation.",
        "data_text": "100,000 High Court judgments across 24 courts, cleaned and split into "
        "538,079 overlapping chunks.",
        "metric": "65.8%",
        "metric_label": "Recall@50 of the correct judgment (hybrid RRF)",
        "reflection": "Retrieval, not the LLM, caused about 84% of the bad answers — so improving "
        "search mattered more than swapping models.",
        "thumbnail": "/images/legalrag/09_ui_query_console.png",
        "heroImage": "/images/legalrag/01_end_to_end_rag_architecture.png",
        "links": {
            "github": "https://github.com/siddhu-exe/LegalRag",
            "demo": "https://legalrag-six.vercel.app",
        },
        "gallery_overrides": {
            "architecture": ["/images/legalrag/01_end_to_end_rag_architecture.png"],
            "pipeline": [
                "/images/legalrag/02_data_ingestion_indexing_pipeline.png",
                "/images/legalrag/06_latency_waterfall_breakdown.png",
            ],
            "ml": [
                "/images/legalrag/03_retrieval_benchmark_comparison.png",
                "/images/legalrag/04_generation_eval_llm_judge.png",
                "/images/legalrag/07_question_type_performance.png",
            ],
            "platform": [
                "/images/legalrag/09_ui_query_console.png",
                "/images/legalrag/10_ui_grounded_answer_citations.png",
            ],
            "results": ["/images/legalrag/05_failure_taxonomy_distribution.png"],
        },
    },
    "BitcoinGraphGuard": {
        "sort_order": 3,
        "tag": "ML",
        "published": True,
        "spineColor": "#7A4A12",
        "result": "0.80 PR-AUC · drift diagnosed · lag-safe monitoring",
        # Figures and wording come from projects/BitcoinGraphGuard/PORTFOLIO_SITE_GUIDE.md.
        "subtitle": "Fraud detection that is tested on the future, and knows when it stops working.",
        "description": "BitcoinGraphGuard benchmarks XGBoost, GraphSAGE, HeteroRGCN and a heterogeneous "
        "graph transformer on the Elliptic++ Bitcoin dataset (203,769 transactions, 822,942 wallets, "
        "49 time steps) using temporal splits only. A tuned XGBoost scores 0.80 PR-AUC on steps 35-49 "
        "and beats every graph model, but every model collapses after step 43. Adversarial validation "
        "shows covariate drift, not a vanished signal, and walk-forward retraining recovers it only "
        "when labels arrive quickly. The best model is served through a FastAPI service that labels "
        "each prediction with how reliable that time step has been, alongside a lag-safe drift "
        "monitor and a React dashboard.",
        "problem": "Fraud models trained on the past quietly fail when the world changes, and labels "
        "arrive too late to notice.",
        "data_text": "Elliptic++: 203,769 Bitcoin transactions and 822,942 wallets over 49 time steps; "
        "157,205 transactions are unlabeled and never used as supervision.",
        "metric": "0.80",
        "metric_label": "Test PR-AUC (XGBoost, steps 35-49)",
        "reflection": "The model was fine until the data changed. Knowing when to distrust it, and how "
        "fast labels arrive, mattered more than a fancier architecture.",
        "thumbnail": "/images/bitcoingraphguard/07_ui_overview.png",
        "heroImage": "/images/bitcoingraphguard/01_system_architecture.png",
        "links": {
            "github": "https://github.com/siddhu-exe/BitcoinGraphGuard",
            "demo": "https://bitcoin-graph-delta.vercel.app",
        },
        "gallery_overrides": {
            "architecture": ["/images/bitcoingraphguard/01_system_architecture.png"],
            "pipeline": ["/images/bitcoingraphguard/03_regime_shift_per_step.png"],
            "ml": [
                "/images/bitcoingraphguard/02_model_comparison.png",
                "/images/bitcoingraphguard/05_xgboost_shap_top_features.png",
                "/images/bitcoingraphguard/04_retraining_vs_label_delay.png",
            ],
            "platform": [
                "/images/bitcoingraphguard/07_ui_overview.png",
                "/images/bitcoingraphguard/06_monitoring_signal_tradeoff.png",
            ],
            "results": ["/images/bitcoingraphguard/04_retraining_vs_label_delay.png"],
        },
    },
    "MineSafe AI": {
        "sort_order": 5,
        "tag": "ML",
        "published": True,
        "spineColor": "#4A433C",
        "result": "4 trained models · 56K crack images · 60+ endpoints",
        # Figures and wording come from projects/Rockefeller/ROCKEFELLER_PORTFOLIO.md.
        "subtitle": "Zone risk, crack reports and emergency alerts on one map.",
        "description": "MineSafe AI (Rockefeller) is a React + FastAPI + MongoDB platform that scores "
        "landslide and rockfall risk for each mine zone and routes alerts to the right people. Four "
        "models sit behind one API: XGBoost for zone risk, an EfficientNetV2S crack-severity CNN, "
        "Prophet rainfall forecasts for 36 districts, and an Isolation Forest for blast anomalies. "
        "Crack photos, blasts and rainfall land on one map, and critical events reach workers through "
        "WebSocket and browser push, with Admin, Safety Officer and Field Worker roles. A college team "
        "project of four; Siddharth built the frontend, the backend and all four models.",
        "problem": "Rainfall, slope stability, blasting and crack inspections live in separate tools, "
        "so risk is noticed late and alerts reach the wrong people.",
        "data_text": "45 seeded zones across 24 districts, 56,092 crack images (SDNET2018) and 65,736 "
        "IMD rainfall records for 36 districts.",
        "metric": "87.4%",
        "metric_label": "Crack-model validation accuracy (84.9% majority baseline)",
        "reflection": "The XGBoost score is on synthetic data, so the real lesson was building a "
        "resilient system: a rule-engine fallback keeps scoring when a model fails to load.",
        "thumbnail": "/images/minesafe-ai/10_architecture.png",
        "heroImage": "/images/minesafe-ai/10_architecture.png",
        "links": {
            "github": "https://github.com/siddhu-exe/rockefeller",
            "demo": None,
        },
        "gallery_overrides": {
            "architecture": ["/images/minesafe-ai/10_architecture.png"],
            "pipeline": ["/images/minesafe-ai/20_data_model.png", "/images/minesafe-ai/31_data_distribution.png"],
            "ml": ["/images/minesafe-ai/32_ml_stack.png", "/images/minesafe-ai/35_crack_model.png", "/images/minesafe-ai/36_xgboost_results.png"],
            "platform": ["/images/minesafe-ai/33_crack_workflow.png", "/images/minesafe-ai/34_roles.png"],
            "results": ["/images/minesafe-ai/30_risk_scoring.png"],
        },
    },
    "TruthMates": {
        "sort_order": 6,
        "tag": "AGENTS",
        "published": True,
        "spineColor": "#B5533C",
        "result": "10-agent CrewAI pipeline",
    },
    "KalaChain": {
        "sort_order": 7,
        "tag": "APP",
        "published": True,
        "spineColor": "#C9963C",
        "result": "1st place · HackX SFIT 2026",
    },
    "Customer Churn Analysis": {
        "sort_order": 8,
        "tag": "SQL",
        "published": False,
        "spineColor": "#5C4A3A",
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
        "sort_order": 9,
        "tag": "SQL",
        "published": False,
        "spineColor": "#3F5B54",
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
        "sort_order": 10,
        "tag": "VIZ",
        "published": False,
        "spineColor": "#8C3B2E",
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
        "sort_order": 11,
        "tag": "VIZ",
        "published": False,
        "spineColor": "#D9C3A0",
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
        "subtitle": "Forecasts, alerts and a causal test, all scored against persistence.",
        # Project Shelf fields. Figures come from projects/Air quality risk forecasting/.
        "sort_order": 2,
        "tag": "ML",
        "published": True,
        "result": "+11% 24h skill vs persistence · MAE 98.24 → 34.11",
        "spineColor": "#2F4A3A",
        "thumbnail": "/images/delhi-air-quality-risk-forecasting/40_dashboard_overview.png",
        "heroImage": "/images/delhi-air-quality-risk-forecasting/40_dashboard_overview.png",
        "description": "An end-to-end operational ML system and econometric audit delivering 1h/6h/24h air quality forecasts, automated CPCB/GRAP emergency risk alerts, and causal evaluation of Delhi's Diwali firecracker ban across 7 continuous monitoring stations.",
        "links": {
            "github": "https://github.com/siddhu-exe/Air-Quality-Risk-Forecasting",
            "demo": "https://siddhu-exe-air-quality-risk-forecasting-dashboardapp-w5wwow.streamlit.app/",
            "kaggle": "https://www.kaggle.com/datasets/siddharthdongardive/delhi-air-quality-monitoring-dataset-2023-2026",
        },
        "gallery_overrides": {
            "architecture": ["/images/delhi-air-quality-risk-forecasting/10_architecture.png"],
            "pipeline": ["/images/delhi-air-quality-risk-forecasting/20_data_model.png", "/images/delhi-air-quality-risk-forecasting/21_splits_timeline.png"],
            "ml": ["/images/delhi-air-quality-risk-forecasting/30_skill_vs_persistence.png", "/images/delhi-air-quality-risk-forecasting/31_extrapolation_fix.png", "/images/delhi-air-quality-risk-forecasting/32_episode_forecast.png"],
            "platform": ["/images/delhi-air-quality-risk-forecasting/40_dashboard_overview.png", "/images/delhi-air-quality-risk-forecasting/43_dashboard_model_health.png"],
            "results": ["/images/delhi-air-quality-risk-forecasting/50_alert_tradeoff.png", "/images/delhi-air-quality-risk-forecasting/51_diwali_identification.png"],
        },
    },
    "FIFA World Cup Predictor": {
        "subtitle": "Forecasting 104 matches through dual stage-aware models and 10,000 tournament simulations.",
        # Figures come from projects/Fifa/CASE_STUDY.md ("Core result").
        "sort_order": 4,
        "tag": "ML",
        "published": True,
        "result": "91.7% knockout accuracy · ROC-AUC 0.90",
        "spineColor": "#7A2E2A",
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


# Fallback stamp for the Project Shelf when a project has no explicit "tag".
_DEFAULT_TAGS = {
    "Data Analytics": "SQL",
    "Data Visualization": "VIZ",
    "Machine Learning": "ML",
    "Deep Learning": "DL",
    "AI Applications": "NLP",
}


def build_projects():
    # Flatten, then order by _DETAILS["sort_order"] (stable: unlisted projects
    # keep their tuple order, after every numbered one). ids, colours and the
    # prev/next chapter links all follow this order, not the tuple order.
    flat = [
        (category, title, tech, description)
        for category, _subtitle, items in _CATEGORIES
        for title, tech, description in items
    ]
    flat.sort(key=lambda row: _DETAILS.get(row[1], {}).get("sort_order", 1000))

    projects = []
    for idx, (category, title, tech, description) in enumerate(flat, start=1):
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

        thumbnail = (
            d.get("thumbnail")
            or f"https://placehold.co/600x400/{bare}/171717?text={category.replace(' ', '+')}"
        )

        projects.append({
            "id": idx,
            "title": title,
            "slug": slug,
            "category": category,
            "color": color,
            "emoji": meta.get("emoji", "📘"),
            "year": meta.get("year", 2026),
            "subtitle": d.get("subtitle", description.split(".")[0] + "."),
            "thumbnail": thumbnail,
            # Project Shelf: shown only when published. An empty "result" just
            # hides the metric line; it never blocks publishing.
            "published": bool(d.get("published")),
            "sort_order": d.get("sort_order", 1000 + idx),
            "tag": d.get("tag", _DEFAULT_TAGS.get(category, "")),
            "spineColor": d.get("spineColor", SPINE_COLORS[(idx - 1) % len(SPINE_COLORS)]),
            "heroImage": d.get("heroImage") or _img(title),
            "description": d.get("description", description),
            "problem": d.get("problem", description),
            "data": {
                "text": d.get("data_text", "A curated dataset assembled and cleaned for "
                        "this project, shaped into an analysis-ready form."),
                "visual": _img(f"{category} — Data", 900, 640) if d.get("data_visual") else None,
            },
            "approach": {"steps": [{"label": s} for s in steps]},
            # One-line metric shown on the Project Shelf ("" = no metric line).
            "result": d.get("result", ""),
            # Legacy {metric,label,visual} block (formerly "result").
            "resultDetail": {
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

    # Chapter nav: previous/next within the shelf's own order. Published books
    # link only to other published books, so a reader never pages into a hidden one.
    shelf = [p for p in projects if p["published"]]
    for chain in (shelf, [p for p in projects if not p["published"]]):
        for i, p in enumerate(chain):
            prev_p = chain[i - 1] if i > 0 else None
            next_p = chain[i + 1] if i < len(chain) - 1 else None
            p["prev"] = {"slug": prev_p["slug"], "title": prev_p["title"]} if prev_p else None
            p["next"] = {"slug": next_p["slug"], "title": next_p["title"]} if next_p else None

    return projects


def build_shelves():
    return [{"name": name, "subtitle": subtitle} for name, subtitle, _ in _CATEGORIES]


PROJECTS = build_projects()
SHELVES = build_shelves()
