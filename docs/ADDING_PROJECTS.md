# Adding Books (Projects) to the Project Shelf

This guide explains how to add a new **book** (project) to the Project Shelf, set
its position, and publish it. It is written so any developer or AI agent can
follow it without reading the whole codebase.

## Mental model

The site is a library.

- The **Project Shelf** is one flat stack of horizontal book spines — one row per
  **published** project, ordered by `sort_order` (VOL.01, VOL.02, …). Categories
  still exist in the data (`_CATEGORIES`) but are not shown as separate shelves;
  each row carries a short `tag` stamp instead (ML, SQL, VIZ, …).
- A **book** = a single **project**, shown as a colored spine row.
- Clicking a book opens the **book preview** — a modal that flips open like a
  real book and shows the project's image, description, tech stack, and a
  **View Full Project** button.
- **View Full Project** navigates (with a full-page book-cover transition) to the
  **Chapter page** at `/projects/:slug` — the full case study.

**The backend is the single source of truth for project content.** The frontend
fetches it and renders it. There is also a small **frontend fallback** used only
when the backend is unreachable, so the shelf never renders empty.

## Files you will touch

| File | Purpose |
|------|---------|
| `backend/data.py` | **Primary.** Categories, per-project content, approach steps, colors. |
| `frontend/src/data/fallbackProjects.js` | Offline fallback list (keep roughly in sync). |
| `frontend/src/data/shelfBooks.js` | Shelf selection/presentation helpers (published filter, sort, tag stamp, spine contrast). Only touch to change shelf rules. |

You do **not** need to touch `ProjectShelf.jsx`, the modal, or the Chapter page
components — they are data-driven and render whatever the backend returns.

> For the Chapter page's gallery sections specifically (images, layout rules,
> `emoji`/`year`, chapter nav), see [`CHAPTER_PAGE.md`](CHAPTER_PAGE.md).

---

## The project data shape

Every project the API returns looks like this (built in `backend/data.py`):

```jsonc
{
  "id": 3,
  "title": "FIFA World Cup Predictor",
  "slug": "fifa-world-cup-predictor",      // auto-generated from title
  "category": "Machine Learning",           // grouping in the data; the shelf shows `tag` instead
  "color": "#7FA98F",                        // book-modal cover + gallery-placeholder color (pastel, by order)
  "emoji": "⚽",                             // shown next to the title on the Chapter page header
  "year": 2026,                              // shown top-right on the Chapter page header
  "subtitle": "Forecasting matches from decades of form.",
  "thumbnail": "https://.../...",            // small preview image (book modal)
  "heroImage": "https://.../...",            // (legacy) large image, no longer shown on the Chapter page
  "description": "…",                         // shown in the book-preview modal AND the Chapter page intro
  "problem": "…",                             // (legacy, kept for the book-preview modal / API consumers)
  "data": { "text": "…", "visual": null },    // (legacy, same as above)
  "approach": { "steps": [{ "label": "Train" }, …] }, // (legacy, same as above)
  "result": "91.7% knockout accuracy · ROC-AUC 0.90", // one line on the Project Shelf row; "" hides the metric line
  "resultDetail": { "metric": "0.91", "label": "ROC-AUC", "visual": null }, // (legacy; was "result")
  "published": true,                         // Project Shelf shows only published projects
  "sort_order": 4,                           // shelf order (VOL.01, VOL.02…); sorted by this, not creation order
  "tag": "ML",                               // stamp on the row; SUBJECTS counts distinct tags
  "spineColor": "#7A2E2A",                   // spine binding colour on the shelf (text/foil contrast is automatic)
  "reflection": "…",                          // (legacy)
  "links": { "github": "https://…", "demo": null }, // Chapter page closing row
  "gallery": [                                // Chapter page gallery sections, IN ORDER
    { "key": "architecture", "heading": "Architecture", "subtitle": "…", "images": ["https://…"] },
    { "key": "pipeline",     "heading": "Data Pipeline", "subtitle": "…", "images": ["https://…", "https://…"] },
    { "key": "ml",           "heading": "Machine Learning", "subtitle": "…", "images": ["…", "…", "…"] },
    { "key": "platform",     "heading": "Platform", "subtitle": "…", "images": ["…", "…"] },
    { "key": "results",      "heading": "Results", "subtitle": "…", "images": ["…"] }
  ],
  "prev": { "slug": "loan-approval-predictor", "title": "Loan Approval Predictor" }, // or null
  "next": { "slug": "alzheimer-s-mri-detection", "title": "Alzheimer's MRI Detection" }, // or null
  "images": [],
  "tech_stack": ["scikit-learn", "XGBoost", "Pandas"]
}
```

- `visual`/`gallery[].images` entries are the only "optional media" fields —
  `null`/empty renders as a placeholder block in the project's `color`, so
  nothing ever looks broken before real images are ready.
- `slug`, `thumbnail`, `heroImage`, `gallery[].images` placeholders, and
  `prev`/`next` are **all generated automatically**. You normally only write
  the text fields (title, tech, description, and the optional `_DETAILS` copy).
- `problem`, `data`, `approach`, `result`, `reflection` are **legacy fields**
  kept in the API response for any older consumer, but the current Chapter
  page (see below) does **not** render them — it renders `gallery` instead.
  You can still fill `_DETAILS` for them (harmless), but they're not required.

> 📖 **For a full walkthrough of the Chapter page's exact layout, the gallery
> image-count rules, and how to customize per-project galleries**, see
> [`CHAPTER_PAGE.md`](CHAPTER_PAGE.md) in this folder. This file (`ADDING_PROJECTS.md`)
> covers the shelf/book side; that one covers the full case-study page you land
> on after clicking **View Full Project**.

---

## How to add a NEW BOOK

Everything happens in **`backend/data.py`** (plus an optional fallback mirror).

### 1. Add the project to its category

Find the `_CATEGORIES` list. Each entry is
`(category_name, subtitle, [ (title, [tech...], description), ... ])`.
Add a new `(title, tech, description)` tuple to the right category's list. The
position inside the tuple list does **not** decide shelf order — `sort_order` does:

```python
_CATEGORIES = [
    # …
    ("Machine Learning", "Building predictive models that learn from data.", [
        ("Loan Approval Predictor", ["scikit-learn", "XGBoost", "Pandas"], "…"),
        ("FIFA World Cup Predictor", ["scikit-learn", "Pandas", "NumPy"], "…"),
        # 👇 NEW BOOK — just add a tuple here
        ("Spam Email Classifier", ["scikit-learn", "NLTK", "Pandas"],
         "A short one-sentence description used as a fallback."),
    ]),
    # …
]
```

The `slug` and placeholder images are generated for you. `id` and the pastel
`color` follow `sort_order`, so inserting a book earlier renumbers the ones after
it (routes use slugs, so links keep working). The book only appears on the shelf
once it is **published** (next step).

### 2. (Recommended) Add the full case-study copy

In the same file, add an entry to the `_DETAILS` dict, keyed by the **exact
title**. Any field you omit falls back to a sensible default.

```python
_DETAILS = {
    # …
    "Spam Email Classifier": {
        "subtitle": "Catching junk before it reaches the inbox.",
        "problem": "Two-to-three sentences on the real-world problem.",
        "data_text": "What data you used and how you shaped it.",
        "data_visual": True,        # True -> show a placeholder data image; omit/False -> text only
        "metric": "98.4%",           # the big number on the Chapter page
        "metric_label": "precision on held-out mail",
        "result_visual": False,      # True -> show a placeholder result image
        "reflection": "A short, personal takeaway.",
        # Project Shelf row (all optional except `published` to appear):
        "published": True,           # False/omitted -> hidden from the shelf (page still works)
        "sort_order": 11,            # position on the shelf (1 = VOL.01); unlisted books sort last
        "tag": "ML",                 # SQL / VIZ / ML / DL / NLP / AGENTS / APP
        "spineColor": "#263A52",
        "result": "98.4% precision",  # omit/"" -> the row simply has no metric line
    },
}
```

### 3. What the shelf computes for you

Nothing is hard-coded to ten books. The VOLUMES counter is the published count,
SUBJECTS is the number of distinct `tag` values, and the mono caption under the
plank lists those tags in order of first appearance. A row with an empty `result`
simply has no metric line. Text/foil colours on a spine are picked automatically
for contrast against `spineColor`. Chapter prev/next links stay within the
published set (and unpublished books chain among themselves).

### 4. Mirror it in the fallback (optional but nice)

Edit `frontend/src/data/fallbackProjects.js` and add the same title/tech to the
matching category in the `CATS` array, so the offline view matches.

### 5. Restart the backend

```bash
cd backend && .venv/bin/uvicorn main:app --reload --port 8000
```

The shelf fetches `/api/projects` on load; the new book appears.

---

## Motion

Shelf animation (header split-title and counters, batch reveal on scroll, the
"reading head" `is-active` row, hover neighbour nudge, click pull-out) lives in
`ProjectShelf.jsx` and `index.css` and needs no per-book data. GSAP owns each
row's outer `li.bk-wrap`; hover, `is-active` and press are CSS on the inner
`button`. `PIN_SHELF` (top of `ProjectShelf.jsx`) enables an experimental pinned
build on desktop; it is **off** because the extra pin height breaks the
Shelf → Toolbox → Reading Corner curtain pins. All of it is skipped under
`prefers-reduced-motion`.

---

## Adding a new category

Categories are only a grouping in the data now. To add one, add an entry to
`_CATEGORIES` (name, subtitle, projects) in `backend/data.py`; if it needs its own
approach-step flow on the Chapter page, add `_APPROACH_STEPS[category]`, else a
generic 3-step flow is used. Give its projects a `tag` (or add the category to
`_DEFAULT_TAGS`, mirrored as `DEFAULT_TAGS` in `fallbackProjects.js`). No frontend
component change is needed.

---

## The book preview (modal) and Chapter page — what shows where

You don't edit these, but here's what each field maps to so you know what to
write:

**Book preview modal** (opens on book click):
- cover: `title`, `category`, `color`
- inside: `thumbnail`/`heroImage`, `description`, `tech_stack`
- button: **View Full Project** → `/projects/{slug}`

**Chapter page** (`/projects/:slug`) — see [`CHAPTER_PAGE.md`](CHAPTER_PAGE.md) for
the full breakdown, summarized here:
| Section | Field |
|---------|-------|
| Header | `emoji`, `title`, `category`, `year` |
| Description | `description` |
| Stack row | `tech_stack[]` |
| Gallery sections (×5, in order) | `gallery[]` — each `{ heading, subtitle, images[] }` |
| Closing row | `links.github`, `links.demo` (optional) |
| Chapter nav | `prev` / `next` (auto-computed) |

---

## Colors

Two separate colours per project:
- `spineColor` (in `_DETAILS`) — the Project Shelf row. Without it, rows cycle
  through `SPINE_COLORS`. Light or dark text and gold or dark-brown foil are chosen
  automatically (`spineTheme` in `shelfBooks.js`).
- `color` — from `PALETTE` by order; used by the book modal and gallery
  placeholders. It deliberately avoids pure black/white.

## Real images later

`thumbnail`, `heroImage`, and every `gallery[].images` entry currently use
`placehold.co` placeholders tinted to the project color. Replace them with real
image URLs (or local `/public` paths) when available — the layout already
supports them; see [`CHAPTER_PAGE.md`](CHAPTER_PAGE.md) for exactly how the
gallery's image count controls its layout.

## Quick checklist for a new book

- [ ] Added `(title, tech, description)` to the right category in `_CATEGORIES`
- [ ] Added a `_DETAILS[title]` entry with `published`, `sort_order`, `tag`, `spineColor` (and `result` if there is a one-line metric) plus the case-study copy
- [ ] Mirrored it in `fallbackProjects.js` (`sortOrder`, `tag`, `published`, `spineColor`, `result`)
- [ ] Restarted the backend and confirmed the book appears + opens
