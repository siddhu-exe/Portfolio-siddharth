# The Project Page (`/projects/:slug`)

This guide explains the **project page**: what a visitor lands on after clicking a
book on the shelf, then **View Full Project** in the book-preview modal (or the
next/prev volume arrows). It's written so any developer or AI agent can edit or
add a project's case study without reading the component code first.

To add a whole new **book/project** to the shelf, see
[`ADDING_PROJECTS.md`](ADDING_PROJECTS.md) first. This file covers the case-study
page for a project that already exists on the shelf.

## The idea: one template, one data file per project

Every project renders through the **same** template: same sections, order,
spacing and typography. A project is only a content file; there is no
per-project layout code and no `if (project === 'x')`.

| Piece | Where |
|---|---|
| Content, one file per project | `frontend/src/data/projects/<slug>.js` |
| The shared schema, the `TODO` marker, the 5 fixed chapters | `frontend/src/data/projects/schema.js` |
| Registry of project files (add yours here) | `frontend/src/data/projects/index.js` |
| View-model builder: merges content with shelf values, hides empty blocks | `frontend/src/data/projectPage.js` |
| Route component: loads data, builds the page | `frontend/src/pages/ProjectDetail.jsx` |
| The template (switches laptop / mobile) | `frontend/src/components/project/ProjectPage.jsx` |
| Laptop layout (>= 1024px) / mobile layout (< 1024px) | `LaptopLayout.jsx` / `MobileLayout.jsx` in the same folder |
| Styles (scoped under `.pp`) | `components/project/project.css` |
| Motion + scroll spy hooks | `useProjectMotion.js`, `useChapterSpy.js`, `useProjectNav.js` |

You normally only edit a content file. Touch the components to change the
**design** for all projects at once.

## Values that come from the shelf (never repeated in a content file)

`volume` (VOL.01…), `tag` (NLP/ML/DL/AGENTS/APP/…), `spineColor`, `keyResult` (the
shelf's one-line `result`) and `category` are read from the same list the Project
Shelf renders (`useShelfBooks` → API with the offline fallback). The page can't
drift from its book, and the next/prev volumes follow shelf order:

- next/prev use `sort_order` among **published** books; the last volume's "next" loops to VOL.01, and VOL.01 has no "prev" (disabled arrow);
- the next-volume card uses that book's own `spineColor`;
- the cover, tag pill and text/foil colours are derived from `spineColor` (`spineTheme` in `data/shelfBooks.js`).

To change any of these, edit the book in `backend/data.py` / `fallbackProjects.js`.

## The content schema

```js
export default {
  slug, title, tagline, year,
  links:    { demo, github, kaggle },           // placeholders ('#', bare github.com) count as missing
  demoNote,                                     // e.g. 'Demo runs on demand' (only shown with a demo link)
  meta:     { role, timeline, deployedOn },     // a missing value hides its label
  stats:    [{ value, label }],                 // up to 4; shown 4-up on laptop, 2x2 on mobile
  overview: { lead, leadAccent, approach, evaluation, serving },
  stack:    [{ group, items: [] }],
  chapters: {
    architecture:    { subtitle, flow: [{ kind, title, sub, parallel?: [...] }], flowCaption, decisions: [{ title, why }], figures },
    dataPipeline:    { subtitle, steps: [{ title, body }], figure: { src, caption, alt },
                       footprintTitle, footprint: [{ label, value, percent }], footprintNote, figures },
    machineLearning: { subtitle, highlight: { eyebrow, value, label, chips: [] },
                       listTitle, list: [{ title, direction }], finding, figures },
    platform:        { subtitle, figure: { src, mobileSrc, caption, alt, windowTitle },
                       notes: [{ title, body }], latencyTitle, latency: [{ stage, value }], figures },
    results:         { subtitle, metrics: [{ value, label }],
                       table: { title, columns: [], rows: [[]] }, next: [], figures },
  },
};
```

Notes:

- The five chapters are always **01 Architecture, 02 Data Pipeline, 03 Machine Learning, 04 Platform, 05 Results**. Titles are fixed (`CHAPTERS` in `schema.js`); only each chapter's `subtitle` and content come from data.
- `flow`: an entry with `parallel: [...]` renders its nodes stacked (laptop) or side by side (mobile). The **last** node is highlighted as the output.
- `footprint[].percent` sets the bar width (0–100). Without it the row shows no bar.
- `table`: the first column is the row label, the **last row is highlighted**. Rows with no values are dropped. On mobile each row becomes a compact "name — values" line.
- `latency`: the **last** cell is highlighted (use it for "Total"). Values like `"420 ms"` are split into a big number and a small unit.
- `figures` (optional on every chapter) are extra `{ src, caption, alt }` images shown at the end of the chapter, for projects whose existing content is image-only.
- `platform.figure` gets numbered pins when there are `notes`; `mobileSrc` is used on mobile when given, otherwise `src`.
- `alt` comes from data; it falls back to the caption, then a generic description.
- Images live in `frontend/public/images/<slug>/` and are referenced as `/images/<slug>/file.png`.

## Empty means hidden (the `TODO` convention)

Write `TODO` (imported from `schema.js`, it is `null`) or simply omit a field, and
add a `// TODO:` note. `projectPage.js` hides anything empty:

- a missing label value (Role, Timeline, Deployed on) hides that label;
- a block with no data hides, with no empty cards or table rows and never `undefined` or `[—]`;
- a missing figure `src` hides the figure (no placeholder box);
- text like `"[Your role]"` counts as empty;
- a chapter with **no** content is hidden everywhere, including the chapter strip and chips. Chapter numbers stay fixed (a hidden 02 leaves 01, 03…);
- a project with no chapters has no chapter strip at all.

List a project's open TODOs with `collectTodos(project)` from `schema.js`.

## Layouts

**Laptop (>= 1024px)**: top bar, hero (big title left, book cover right in the
project's `spineColor`), meta row, stat cards, then a **sticky chapter strip**
(Overview + 01–05 + "n min read" + reading progress in the site's mustard). Then:
overview (lead, A/B/C, stack spec-sheet), **01** as a full-width dark spread that
bleeds to the frame lines (horizontal flow diagram + decisions), **02** step
timeline + figure + footprint bars, **03** big highlight number + judge list + the
brick-red finding panel, **04** screenshot with numbered pins + notes + latency
strip, **05** metrics row + scoreboard table + "What I'd do next". It closes with
"End of Volume NN" and the next-volume card.

**Mobile (< 1024px)** is a separate, minimal component tree (not the laptop layout
squeezed): slim top bar (back / VOL / next), a thin spine strip, title, tagline,
half-width buttons, label/value meta rows, a 2×2 numbers grid, sticky scrollable
chapter chips, a vertical flow with arrows, a dot timeline, simple rows, a 2×2
latency grid, per-retriever rows instead of a wide table, and a compact next-volume
card. Tap targets are at least 44px and there is no horizontal page scroll.
Between 768 and 1023px it stays a single column (max 640px) so it never runs
under the frame lines.

`ProjectPage` mounts **one** tree at a time (`matchMedia`), so the two never
animate together.

## Motion

One recipe (`useProjectMotion.js`), driven by data attributes in the markup:

| Attribute | Effect |
|---|---|
| `data-hero-title` | SplitText characters rise through a line mask (`.pp-title-mask`) |
| `data-hero` | hero blocks fade up after the title |
| `data-reveal` | fade up 24px once at "top 85%" |
| `data-flow` / `data-flow-node` | flow nodes appear in order, stagger 0.08 (left→right on laptop, top→bottom on mobile) |
| `data-countup` | numbers count up once |

GSAP only touches these outer wrappers; hover states live on inner elements. It uses
the existing Lenis + ScrollTrigger sync (no second Lenis or ticker), runs inside
`gsap.context` + `gsap.matchMedia` and is reverted on unmount, and refreshes
ScrollTrigger after fonts load, after images load and after mount. With
`prefers-reduced-motion` nothing moves. The active chapter uses an
`IntersectionObserver`; clicking a chapter scrolls through Lenis
(`scrollToSection`), and `scroll-margin-top` keeps the sticky bars from covering
the target. Every volume opens at the top (`ProjectDetail` resets the scroll through Lenis).

## Routes and navigation

- Canonical route: `/projects/:slug`. `/project/:slug` redirects to it.
- Back / prev / next go through the book-cover page transition (`usePageTransition`); the cover is the destination book's `spineColor`.
- A slug with no content file shows "Chapter not found". Unpublished books aren't on the shelf and have no volume number.

## Checklist: add or finish a project's page

- [ ] The book exists on the shelf (`published`, `sort_order`, `tag`, `spineColor`, `result`), see [`ADDING_PROJECTS.md`](ADDING_PROJECTS.md)
- [ ] Create `frontend/src/data/projects/<slug>.js` following `schema.js` (copy an existing file)
- [ ] Register it in `frontend/src/data/projects/index.js`
- [ ] Put images in `frontend/public/images/<slug>/`
- [ ] Replace each `TODO` you can fill; leave the rest (they simply hide)
- [ ] Check `/projects/<slug>` at ~1440px and ~390px: hero, chapter strip, no empty blocks
