# Portfolio Website

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

An interactive portfolio for Siddharth Dongardive, presented as a digital library of data, machine learning, deep learning, and AI application work. The experience combines a React/Vite frontend with a small FastAPI service that supplies project and contact data.

---

## The Story

This portfolio is built around one idea: every domain of expertise is a bookshelf, and every project is a book.

Instead of arranging work as a grid of traditional project cards, the site groups projects into shelves such as Data Analytics, Data Visualization, Machine Learning, Deep Learning, and AI Applications. Selecting a book opens it as a physical object, then leads into a project “chapter” with its description, stack, gallery sections, links, and previous/next navigation.

The result is an engineering journey rather than a catalogue. The interaction, pacing, and page transitions give each project context: a challenge solved, a lesson learned, and a chapter in a growing body of work.

---

## Features

- [x] Animated hero introduction with a self-drawing signature
- [x] Staggered hero typography and cycling typewriter copy
- [x] Cursor-following interaction badges and proximity text
- [x] Morphing menu pill with Home, Works, and Contact navigation
- [x] Data-driven bookshelf navigation across five expertise domains
- [x] Interactive book spines with hover states and custom cursor treatment
- [x] Animated book-opening modal with responsive mobile layout
- [x] Project chapter routes at `/projects/:slug`
- [x] Chapter galleries with architecture, pipeline, model, platform, and results sections
- [x] Previous/next chapter navigation
- [x] Scroll-linked statement reveal and staged pinned section transitions
- [x] Smooth scrolling with Lenis and GSAP ScrollTrigger synchronisation
- [x] Toolbox section and reading-corner article section
- [x] Animated footer reveal with social links, India clock, and contact modal
- [x] FastAPI project API with bundled frontend fallback data
- [x] Reduced-motion and touch-device fallbacks

---

## Design Philosophy

The interface stays deliberately spare: cream, ink, terracotta, mustard, and wood tones establish a quiet editorial canvas while the content does the explaining.

The bookshelf metaphor gives the work an information architecture that is easy to scan. A recruiter can move from domain to project to implementation detail without losing the larger narrative. Motion is used as wayfinding: the hero introduces the author, the statement frames the point of view, shelves organise the work, and book-like transitions carry the reader into a chapter.

The presentation is engineering-first. Project data, shelf grouping, chapter navigation, gallery structure, and API responses are all data-driven, so the visual story can grow without duplicating page markup.

---

## Tech Stack

### Frontend

- React 18
- React Router 6
- Vite 5

### Animation

- Framer Motion
- GSAP and `@gsap/react`
- GSAP SplitText and ScrollTrigger
- Lenis smooth scrolling

### Styling

- Tailwind CSS 3
- PostCSS
- Custom CSS tokens, dot-grid backgrounds, grain textures, and responsive layouts

### Backend

- FastAPI
- Uvicorn
- Pydantic with email validation

### Other Libraries

- `react-dom`
- `autoprefixer`

### Responsive / mobile

The experience is desktop-first, with mobile support layered on **without
changing desktop rendering** (everything is gated behind the `md` breakpoint).
On phones: the scroll pins are skipped and sections fade-stack; the fixed footer
uses `100dvh` and stacks its top links; the book modal switches to a single-page
flip layout; returning from a project skips the intro and lands on the shelf; and
the Reading Corner becomes a tap-to-expand vertical timeline. See
[`docs/PROJECT_GUIDE.md` §12](docs/PROJECT_GUIDE.md) for the full breakdown.

### Deployment

No deployment configuration is committed. The frontend is a standard Vite build, and the backend runs as a FastAPI application under Uvicorn.

---

## Folder Structure

```text
Portfolio/
├── frontend/
│   ├── src/
│   │   ├── components/       # Hero, shelves, books, transitions, footer, and UI primitives
│   │   ├── pages/            # Home experience and project chapter route
│   │   ├── data/             # Offline fallback project data
│   │   ├── api.js            # Frontend API helpers
│   │   ├── App.jsx           # Router and global providers
│   │   └── index.css         # Tailwind entry point and custom visual behaviour
│   ├── scripts/              # Repository verification and section helpers
│   ├── package.json          # Frontend scripts and dependencies
│   ├── vite.config.js        # Dev server and `/api` proxy
│   └── tailwind.config.js    # Theme tokens and typography
├── backend/
│   ├── main.py               # FastAPI routes, CORS, contact logging
│   ├── data.py               # Shelves, projects, chapter metadata, and gallery templates
│   └── requirements.txt      # Python dependencies
├── docs/
│   ├── PROJECT_GUIDE.md      # Architecture and contribution guide
│   ├── ADDING_PROJECTS.md    # How to add books and shelves
│   └── CHAPTER_PAGE.md       # Project chapter content and gallery guide
└── README.md
```

---

## Getting Started

The frontend expects the FastAPI service on port `8000` during development. Run both processes in separate terminals.

### 1. Start the backend

```bash
git clone https://github.com/siddhu-exe/Porfolio.git
cd Porfolio/backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload --port 8000
```

If the repository is already cloned, start from the repository root:

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload --port 8000
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The Vite server proxies `/api/*` to `http://localhost:8000`. Set `VITE_API_BASE` when the API is hosted elsewhere. If the API is unavailable, the frontend uses `src/data/fallbackProjects.js` so the shelf remains usable.

### Production build

```bash
cd frontend
npm run build
npm run preview
```

### API routes

- `GET /api/health` — health check
- `GET /api/projects` — flat and grouped project data
- `GET /api/projects/{slug}` — one project chapter
- `POST /api/contact` — validates and appends contact messages to `backend/contact_messages.jsonl`

---

## Screenshots

No screenshot files are currently committed. Suggested captures for future documentation:

| View | What to capture |
| --- | --- |
| Hero | Signature intro, headline, cursor badge, and menu pill |
| Bookshelf | The five domain shelves with interactive book spines |
| Project details | Open book modal and `/projects/:slug` chapter page |
| Articles | Reading Corner article books |
| Footer | Animated reach-out panel and contact entry point |

---

## Future Improvements

- Replace placeholder project imagery with final case-study assets.
- Complete and deepen the project chapter content, metrics, and external links.
- Add automated frontend and API tests for routing, fallback loading, and contact validation.
- Add a production deployment configuration for the Vite app and FastAPI service.
- Persist contact submissions in a managed datastore or email workflow instead of local JSONL logging.
- Add accessibility review coverage for keyboard book interaction, focus management, and animated transitions.

---

## Credits

The visual direction acknowledges the inspiration of [Nithin M Warrier’s portfolio](https://www.nithinmwarrier.com/). The implementation, engineering-focused storytelling, bookshelf concept, and project architecture in this repository are original work.

---

## License

No license file is currently included in the repository. Add an MIT `LICENSE` file if you intend to distribute this project under the MIT License.
