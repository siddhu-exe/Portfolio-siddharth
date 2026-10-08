# The Chapter Page (`/projects/:slug`)

This guide explains the **project detail page** — what a visitor lands on after
clicking a book on the shelf, then **View Full Project** in the book-preview
modal. It's written so any developer or AI agent can edit or extend a project's
case study without reading the component code first.

If you're looking for how to add a whole new **book/project**
to the site, see [`ADDING_PROJECTS.md`](ADDING_PROJECTS.md) first — this file only
covers the full case-study page for a project that already exists.

## Where it lives

| File | Purpose |
|------|---------|
| `backend/data.py` | **Primary.** Generates every project's Chapter-page content, including the 5 gallery sections, from small per-project inputs. |
| `frontend/src/pages/ProjectDetail.jsx` | Renders the page. Fully data-driven — you should not need to edit this to add/change a project. |
| `frontend/src/components/ImageGallery.jsx` | Renders one gallery section's images (1 / 2 / 3+ layouts). Reusable, no project-specific code. |
| `frontend/src/data/fallbackProjects.js` | Offline fallback — same shape, used only if the backend is unreachable. |

**You should almost never need to touch the two frontend components.** Everything
on the page is driven by the project object from `GET /api/projects/{slug}`.

## Page layout, top to bottom

1. **Breadcrumb** — "← Back to Library" (always present, not data-driven)
2. **Header row** — `emoji` + `title` on the left; `category` chip + `year` on the right
3. **Description** — one paragraph, `description`
4. **Stack row** — a "Stack" label with `tech_stack` joined by " • ", divider above/below
5. **Five gallery sections, in fixed order**, each separated by a divider:
   1. `architecture` — "Architecture"
   2. `pipeline` — "Data Pipeline"
   3. `ml` — "Machine Learning"
   4. `platform` — "Platform"
   5. `results` — "Results"

   Each section renders a heading, an italic subtitle, and an `ImageGallery`
   built from that section's `images[]`.
6. **Closing row** — GitHub / Live Demo buttons (either can be omitted)
7. **Chapter nav** — "← Previous Chapter" / "Next Chapter →", auto-linking to
   the adjacent published projects in shelf order

The whole page is cream/black, using the same fonts, dividers, and button
styles as the rest of the site, and enters via the existing book-cover page
transition (`usePageTransition`) — you don't need to wire that up per project.

## The gallery: how image count controls layout

Each gallery section has an `images` array. **`ImageGallery` picks its layout
purely from `images.length` — you don't choose a layout, you choose how many
images to give it:**

| `images.length` | Layout |
|---|---|
| `1` | Full-width single frame (16:9) |
| `2` | Side-by-side 2-column grid (4:3 each), generous gutter |
| `3+` | Horizontal scroll-snap row, all-corners-rounded frames, fade hint on the right edge |

All frames share the same soft, fully-rounded corner treatment. If an image URL
is missing/`null`, the frame renders as a solid block in the project's `color`
with the section name as a label — so a section never looks broken, it just
looks like a placeholder.

**The default template** (`_GALLERY_TEMPLATE` in `backend/data.py`) gives every
project this exact image count per section, matching the original FIFA World Cup
Predictor spec:

```python
_GALLERY_TEMPLATE = [
    ("architecture", "Architecture",   "The complete system architecture, from data collection to prediction.", 1),
    ("pipeline",     "Data Pipeline",  "From raw football data to production-ready predictions.",               2),
    ("ml",           "Machine Learning","How the model learns, evaluates, and predicts tournament outcomes.",   3),
    ("platform",     "Platform",       "Interactive dashboards and prediction experiences built for users.",    2),
    ("results",      "Results",        "The final outcome of the project and its key achievements.",            1),
]
```

Every project gets all 5 sections with these placeholder counts automatically —
you don't need to write gallery code per project. When you're ready to swap in
real images, you have two options:

### Option A — swap the placeholder count/URLs for ONE project only

Add a `gallery_overrides` entry (see below) so that project's sections use real
image URLs (and, optionally, a different image count) while every other project
keeps using the shared template.

### Option B — change the template subtitle/count for ALL projects

Edit `_GALLERY_TEMPLATE` directly. This changes the section text and/or image
count for every project at once — use this only when the change should really
apply site-wide (e.g. you decide "Platform" should always show 3 images, not 2).

## How to add real images to a project's gallery

In `backend/data.py`, add a `gallery_overrides` dict to that project's `_DETAILS`
entry (create the entry if it doesn't exist), keyed by the gallery section's
`key` (`architecture` / `pipeline` / `ml` / `platform` / `results`):

```python
_DETAILS = {
    # …
    "FIFA World Cup Predictor": {
        # … existing subtitle/problem/etc fields …
        "gallery_overrides": {
            "architecture": ["/images/fifa/architecture.png"],
            "pipeline": ["/images/fifa/pipeline-1.png", "/images/fifa/pipeline-2.png"],
            "ml": [
                "/images/fifa/model-training.png",
                "/images/fifa/feature-importance.png",
                "/images/fifa/confusion-matrix.png",
            ],
            # sections you don't override keep the auto-generated placeholders
        },
    },
}
```

Rules:
- Each key's list **replaces** that section's `images` entirely — its length
  decides the layout (1 / 2 / 3+), so you're free to add or drop images per
  section, not just swap URLs.
- Omit a section key and it keeps the default placeholder count/images from
  `_GALLERY_TEMPLATE`.
- Local images: put files under `frontend/public/images/<project-slug>/…` and
  reference them as `/images/<project-slug>/filename.png` (a path starting with
  `/` resolves against the frontend's public root — no backend changes needed
  beyond writing the path string here).
- External images: any full `https://…` URL works directly.

## Header fields: `emoji` and `year`

Set per project in `_HEADER_META`, keyed by exact title:

```python
_HEADER_META = {
    "FIFA World Cup Predictor": {"emoji": "⚽", "year": 2026},
}
```

Omit a project and it falls back to `📘` and the current year. Pick an emoji
that reads well at large size next to a bold headline (single glyph, not a
multi-part sequence).

## Chapter nav (Previous / Next)

`prev`/`next` are **computed automatically** — they are the adjacent projects in
the Project Shelf's order (`sort_order`), within the **published** set; unpublished
projects chain only among themselves, so a chapter never links into a hidden one.
You don't set these directly: changing `sort_order` or `published` in
`_DETAILS` updates the chain. The first project has `prev: null`; the last has
`next: null`.

## Description, stack, and links

- `description` — one paragraph, shown directly under the header. Falls back to
  `_DETAILS[title].description` if set, otherwise the project's short
  shelf/modal description.
- `tech_stack` — same array used everywhere else on the site (book-preview
  modal chips, etc.) — no separate field needed for the Chapter page's Stack row.
- `links.github` / `links.demo` — either can be `None`/omitted; the closing row
  only renders the buttons that have a URL.

## Quick checklist: give a project real Chapter-page content

- [ ] (optional) Add `emoji`/`year` to `_HEADER_META[title]`
- [ ] (optional) Set `description` in `_DETAILS[title]` if the shelf description isn't right for the full page
- [ ] Add `gallery_overrides` in `_DETAILS[title]` for any section with real images ready
- [ ] Confirm `tech_stack` on the project itself is accurate
- [ ] Set `links.github` (and `links.demo` if there is one) on the project in `build_projects()` or via a per-project override
- [ ] Restart the backend, open `/projects/<slug>`, and check each gallery section's layout matches its image count
