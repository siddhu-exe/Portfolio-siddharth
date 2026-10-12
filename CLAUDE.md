# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (FastAPI)
- **Directory**: `backend/`
- **Install dependencies**: `pip install -r requirements.txt` (or `.venv/bin/pip install -r requirements.txt`)
- **Run dev server**: `uvicorn main:app --reload --port 8000` (from `backend/`; target is `main:app`)

### Frontend (React + Vite)
- **Directory**: `frontend/`
- **Install dependencies**: `npm install`
- **Run dev server**: `npm run dev` (serves at `http://localhost:5173`, proxies `/api/*` to `http://localhost:8000`)
- **Build production**: `npm run build`
- **Preview build**: `npm run preview`

### Testing & Verification
There is no automated unit test suite. Verify changes visually or via headless browser scripts:
- **Run full flow verification**: `node frontend/scripts/verify.mjs` (requires running Vite dev server on port 5173 and Chrome)
- **Run section transitions verification**: `node frontend/scripts/sections.mjs`
- Both scripts use `puppeteer-core` with a hardcoded `/usr/bin/google-chrome` and write screenshots to `/tmp`. `puppeteer-core` is **not** in `package.json`, so install it (e.g. `npm i --no-save puppeteer-core`) before running them.

---

## Architecture & System Design

The portfolio is structured around a **digital library** metaphor: domains of expertise are bookshelves, projects are interactive book spines, and detail views are case-study "chapters".

```
Portfolio/
├── backend/                  # FastAPI service (data provider + contact logger)
│   ├── main.py               # API endpoints (/api/projects, /api/projects/{slug}, /api/contact)
│   ├── data.py               # Source of truth for the shelf (projects, order, tags, spine colours)
│   └── contact_messages.jsonl# Contact form append log
├── projects/                 # Raw case-study source material (markdown) per project; not served
├── frontend/                 # React 18 SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Scroll sequence composition root
│   │   │   └── ProjectDetail.jsx # /projects/:slug — renders the project-page template
│   │   ├── components/       # UI sections, 3D/canvas effects, and transition engines
│   │   │   └── project/      # Project-page template: LaptopLayout, MobileLayout, project.css, motion hooks
│   │   ├── hooks/            # useMediaQuery, useShelfBooks
│   │   ├── data/
│   │   │   ├── fallbackProjects.js # Offline frontend data mirror (shelf)
│   │   │   ├── shelfBooks.js       # Shelf helpers
│   │   │   ├── projectPage.js      # Builds the project-page view-model (hides empty blocks)
│   │   │   └── projects/           # One content file per project + schema.js + index.js
│   │   └── api.js            # API client with fallback support
└── docs/                     # Detailed guides (PROJECT_GUIDE.md, ADDING_PROJECTS.md, CHAPTER_PAGE.md)
```

### Content Source of Truth
- `backend/data.py` is the source of truth for categories and **shelf** metadata (title, `sort_order`, `tag`, `published`, `spineColor`, one-line `result`). Its legacy `gallery` / `problem` / `reflection` fields are no longer read by the project page.
- `frontend/src/data/fallbackProjects.js` mirrors the shelf data of `backend/data.py` so the frontend functions offline if the backend is unreachable. Keep both in sync when modifying the shelf.
- **Project page content** lives only in the frontend: one file per project in `frontend/src/data/projects/<slug>.js` (shared schema in `schema.js`, registry in `index.js`). Volume, tag, spine colour, key result and category are NOT repeated there; `projectPage.js` takes them from the shelf list. Unwritten fields are `TODO` (null) and are hidden, never rendered as placeholders.
- `backend/data.py` is a *builder*, not a flat list: `_CATEGORIES` holds `(title, tech, description)` tuples, `_DETAILS` (keyed by exact title) overrides case-study copy, `_HEADER_META` sets emoji/year, and `build_projects()` derives `slug` (from title), `color` (from `PALETTE` by index), prev/next chapter links, and placehold.co placeholder images for any gallery section without `gallery_overrides`. Adding a project means adding a tuple plus a `_DETAILS` entry; shelf order, ids and prev/next follow `_DETAILS["sort_order"]` (not tuple order).
- Real project images live in `frontend/public/images/<slug>/` and are referenced as `/images/<slug>/...` from `thumbnail` (shelf modal) and from the project's content file (project page).
- `ProjectShelf.jsx` is a flat stacked-books list: it renders only `published` projects, in `sort_order`, using `src/data/shelfBooks.js` (tag stamp, spine contrast, per-row pile sizes). An empty `result` hides the row's metric line; `tag` values give the SUBJECTS count. `sort_order`, `tag`, `published`, `result` (one-line string) and `spineColor` live in `_DETAILS`; the legacy result object is `resultDetail`. Shelf motion lives in one `gsap.context` + `gsap.matchMedia` in `ProjectShelf.jsx` (GSAP owns the outer `li.bk-wrap`; hover/`is-active`/press are CSS on the inner `button`); `PIN_SHELF` at the top toggles the pinned desktop build.
- `docs/ADDING_PROJECTS.md` (shelf side) and `docs/CHAPTER_PAGE.md` (project page schema, layouts, motion) — read them before changing project content.
- `docs/HOME_HERO.md` — the home hero: signature handoff into the header, reveal sequence, fixed Menu pill/panel. Read before touching `Hero.jsx`, `MenuPill.jsx` or `Signature.jsx`. Résumé link: `RESUME_HREF` in `src/data/siteLinks.js` (file in `frontend/public/`).

### Routes
1. **`/` (`Home.jsx`)**: Single-page scroll sequence through Hero (cream; signature lands in the header, fixed Menu pill) → Statement (black) → ProjectShelf (cream) → Toolbox (espresso) → ReadingCorner (black) → `#contact` reveal window.
   Data flow: `Home.jsx` calls `fetchProjects()` (`src/api.js`) and falls back to `fallbackProjects` on any error. `VITE_API_BASE` overrides the API origin for deployed builds; the backend CORS allow-list only covers localhost `5173`/`4173`, so extend it in `backend/main.py` for any other origin. `POST /api/contact` appends to `backend/contact_messages.jsonl` (gitignored).
2. **`/projects/:slug` (`ProjectDetail.jsx`)**: The project page — one template (`components/project/ProjectPage.jsx`) for every project, only the content file differs. Laptop (>= 1024px) and mobile (< 1024px) are separate component trees; only one is mounted at a time. Five fixed chapters (Architecture, Data Pipeline, Machine Learning, Platform, Results); blocks with no data are hidden. Next/prev volume follow shelf order, and the book colour is the shelf's `spineColor` end to end. `/project/:slug` redirects here.

### Motion & Scroll Engine
- **Lenis + GSAP**: `SmoothScroll.jsx` synchronizes Lenis smooth scroll with GSAP ticker and `ScrollTrigger`.
- **PinnedCurtainChain (`PinnedCurtainChain.jsx`)**: Coordinates pinned scroll transitions between Home sections on desktop (`min-width: 768px`). Skips pinning on mobile (`max-width: 767px`) where sections stack in normal document flow.
- **Fixed Footer Architecture**: `<Footer>` is `position: fixed` at `z-0` behind `<main>` (`z-10`). The terminal `#contact` spacer in `<main>` unmasks the footer as the user scrolls to the bottom. Any new section added to `Home.jsx` must reside inside `<main>` *before* `#contact`.
- **Page Transitions**: `PageTransitionProvider` manages the book-cover wipe transition between the shelf modal and `/projects/:slug` (the cover uses the book's `spineColor`). `ProjectDetail` resets scroll to the top through Lenis on every volume change.
- **Project-page motion**: `components/project/useProjectMotion.js` (data-attribute driven: `data-hero-title`, `data-reveal`, `data-flow`, `data-countup`); GSAP only touches outer wrappers, uses the existing Lenis/ScrollTrigger sync, and skips everything under `prefers-reduced-motion`.

### Layout & Styling Conventions
- **Frame Lines**: `FrameLines.jsx` renders fixed border hairlines at `z-[60]`. All section content must follow the horizontal padding convention `px-8 md:px-16` to stay inside the frame lines. Do not wrap top-level sections in narrow centered `max-w-*` containers.
- **Tailwind Tokens**: Use defined theme tokens in `tailwind.config.js` (`cream`, `ink`, `terracotta`, `mustard`, `bark`, `barklight`, `wood`, `tan`, `font-sans`, `font-display`, `tracking-headline`) rather than arbitrary hex codes.
- **Project page styling**: scoped CSS in `components/project/project.css` under `.pp` (design greys/accents as `--pp-*` variables) plus Tailwind utilities. Keep the `:where(.pp) a` reset low-specificity so utility colour classes win.
- **Responsive / Mobile**: Desktop-first architecture (the project page is the exception: a separate mobile tree below 1024px). Mobile customizations are gated strictly behind the `md` (768px) breakpoint (`md:` classes or `max-width: 767px` matchMedia) without modifying desktop styles. Book modal switches from a two-page spread to a vertical flip on mobile.
