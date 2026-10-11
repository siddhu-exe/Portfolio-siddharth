# Portfolio — a digital library of data & AI work

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-ScrollTrigger-88CE02?logo=greensock&logoColor=white)](https://gsap.com/)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

The personal portfolio of **Siddharth Dongardive** (data, ML and AI applications). Every project is a **book on a shelf**: pick one, it opens, and you read it as a five-chapter case study.

<!-- TODO: add the live site link and 2–3 screenshots/GIF here (e.g. docs/screenshots/*.png) — a visual in the first screen is the single biggest README win. -->

## Why it exists

A grid of project cards says what was built but not how it was thought about. This site gives every project the same structure, so a reader can compare them and find the answers they care about quickly:

**Architecture → Data Pipeline → Machine Learning → Platform → Results.**

## What's inside

- **The Shelf:** a flat stack of book spines (one volume per project) with hover, a "reading head" and a book-opening modal. A spine keeps its colour from shelf to modal to the page-transition cover.
- **The project page (`/projects/:slug`):** one template for every project, with separate laptop and mobile layouts. It has a sticky chapter strip with reading progress, a dark architecture spread, step timelines, metric tables, and a next-volume card. Blocks with no data are hidden, never shown as placeholders.
- **Motion:** Lenis smooth scroll synced with GSAP ScrollTrigger, SplitText headlines, pinned section transitions, and a fixed-footer reveal. It respects `prefers-reduced-motion` and falls back to native scroll on touch.
- **Backend:** a small FastAPI service for project data and a contact form, with bundled fallback data so the site still works if the API is down.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, React Router 6, Vite 5, Tailwind CSS 3 |
| Motion | GSAP (ScrollTrigger, SplitText), Lenis, Framer Motion |
| Backend | FastAPI, Uvicorn, Pydantic |

## Quick start

Run the backend and frontend in two terminals.

```bash
# 1. API (http://localhost:8000)
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload --port 8000

# 2. Site (http://localhost:5173, proxies /api to :8000)
cd frontend
npm install
npm run dev
```

Production build: `npm run build && npm run preview` (in `frontend/`). If the API is hosted elsewhere, set `VITE_API_BASE` and add the origin to the CORS list in `backend/main.py`.

## How projects are added

Content is data, not markup, so adding a project never means writing page code.

1. **Shelf entry** (title, tag, spine colour, order, one-line result): `backend/data.py`, mirrored in `frontend/src/data/fallbackProjects.js`. Set `published` to show or hide a book.
2. **Case-study page:** one file per project in `frontend/src/data/projects/<slug>.js`, following the shared schema in `schema.js`, then register it in `index.js`.
3. Put images in `frontend/public/images/<slug>/`.

Anything not written yet is marked `TODO` in the data file and simply doesn't render. Volume number, tag, spine colour and key result always come from the shelf, so a page can't drift from its book.

## Project structure

```text
backend/            FastAPI app: main.py (routes), data.py (shelf data)
frontend/src/
  pages/            Home and ProjectDetail
  components/       Hero, Shelf, BookModal, Footer, transitions
  components/project/   the project-page template (laptop + mobile layouts, motion hooks)
  data/projects/    one content file per project + the shared schema
  data/             shelf helpers and offline fallback data
docs/               longer guides
```

## Design decisions worth knowing

- **One template, data-driven:** all projects share the same sections and spacing, and only the content changes. Empty data hides its block instead of leaving a hole.
- **Two layouts, never both mounted:** the mobile page is a separate, minimal component tree (not the laptop one squeezed), switched with `matchMedia`.
- **GSAP owns outer wrappers, CSS owns hover:** transforms never fight each other, and every animation is reverted on unmount.
- **Offline-safe:** the frontend ships a mirror of the shelf data, so a cold or failed API doesn't leave an empty site.

## Roadmap

- Live link and screenshots in this README
- Real content for the remaining project chapters (see `TODO`s in `frontend/src/data/projects/`)
- Automated tests for routing, fallback loading and contact validation
- Deployment config for the Vite app and the API; store contact messages in a real datastore or email workflow
- Accessibility pass on keyboard navigation of the book modal

## Contact

Email [siddhartdongardive23@gmail.com](mailto:siddhartdongardive23@gmail.com) · GitHub [@siddhu-exe](https://github.com/siddhu-exe)

## Credits & license

Visual direction was inspired by [Nithin M Warrier's portfolio](https://www.nithinmwarrier.com/); the bookshelf concept and implementation are original. No license file is included yet; add one (for example MIT) if you want others to reuse the code.
