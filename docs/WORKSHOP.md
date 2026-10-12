# The Workshop (Toolbox section)

Source design: `frontend/design/The Workshop — Toolbox Redesign.html` (a bundled Claude
Design export with two screens: Desktop 1440x900 and Mobile 390). Laptop layout is
>= 1024px, phone layout is below it. Files: `components/Toolbox.jsx`, `data/tools.js`,
the `.tb-*` block at the end of `src/index.css`.

## Content: one data file

Everything on screen comes from `src/data/tools.js`:

- `TOOL_DRAWERS`: four drawers (`key`, `name`, `desc` for laptop, `short` for phone,
  `tile` = monogram tile colour, `label` = label + rule colour, `tools`).
- A tool is one line: `{ name: 'Python', mono: 'Py' }`. `mono` is optional (falls back to
  the first two letters of the name).
- The header counters ("16 TOOLS · 4 DRAWERS") are computed from the array.
- `NEXT_TOOL`: shown as "CURRENTLY LEARNING · <tool>". Empty hides it (on phones the whole
  bottom row goes with it). It is empty on purpose; fill it in yourself.

Keep the list in line with the Skills section of `docs/master-cv.md`. **Four tools per drawer** is
what fits one laptop viewport (1440x900 is exactly 900px tall); a fifth row makes the
section taller than the screen and the pinned stage then cuts off its top.

There are no logo SVGs in the project, so tiles are monograms. If logos are added later,
render them in one cream colour (`#FFF4E4`), never in brand colours.

## Layout

- Laptop: header (eyebrow, Playfair title, subtitle + counters on the right), four drawer
  columns, then a bottom line ("SEE THEM IN ACTION ON THE SHELF ↑" scrolls to `#shelf`
  through Lenis). Phone: stacked drawers with 2-column cards, no counters, no shelf link.
- The content group is vertically **centred** in a `min-height: 100dvh` section. Vertical
  sizes are `vh` clamps (title, row height, gaps) that equal the design at 900px tall and
  shrink below it, so the section still fits 1366x768, 1280x720 and 1024x768. If you change
  spacing, re-check those sizes: the section must not be taller than the viewport.
- Frame lines come from the global `FrameLines.jsx`; the section does not draw its own.
- The torn paper edge at the top and the `#1A1410` background belong to the pinned
  transition from the shelf. Do not remove them.
- Tool rows link to the shelf (the design shows a hover arrow but no destination).

## Motion

Nothing animates under `prefers-reduced-motion`: the CSS rest state is the final state
(numbers included, no hover lift or arrow slide).

Otherwise, once the section is on screen: eyebrow, then title (SplitText lines in a mask),
then subtitle + counters (count up once), then the drawers left to right. Each drawer's
2px rule draws in (`scaleX`), then its rows fade up (stagger 0.05). On phones the header
and each drawer enter on their own as they scroll into view.

- GSAP only touches outer wrappers: header pieces, `.tb-dhead`, `.tb-rule` and the `<li>`
  of each tool. Hover and keyboard focus live on the inner `a.tb-tool` and `.tb-tile` in
  CSS (row background, tile lifts 2px with a cream ring, orange arrow slides in).
- Everything is in one `useGSAP` context plus `gsap.matchMedia`, reverted on cleanup.
- **The entrance is triggered by an `IntersectionObserver`, not a ScrollTrigger.** The section
  lives inside `PinnedCurtainChain`, where pin spacers and the curtain transform make
  ScrollTrigger start positions wrong (the entrance never fired when the user stopped at
  the landing point). Do not switch it back to a ScrollTrigger `start`.
- `gsap.matchMedia` with a conditions object runs the callback when *any* condition
  matches, so the callback checks `motion` itself. Keep that check.
- SplitText in this version ignores `maskClass`, so the line masks are styled through
  `.tb-title > div` in `index.css` (padding with matching negative margin so descenders
  and italic overhang are not clipped).

## Pin lengths

In `Home.jsx` the Toolbox is `{ revealVh: 30 }` (Shelf -> Workshop pin, 30vh) and
Reading Corner is `{ startOffsetVh: 20, revealVh: 30, mode: 'scale' }` (Workshop -> Reading
Corner pin, 50vh in total). They used to be 100vh and 100 + 70 dwell = 170vh. Pin length =
`startOffsetVh + revealVh + dwellVh` (see `PROJECT_GUIDE.md` section 8).

Known, pre-existing: the curtain stage of each transition sits one viewport below the pinned
section (the pin spacer pushes it down), so it never actually overlaps during the pin; the
pinned length is a hold. That is why the pins are short. Making the curtain truly overlap
would visibly change the Shelf and Reading Corner transitions, so it was left alone.
