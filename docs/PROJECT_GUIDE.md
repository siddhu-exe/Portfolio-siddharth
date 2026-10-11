# PROJECT GUIDE — Read This First (for any LLM / new contributor)

This single file explains the **entire** Siddharth Dongardive portfolio site well
enough that you can understand it and safely edit it **without reading every
source file first**. Read this top-to-bottom once, then jump to the section for
whatever you're changing.

> Companion docs (more detail on specific tasks):
> - [`ADDING_PROJECTS.md`](ADDING_PROJECTS.md) — add a book (project) to the shelf.
> - [`CHAPTER_PAGE.md`](CHAPTER_PAGE.md) — the project page: one template, one data file per project.

---

## 1. What this is

A single-page, scroll-driven **portfolio site** themed as a **library**. A
visitor scrolls through a sequence of full-screen sections joined by cinematic
scroll transitions, and clicking a "book" opens a project case-study page.

- **Frontend:** React 18 + Vite, Tailwind CSS, Framer Motion + GSAP (ScrollTrigger)
  for animation, Lenis for smooth scroll, React Router for the 2 routes.
- **Backend:** FastAPI (Python). Serves project data and accepts the contact form.
  It is **data-only** — all visuals live in the frontend.
- **Source of truth for content:** the shelf (title, tag, order, spine colour,
  result) is the backend (`backend/data.py`); the frontend fetches it and a bundled
  fallback keeps the UI working if the API is down. The case-study **project page**
  content lives in the frontend, one file per project (`src/data/projects/`).

## 2. Run it

```bash
# backend (terminal 1) — from repo root
cd backend
uvicorn main:app --reload --port 8000        # NOTE: main:app, NOT app.main:app

# frontend (terminal 2)
cd frontend
npm install
npm run dev                                   # http://localhost:5173
```

Vite proxies `/api/*` → `http://localhost:8000` in dev (see `frontend/vite.config.js`),
so no CORS setup is needed locally. To point at a deployed API, set `VITE_API_BASE`.
`npm run build` produces the production bundle; there are no unit tests — verify
changes by running the app and scrolling through.

## 3. Repo layout

```
Portfolio/
├── README.md
├── docs/
│   ├── PROJECT_GUIDE.md      ← you are here (architecture overview)
│   ├── ADDING_PROJECTS.md    ← add/edit books & shelves
│   └── CHAPTER_PAGE.md       ← the /projects/:slug project page (template + schema)
├── backend/
│   ├── main.py               ← FastAPI app: 3 GET + 1 POST endpoint, CORS
│   ├── data.py               ← THE content source of truth (projects, shelves, galleries)
│   ├── requirements.txt
│   └── contact_messages.jsonl← contact submissions get appended here (stub)
└── frontend/
    ├── tailwind.config.js    ← design tokens (colors, fonts, tracking)
    ├── vite.config.js        ← dev server + /api proxy
    └── src/
        ├── main.jsx          ← React entry (mounts <App/> in <BrowserRouter>)
        ├── App.jsx           ← providers + the 2 routes
        ├── index.css         ← Tailwind layers + a few global utility classes
        ├── api.js            ← fetchProjects / fetchProject / sendContact
        ├── data/
        │   ├── fallbackProjects.js ← offline mirror of the backend shelf data
        │   ├── shelfBooks.js       ← shelf helpers (published filter, sort, spine contrast)
        │   ├── projectPage.js      ← builds the project-page view-model (hides empty blocks)
        │   └── projects/           ← one content file per project + schema.js + index.js
        ├── hooks/            ← useMediaQuery, useShelfBooks
        ├── pages/
        │   ├── Home.jsx      ← the scroll-through single page (composition root)
        │   └── ProjectDetail.jsx ← /projects/:slug, renders <ProjectPage>
        └── components/       ← one component per section / effect (see §6)
            └── project/      ← the project-page template (laptop + mobile layouts)
```

## 4. Design tokens (Tailwind) — use these, don't hardcode hex

Defined in `frontend/tailwind.config.js`:

| Token | Value | Meaning |
|-------|-------|---------|
| `cream` | `#F7F1ED` | primary background |
| `ink` | `#171717` | primary text / dark sections |
| `terracotta` | `#D9834A` | accent (signature, small marks) |
| `mustard` | `#FFE862` | footer / yellow sections |
| `bark` / `barklight` / `wood` / `tan` | browns | Toolbox section only |
| font `sans` | General Sans / Inter | body & UI (default) |
| font `display` | Playfair Display / Georgia | big display headings (`font-display`) |
| tracking `headline` | `-0.03em` | tight tracking for large headings (`tracking-headline`) |

Global helpers in `src/index.css`: `.dot-grid` (the dotted background texture),
`.tw-cursor` (blinking typewriter caret), `.book-title` (vertical text for book
spines), `.scrollbar-none`. Site-wide horizontal padding convention is
`px-8 md:px-16` — this aligns content to the fixed vertical frame lines (see §7).

## 5. The page as a scroll sequence (READ THIS before touching Home.jsx)

`pages/Home.jsx` is the composition root. The visitor scrolls through this order:

```
Hero (cream)                 ← intro, signature draws, name, Menu pill
  │  transition #1: hero is sticky; Statement's stepped podium rises over it,
  │                 hero sinks + fades (framer-motion useScroll on statementRef)
Statement (black)            ← "Every book on this shelf…" pinned word-by-word reveal
  │  transition #2+#3: PinnedCurtainChain
ProjectShelf (cream)         ← the bookshelf; click a book → modal → project page
  │  (curtain)
Toolbox (dark brown)         ← tools hanging on nails, swing on hover
  │  (curtain, mode:'scale', dwell)
ReadingCorner (black)        ← articles as little books
  │  final transition: #contact reveal window; footer rises + fades in
Footer (mustard, FIXED)      ← ghost name, LIBRARY CLOSED, links, live IST clock
```

Key structural facts (do not break these):

- **`<Footer>` is `position: fixed` at `z-0`, behind everything.** `<main>` is
  `z-10` and opaque, so it covers the footer. The last thing in the DOM before
  the footer is a `<div id="contact" class="h-screen">` **reveal window** — as
  it scrolls up, the fixed footer is uncovered. That same `#contact` element is
  the scroll driver for the footer's rise-in animation (`footerRise` →
  `riseStyle` prop). If you add a section after ReadingCorner, it goes **inside
  `<main>`**, before `#contact`.
- **Transition #1** (Hero→Statement) is Framer Motion: `useScroll` on
  `statementRef` drives `heroSink` (`y`/`opacity`/`scale`) passed to `<Hero sinkStyle>`.
- **Transitions #2 & #3** (Shelf→Toolbox→ReadingCorner) are GSAP via
  `<PinnedCurtainChain>` — see §8.
- The **Statement** section does its own internal pin (a tall `h-[300vh]` track
  with a `sticky` inner) — it's self-contained, not part of the chain.

## 6. Component map (what each file is)

**Sections (rendered by Home.jsx, in scroll order):**
| File | Role |
|------|------|
| `Hero.jsx` | Landing: animated signature, typed greeting, big name, Menu pill. |
| `Statement.jsx` | Black interlude; scroll-pinned word-by-word text reveal + drawn line. |
| `ProjectShelf.jsx` | The Project Shelf: published projects as one flat stack of spine rows in `sort_order` (helpers in `data/shelfBooks.js`), with its own scroll/hover motion. Owns `BookModal`. |
| `Toolbox.jsx` | "Tools Behind Every Chapter" — tech icons hanging on nails. |
| `ReadingCorner.jsx` | "Reading Corner" — articles rendered as little 3D books. |
| `Footer.jsx` | Fixed mustard footer: ghost name, CTA, social links, live clock. |

**Transition / motion infrastructure:**
| File | Role |
|------|------|
| `PinnedCurtainChain.jsx` | Chains N sections via N-1 GSAP pin+scrub "curtain" reveals. The core scroll engine. See §8. |
| `PinnedCurtain.jsx` | Single-pair version (currently Home uses the Chain; keep for reference/reuse). |
| `SmoothScroll.jsx` | Lenis smooth-scroll, synced to GSAP ticker + ScrollTrigger. Mounted once in App. |
| `PageTransition.jsx` | `PageTransitionProvider` + `usePageTransition()` — the book-cover wipe between routes. |
| `ScrollMorphEdge.jsx` | A wavy SVG edge whose curve reacts to scroll velocity (section seams). |

**Reusable pieces / effects:**
| File | Role |
|------|------|
| `BookModal.jsx` | Opens on book click; "View Full Project" → `usePageTransition` to `/projects/:slug`. |
| `project/ProjectPage.jsx` | The project-page template; mounts `LaptopLayout` (>= 1024px) or `MobileLayout` (one at a time). Styles in `project/project.css`, motion in `project/useProjectMotion.js`. See `CHAPTER_PAGE.md`. |
| `ImageGallery.jsx` | Legacy: the old chapter-page image gallery. No longer used by the project page. |
| `ContactModal.jsx` | The contact form; POSTs via `sendContact`. |
| `MenuPill.jsx` | The hero's expandable nav pill. |
| `Signature.jsx` | SVG signature with a draw-on animation (`play` prop). |
| `MaskedRevealText.jsx` | Lines that slide up from a clip mask (`inView` prop). |
| `Typewriter.jsx` / `CyclingTypewriter.jsx` | Typed text (one-shot / looping). |
| `CursorBadge.jsx` | Custom cursor label (e.g. "Click" over books). |
| `EyeFollowButton.jsx` | Button whose "eyes" track the cursor. |
| `FrameLines.jsx` | The two fixed vertical border lines framing the whole site. |

**Pages:** `Home.jsx` (§5), `ProjectDetail.jsx` (loads shelf + content, renders `ProjectPage`; see `CHAPTER_PAGE.md`).

## 7. The vertical frame lines (why content must respect `px-8 md:px-16`)

`FrameLines.jsx` renders two `position: fixed` hairlines at `left-4/right-4`
(mobile) and `left-10/right-10` (desktop), at `z-[60]`, on **every** route (it's
in `App.jsx` outside the router). Section content uses `px-8 md:px-16` so it sits
*inside* those lines. **Do not** wrap a page's content in a narrow centered
`max-w-*` container at the top level — that visually detaches content from the
frame. Constrain inner text with `max-w-*` if needed, but let structural
padding be `px-8 md:px-16`.

## 8. PinnedCurtainChain — the scroll transition engine (edit carefully)

`components/PinnedCurtainChain.jsx` takes `sections={[{ node, ... }]}` and mounts
each **exactly once**, wiring N-1 GSAP ScrollTrigger transitions between
consecutive pairs. For pair (i, i+1): section *i* pins when its bottom hits the
viewport bottom; section *i+1* slides up (`yPercent: 100 → 0`) over ~1 viewport
of scrubbed scroll, like a curtain rising over the pinned section.

Per-section options (on the object, applies to the transition that reveals it):
- `dwellVh` (number): extra pinned scroll AFTER the reveal completes, holding the
  section fully covering the screen (so a fast scroller actually sees it).
- `startOffsetVh` (number): pinned hold BEFORE the curtain starts rising.
- `mode: 'scale'`: scale-through — the outgoing section recedes (scale down +
  dim) while the incoming settles forward from slightly oversized. The stage is
  painted black during this so no transparent gap shows the fixed footer.

Hard-won invariants (breaking these caused real bugs — don't regress them):
- Each section is measured (ResizeObserver) and rendered **once**; never render a
  section twice "for spacing."
- Each stage's height is independent — never chain a shared `margin-top:-100vh`,
  it compounds and collapses later sections.
- Below `md` the pins are skipped entirely (touch pinning is janky) — sections
  just stack with a light fade-in.
- Animate inner content nodes for `scale` mode, never the pinned stage element
  (ScrollTrigger owns its transform). Avoid animating `filter: blur()` on
  image-heavy sections — it re-rasterizes every frame (caused the Toolbox lag).

Lenis + GSAP are already synced in `SmoothScroll.jsx` (Lenis drives the GSAP
ticker; ScrollTrigger updates on Lenis scroll). Any new ScrollTrigger you add
inherits this automatically — don't create a second Lenis instance.

## 9. Backend API

`backend/main.py` — FastAPI, CORS open to the Vite dev origins. Endpoints:

| Method + path | Returns |
|---|---|
| `GET /api/projects` | `{ categories, shelves, projects, grouped }` |
| `GET /api/projects/{slug}` | one full project object, or 404 |
| `POST /api/contact` | validates `{name, email, message}`, appends to `contact_messages.jsonl`, returns `{ok, message}` |
| `GET /api/health` | `{status: "ok"}` |

The shelf data is built in `backend/data.py` (see `ADDING_PROJECTS.md` for the
exact shape and how to add entries). `frontend/src/data/fallbackProjects.js`
mirrors it for offline use — keep them roughly in sync. The project page does not
fetch case-study content from the API; it reads `src/data/projects/<slug>.js` and
takes only volume/tag/spine colour/key result from the shelf list.

## 10. How to make common changes (playbook)

- **Add / edit a project or category** → `backend/data.py` (+ mirror in
  `fallbackProjects.js`) for the shelf, and `src/data/projects/<slug>.js` for the
  page. Full steps in `ADDING_PROJECTS.md`. You rarely touch React for this — the
  shelf and project page are data-driven.
- **Edit the project page** → content: `src/data/projects/<slug>.js`; design for all
  projects: `components/project/` (`LaptopLayout.jsx`, `MobileLayout.jsx`,
  `project.css`); see `CHAPTER_PAGE.md`.
- **Change a section's look** → edit that section's component in §6. It won't
  affect the transitions (those live in `PinnedCurtainChain` / Home).
- **Change / add a scroll transition** → `Home.jsx` (composition) and/or
  `PinnedCurtainChain.jsx` (engine). Re-read §5 and §8 first; test at both slow
  and fast scroll speeds and on a narrow (mobile) width.
- **Add a new full-screen section before the footer** → add its component, then
  insert it inside `<main>` in `Home.jsx` — either in the `PinnedCurtainChain`
  `sections` array (to get a curtain transition) or as a plain block. It must be
  **before** the `#contact` reveal window, never after it.
- **Change colors / fonts** → `tailwind.config.js` tokens (§4), then use the
  token classes; don't scatter raw hex codes.
- **Footer content / links / CTA** → `Footer.jsx`. The footer is fixed and
  reveal-animated; keep it `position: fixed` and keep the `riseStyle` wrapper.

## 11. Gotchas / non-obvious things

- The **signature draw animation** should play once, when its section enters view
  (`Signature` takes a `play` prop). Don't trigger it globally on load.
- The footer being `fixed` behind `<main>` is intentional (§5). If the footer
  ever "disappears" or shows through a gap mid-page, it's a `z-index` /
  transparent-stage issue in a transition, not the footer itself.
- `uvicorn` target is `main:app` (the file is `backend/main.py`), **not**
  `app.main:app` — there is no `app/` package.
- No test suite. "Verify" = run the app, scroll the whole page slowly and fast,
  open a book → its project page, submit the contact form.
- `.dot-grid` + the `px-8 md:px-16` padding + `FrameLines` together create the
  framed look; changing one without the others looks broken.

## 12. Mobile / responsive behavior (added later — read before touching mobile)

The site is desktop-first; mobile support was layered on **without changing any
desktop rendering**. The consistent pattern here (follow it for any new mobile
work): keep the existing desktop markup exactly as-is and gate mobile behind the
`md` breakpoint — either Tailwind `md:` utilities, a `hidden md:block` /
`md:hidden` pair, or a JS media-query check at `max-width: 767px` (mirrors `md`).
Never fork desktop values; only add mobile ones. Verify every change on a narrow
width AND on desktop.

**Breakpoint:** `md` = 768px everywhere. The `(max-width: 767px)` matchMedia in
JS (below) is the JS twin of `md:`.

### 12.1 Scroll engine already has a mobile path (don't "add pinning" on mobile)
`PinnedCurtainChain.jsx` and `SmoothScroll.jsx` intentionally behave differently
below `md`:
- **PinnedCurtainChain** skips all GSAP pinning under 768px (`mm.add('(max-width:
  767px)', …)`); sections just stack in normal flow with a light fade-in. The
  curtain/scale transitions run only at `min-width: 768px`. This is by design
  (touch-scroll pinning is janky) — see §8.
- **SmoothScroll** disables Lenis on touch / coarse-pointer devices (native
  scroll is used). So `lenisInstance` is `null` on most phones — any scroll
  helper must handle that (both `scrollToSection` and `jumpToSection` do).

### 12.2 Footer visibility on mobile (`Footer.jsx`)
The fixed footer is `h-[100dvh] md:h-screen` — mobile uses **dynamic** viewport
height so the bottom bar isn't hidden behind the browser chrome (the classic
`100vh` bug). The giant ghost name block is capped `max-h-[38vh] md:max-h-none`
so the cream strip below always fits on short phones. The top bar (GitHub /
LinkedIn / email) stacks vertically on mobile (`flex-col … md:flex-row
md:justify-between`) instead of the desktop row. Keep the footer `position:
fixed` with the `riseStyle` wrapper (§5, §10).

### 12.3 Book modal has a separate mobile layout (`BookModal.jsx`)
Desktop is a two-page spread (image left / writeup right) with a cover that flips
around its **left** edge. On phones each page was ~180px wide (unreadable), so a
`useIsMobile()` hook (`max-width: 767px`) swaps in a **single-page** layout via
the `MobileSpread` component: same cover-flip motion, but the cover flips **up**
around its top edge (rotateX) to reveal the image as a top banner, with the
full-width writeup below. The desktop spread JSX is unchanged — it's just wrapped
`{isMobile ? <MobileSpread/> : (…original…)}`. Shared `content`/`line` variants,
`OPEN`/`CLOSE`, and `transitionTo` are reused by both.

### 12.4 Return-from-project: skip intro, land on the shelf
Returning from a project page skips the Hero intro and opens directly on the
bookshelf (both mobile and desktop). Flow:
- `useProjectNav.js` (`goBack`) calls `transitionTo('/', { …, landAt: 'shelf' })`.
- `PageTransition.jsx` forwards `landAt` into React Router location state
  (`navigate(path, { state:{ landAt } })`) and **skips its usual
  `window.scrollTo(0,0)`** when `landAt` is set (Home places the scroll instead).
- `Home.jsx` reads `location.state?.landAt` **once** into `skipIntro` (captured
  in `useState(() => …)` so it's stable), seeds `introComplete` from it (so
  `BookmarkProgress` shows immediately), passes `skipIntro` to `<Hero>`, and — in
  an effect — waits two `requestAnimationFrame`s, calls `ScrollTrigger.refresh()`,
  then `jumpToSection('shelf')`. It also clears the history state
  (`navigate('.', { replace:true, state:null })`) so a **manual reload of `/`
  still plays the intro** from the top.
- `Hero.jsx` takes `skipIntro`: initial `phase` is `'hero'` (not `'intro'`) and
  the intro timer is guarded off, so no signature-draw/lift — the hero text block
  still mounts (off-screen above the shelf).
- `jumpToSection(target)` (`SmoothScroll.jsx`) is the **instant** (no-glide) twin
  of `scrollToSection`; uses Lenis `{ immediate: true }` when active, else native.
  The jump happens while the route-transition cover is still closed, so it's
  hidden — the cover opens already on the shelf. `#shelf`'s offset is stable
  (Hero + Statement have fixed heights), so this is valid before any pin engages.

### 12.5 Reading Corner has a mobile timeline (`ReadingCorner.jsx`)
The desktop 3D "article books" are hover-driven (lift + face-on + Read↗), which
is dead on touch. On mobile the book row is replaced by `ReadingTimeline` — a
vertical timeline (terracotta dots on a connecting line) where each row is a
single-open **accordion** (first item open by default) revealing blurb + read
time + a **"Read ↗"** link that opens `article.url` in a new tab. Gating:
`<ReadingTimeline/>` is `md:hidden`; the original books wrapper is `hidden
md:block` — desktop untouched. Articles gained an optional `readTime` field
(rendered only when present); the section stays data-driven off the `ARTICLES`
array, so both layouts pick up new entries automatically.

### 12.6 The project page's mobile layout
Unlike the rest of the site, the project page does **not** layer mobile onto one
desktop tree: below 1024px (`lg`, not `md`) `ProjectPage` mounts a separate
`MobileLayout` instead of `LaptopLayout` (switched with `matchMedia`; only one is
ever mounted, so animations never run twice). Between 768 and 1023px it stays a
single 640px-max column so content clears the 40px frame lines. Details in
`CHAPTER_PAGE.md`.

### 12.7 Mobile verification checklist
Run the app (`npm run dev`) and check at a narrow width (DevTools device mode or
a real phone) AND at desktop width:
- Footer: scroll to bottom — full cream strip + stacked GitHub/LinkedIn/email are
  visible, nothing clipped by the browser bar.
- Book: tap a spine — cover flips up (in the spine's own colour), image banner +
  readable full-width writeup; "View Full Project" works and the project page
  opens at the top.
- Back from a project → lands on the shelf, no intro; a fresh reload of `/` still
  plays the intro from the top.
- Reading Corner: timeline with first item open; tap rows to expand, "Read ↗"
  opens the article.
- Desktop width still shows the two-page book spread, the 3D reading books, and
  the full intro + curtain transitions — unchanged.

