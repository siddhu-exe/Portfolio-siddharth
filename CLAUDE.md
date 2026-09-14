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

---

## Architecture & System Design

The portfolio is structured around a **digital library** metaphor: domains of expertise are bookshelves, projects are interactive book spines, and detail views are case-study "chapters".

```
Portfolio/
├── backend/                  # FastAPI service (data provider + contact logger)
│   ├── main.py               # API endpoints (/api/projects, /api/projects/{slug}, /api/contact)
│   ├── data.py               # Single source of truth for projects, shelves, and galleries
│   └── contact_messages.jsonl# Contact form append log
├── frontend/                 # React 18 SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Scroll sequence composition root
│   │   │   └── ProjectDetail.jsx # Case study chapter page (/projects/:slug)
│   │   ├── components/       # UI sections, 3D/canvas effects, and transition engines
│   │   ├── data/
│   │   │   └── fallbackProjects.js # Offline frontend data mirror
│   │   └── api.js            # API client with fallback support
└── docs/                     # Detailed guides (PROJECT_GUIDE.md, ADDING_PROJECTS.md, CHAPTER_PAGE.md)
```

### Content Source of Truth
- `backend/data.py` is the single source of truth for categories, shelf metadata, project details, and gallery sections (`architecture`, `pipeline`, `ml`, `platform`, `results`).
- `frontend/src/data/fallbackProjects.js` mirrors `backend/data.py` so the frontend functions offline if the backend is unreachable. Keep both in sync when modifying content.

### Routes
1. **`/` (`Home.jsx`)**: Single-page scroll sequence through Hero (cream) → Statement (black) → ProjectShelf (cream) → Toolbox (espresso) → ReadingCorner (black) → `#contact` reveal window.
2. **`/projects/:slug` (`ProjectDetail.jsx`)**: Case-study chapter page. Renders header metadata, stack, and 5 data-driven `ImageGallery` sections (layout auto-adapts by image count: 1 = full-width, 2 = 2-column grid, 3+ = horizontal scroll row).

### Motion & Scroll Engine
- **Lenis + GSAP**: `SmoothScroll.jsx` synchronizes Lenis smooth scroll with GSAP ticker and `ScrollTrigger`.
- **PinnedCurtainChain (`PinnedCurtainChain.jsx`)**: Coordinates pinned scroll transitions between Home sections on desktop (`min-width: 768px`). Skips pinning on mobile (`max-width: 767px`) where sections stack in normal document flow.
- **Fixed Footer Architecture**: `<Footer>` is `position: fixed` at `z-0` behind `<main>` (`z-10`). The terminal `#contact` spacer in `<main>` unmasks the footer as the user scrolls to the bottom. Any new section added to `Home.jsx` must reside inside `<main>` *before* `#contact`.
- **Page Transitions**: `PageTransitionProvider` manages the book-cover wipe transition between the shelf modal and `/projects/:slug`.

### Layout & Styling Conventions
- **Frame Lines**: `FrameLines.jsx` renders fixed border hairlines at `z-[60]`. All section content must follow the horizontal padding convention `px-8 md:px-16` to stay inside the frame lines. Do not wrap top-level sections in narrow centered `max-w-*` containers.
- **Tailwind Tokens**: Use defined theme tokens in `tailwind.config.js` (`cream`, `ink`, `terracotta`, `mustard`, `bark`, `barklight`, `wood`, `tan`, `font-sans`, `font-display`, `tracking-headline`) rather than arbitrary hex codes.
- **Responsive / Mobile**: Desktop-first architecture. Mobile customizations are gated strictly behind the `md` (768px) breakpoint (`md:` classes or `max-width: 767px` matchMedia) without modifying desktop styles. Book modal switches from a two-page spread to a vertical flip on mobile.
