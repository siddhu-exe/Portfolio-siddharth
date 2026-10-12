# Home hero: signature handoff, reveal, menu

Source design: `frontend/design/Home — Hero Redesign.html` (a bundled Claude Design
export with three screens: Laptop, Menu open, Mobile). Laptop layout is >= 1024px,
mobile layout is below it. Files: `components/Hero.jsx`, `MenuPill.jsx`,
`Signature.jsx`, `data/siteLinks.js`.

## Sequence

1. **Intro (unchanged).** The signature draws itself, the two side lines extend from the
   frame edges, and the blue "hey there!" cursor badge types (`CursorBadge` +
   `CyclingTypewriter`).
2. **Handoff (at 3.1s, `INTRO_HOLD_S`).** The *same* signature element glides to its
   resting place (0.95s, ease `0.76,0,0.24,1`):
   - laptop: top-centre, 214x84 box (about 58px of ink), between two 120px hairlines
   - mobile: top-left next to the Menu pill, 163x64 box (about 44px of ink); side lines fade out
3. **Reveal (about 1.1s after landing, power3.out).** Eyebrow, headline (SplitText chars,
   "Intelligence" in italic `brick`), intro line, buttons, then Menu pill + bottom row.
4. **Letter hover** on the headline (`CursorProximityText`) activates when the reveal ends.
   The headline's reveal mask switches to `overflow: visible` then, so scaled letters
   are not clipped.

`onIntroComplete` fires when the reveal ends (it shows `BookmarkProgress`).

## How the handoff works

The header contains invisible **slot** elements (`slotSigRef`, `slotLineLRef`,
`slotLineRRef`) that define where things land. `measureFinal()` clears transforms,
reads `getBoundingClientRect()` of the signature/lines and of the slots, and returns
x / y / scale (signature) and x / y / scaleX (lines), in the stage's own coordinates
(the hero-sink scale is divided out). The lift is a GSAP timeline of those values;
`placeFinal()` applies them with `gsap.set` and is also used:

- on mount for returning visitors and reduced motion (no draw, no move)
- once at the end of the lift, in case the viewport changed mid-flight
- on `resize` after landing (rAF-throttled), including laptop <-> mobile switches

There is one signature element: no duplicate, no swap. To move the landing spot, change
the slot sizes/positions in `Hero.jsx`, not the tween.

**Transform ownership.** GSAP owns the outer wrappers (signature, line wrappers, text
blocks, the menu wrapper). Framer Motion owns the inner elements (path draw-in, line
`scaleX` draw-in, menu surfaces). Never animate transform on both for one element.
`Signature` takes `instant` to render fully drawn (no draw-on).

## Returning visitors / reduced motion

Skipping uses the existing `skipIntro` (`location.state.landAt === 'shelf'`, see
PROJECT_GUIDE section 12.4). There is no sessionStorage flag, so a manual reload plays
the intro. Both skip and `prefers-reduced-motion` call `placeFinal()` and show
everything immediately.

## Menu (`MenuPill.jsx`)

- Fixed top-right pill, portaled to `<body>` (the sinking hero is transformed, which
  would otherwise capture `position: fixed`). Hero GSAP fades its wrapper in last.
- Opening morphs the yellow pill into the black panel through a shared framer
  `layoutId="menu-surface"`; the colour change is the layoutId crossfade. Contents
  fade in over it. Closing runs the same morph in reverse (the panel wrapper stays
  mounted for 0.55s via `EXIT_HOLD`).
- Rows: Home (`top`), Works (`shelf`), Contact (`contact`) via `scrollToSection`.
  "N volumes" is the live published count passed from `Home.jsx` (`isShelfReady`).
- Esc closes, Tab is trapped in the dialog, focus returns to the pill, and page scroll
  is frozen with `stopScroll()` / `startScroll()` (Lenis `stop`/`start`; overflow lock
  when Lenis is off). Rows call `startScroll()` before gliding, because a stopped Lenis
  ignores `scrollTo`.

## Content and links

- Copy lives in `Hero.jsx`; GitHub / LinkedIn / résumé URLs in `data/siteLinks.js`
  (the footer keeps its own copies).
- **Résumé:** `RESUME_HREF` points at `frontend/public/Siddharth-Dongardive-Resume.docx`
  (copied from `docs/sid resume - Data Scientist.docx`). To update it, replace that
  file; to hide the behaviour, set `RESUME_HREF` to `null`.
- Colours use tokens: `sun` (menu yellow), `umber` / `umber-mid` / `umber-soft` (warm
  greys), `moss` (status dot), `sand` (menu numbers), `brick` ("Intelligence").

## Checking it

No unit tests. Run the dev server and check at ~1440x900, ~1280x620 (content stays
centred), 390x844 and 360x640 (no horizontal scroll): intro, handoff, reveal, menu
open/close, Esc, Tab trap, scroll lock. Also reload with `prefers-reduced-motion`.
