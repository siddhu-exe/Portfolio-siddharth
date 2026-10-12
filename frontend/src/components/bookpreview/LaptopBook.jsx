import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import { ArrowIcon, Chevron, CloseIcon, Cover, Figure, Stats, linkList, stackLine } from './parts.jsx';
import { onScreen } from './shelfSlots.js';

const pad2 = (n) => String(n).padStart(2, '0');
const CLIP_RIGHT = 'inset(-120px -40px -120px 50%)'; // closed book: only the right half exists
const CLIP_FULL = 'inset(-120px -40px -120px -40px)';
const FOCUSABLE_TITLE = { preventScroll: true };

/** Book scale + vertical centre for the current viewport (the book is always 1120 x 640 at scale 1). */
function useFit() {
  const calc = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const s = Math.max(0.5, Math.min(1, (h - 170) / 640, (w - 72) / 1120));
    return { s, cy: Math.max(h / 2 - 14, 96 + 320 * s) };
  };
  const [fit, setFit] = useState(calc);
  useEffect(() => {
    const on = () => setFit(calc());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return fit;
}

/** Static copy of a page for the turning leaf: no ids, not focusable, not announced. */
function clonePage(el) {
  const c = el.cloneNode(true);
  c.removeAttribute('id');
  c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  c.querySelectorAll('a,button,[tabindex]').forEach((n) => n.setAttribute('tabindex', '-1'));
  return c;
}

const LeftPage = forwardRef(function LeftPage({ p }, ref) {
  return (
    <div className="bp-page bp-left" ref={ref} style={{ '--spine': p.spineColor }}>
      <div className="bp-ribbon" aria-hidden="true" />
      <div className="bp-volrow">
        <span className="lbl">
          Vol.{p.volumeLabel} / {pad2(p.total)}
        </span>
      </div>
      <figure className="bp-fig" data-bp="L">
        <Figure p={p} />
        {p.caption && (
          <figcaption className="bp-fig-cap mono">
            FIG. {p.volumeLabel} — {p.caption}
          </figcaption>
        )}
      </figure>
      {p.stats.length > 0 && (
        <div data-bp="L">
          <Stats stats={p.stats.slice(0, 3)} />
        </div>
      )}
      <div className="bp-folio mono">— 1 —</div>
    </div>
  );
});

const RightPage = forwardRef(function RightPage({ p, prevP, nextP, titleRef, onRead, onTurn }, ref) {
  const links = linkList(p);
  const stack = stackLine(p);
  const meta = [p.category, p.year].filter(Boolean).join(' · ');
  return (
    <div className="bp-page bp-right" ref={ref} style={{ '--spine': p.spineColor }}>
      <div className="bp-tagrow" data-bp="R">
        {p.tag && (
          <span className="bp-pill" style={{ background: p.spineColor, color: p.theme.text }}>
            {p.tag}
          </span>
        )}
        {meta && <span className="lbl bp-cat">{meta}</span>}
      </div>

      <h2 id="bp-title" ref={titleRef} tabIndex={-1} className="bp-title" data-bp="R" style={{ fontSize: p.titleSize }}>
        {p.title}
      </h2>
      {p.tagline && (
        <p className="bp-tagline" data-bp="R">
          {p.tagline}
        </p>
      )}
      {p.summary && (
        <p className="bp-summary" data-bp="R">
          {p.summary}
        </p>
      )}
      {stack && (
        <div className="bp-built" data-bp="R">
          <div className="lbl">Built with</div>
          <div className="bp-built-l mono">{stack}</div>
        </div>
      )}

      <div className="bp-spacer" />

      <div data-bp="R">
        <a
          className="bp-read"
          href={`/projects/${p.slug}`}
          onClick={(e) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            onRead(p);
          }}
        >
          Read the full chapter
          <span className="bp-read-go">
            <ArrowIcon />
          </span>
        </a>
        {links.length > 0 && (
          <div className="bp-links">
            {links.map((l) => (
              <a key={l.key} className="bp-link" href={l.href} target="_blank" rel="noreferrer noopener">
                {l.dot && <span className="bp-link-dot" aria-hidden="true" />}
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="bp-nav" data-bp="R">
        {prevP ? (
          <button type="button" className="bp-nav-b bp-nav-prev" onClick={() => onTurn(-1)}>
            <Chevron dir="left" />
            <span>{prevP.title}</span>
          </button>
        ) : (
          <span />
        )}
        <span className="mono bp-folio-r">— 2 —</span>
        {nextP ? (
          <button type="button" className="bp-nav-b bp-nav-next" onClick={() => onTurn(1)}>
            <span>{nextP.title}</span>
            <Chevron dir="right" />
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
});

/**
 * Open-book spread (>= 1024px). GSAP owns every moving part: the flying cover, the cover flip,
 * the page-turn leaf and the content stagger. `apiRef.current` = { close(), turn(dir) }.
 *
 *   open  0 - .25 pull (CSS `.is-pulling` on the spine) + overlay in
 *       .25 - .6  a spine-coloured element flies from the spine's rect to the right half of the book
 *       .6  - 1.0 the cover flips rotateY 0 -> -180 around the gutter; its back face is the left page
 *       .9  - 1.2 pages' content fades up in a stagger, ESC pill + hint fade in
 *   close reverses it (about .8s); the cover flies back to the spine and the spine slides home.
 *   turn  a leaf (copy of the right page) flips 0 -> -180 in .5s; halfway the data swaps.
 */
export default function LaptopBook({
  previews,
  index,
  setIndex,
  origin,
  intro, // 'fly' | 'fade' | 'reduced'
  slots,
  spineOf,
  apiRef,
  onRequestClose,
  onRead,
  onClosed,
}) {
  const n = previews.length;
  const p = previews[index];
  const prevP = n > 1 ? previews[(index - 1 + n) % n] : null;
  const nextP = n > 1 ? previews[(index + 1) % n] : null;
  const fit = useFit();

  const rootRef = useRef(null);
  const overlayRef = useRef(null);
  const escRef = useRef(null);
  const hintRef = useRef(null);
  const fitRef = useRef(null);
  const baseRef = useRef(null);
  const slotRef = useRef(null);
  const rightWrapRef = useRef(null);
  const rightRef = useRef(null);
  const shadeRef = useRef(null);
  const coverRef = useRef(null);
  const backRef = useRef(null);
  const leftRef = useRef(null);
  const leafRef = useRef(null);
  const leafFrontRef = useRef(null);
  const leafBackRef = useRef(null);
  const gutterRef = useRef(null);
  const flyRef = useRef(null);
  const flyInRef = useRef(null);
  const titleRef = useRef(null);

  const phase = useRef('init'); // init | opening | open | turning | closing
  const tlRef = useRef(null);
  const live = useRef({});
  live.current = { previews, index, setIndex, slots, spineOf, onClosed, intro, origin };

  useLayoutEffect(() => {
    const q = (el, sel) => [...el.querySelectorAll(sel)];
    const leftItems = () => q(backRef.current, '[data-bp]');
    const rightItems = () => q(rightWrapRef.current, '[data-bp]');
    const slotRect = () => slotRef.current.getBoundingClientRect();
    const focusTitle = () => titleRef.current?.focus(FOCUSABLE_TITLE);
    const reduced = live.current.intro === 'reduced';

    leafRef.current.setAttribute('inert', '');

    // ---- states -------------------------------------------------------------------------
    const hide = (...els) => gsap.set(els, { visibility: 'hidden' });
    const show = (...els) => gsap.set(els, { visibility: 'visible' });

    const setClosedState = () => {
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set([escRef.current, hintRef.current, gutterRef.current, shadeRef.current], { opacity: 0 });
      gsap.set(baseRef.current, { clipPath: CLIP_RIGHT });
      gsap.set(coverRef.current, { rotateY: 0 });
      gsap.set([...leftItems(), ...rightItems()], { opacity: 0, y: 12 });
      hide(baseRef.current, rightWrapRef.current, coverRef.current, flyRef.current, leafRef.current);
    };

    const setOpenState = () => {
      gsap.set(baseRef.current, { clipPath: CLIP_FULL });
      gsap.set(coverRef.current, { rotateY: -180 });
      gsap.set(gutterRef.current, { opacity: 1 });
      gsap.set(shadeRef.current, { opacity: 0 });
      gsap.set([...leftItems(), ...rightItems()], { opacity: 1, y: 0 });
      show(baseRef.current, rightWrapRef.current, coverRef.current);
      hide(flyRef.current, leafRef.current);
    };

    const settle = () => {
      phase.current = 'open';
      focusTitle();
    };

    // ---- open ---------------------------------------------------------------------------
    const openFly = () => {
      phase.current = 'opening';
      const btn = live.current.origin;
      live.current.slots.pull(btn); // 0 - .25: the spine slides out (CSS .is-pulling, translateX 40px)

      setClosedState();
      // SmoothScroll turns GSAP lag smoothing off globally, so a long first frame (mounting the
      // book, decoding the screenshot) would make the timeline skip straight past the start.
      // Smooth lag for the length of the open, and only start once the mount has painted.
      gsap.ticker.lagSmoothing(200, 33);
      const restoreLag = () => gsap.ticker.lagSmoothing(0);
      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          restoreLag();
          if (phase.current === 'opening') settle();
        },
        onInterrupt: restoreLag,
      });
      tlRef.current = tl;
      requestAnimationFrame(() => requestAnimationFrame(() => tlRef.current === tl && tl.play(0)));

      tl.to(overlayRef.current, { opacity: 1, duration: 0.25, ease: 'power1.out' }, 0);

      // .25 - .6: fly. Measure the pulled spine now, hide it, and start the flyer exactly on it.
      tl.add(() => {
        const r = btn.getBoundingClientRect();
        live.current.slots.hold(btn);
        gsap.set(flyRef.current, { visibility: 'visible', x: r.left, y: r.top, width: r.width, height: r.height, borderRadius: 5 });
        gsap.set(flyInRef.current, { opacity: 0 });
      }, 0.25);
      tl.to(
        flyRef.current,
        {
          x: () => slotRect().left,
          y: () => slotRect().top,
          width: () => slotRect().width,
          height: () => slotRect().height,
          borderRadius: 8,
          duration: 0.35,
          ease: 'power3.inOut',
        },
        0.25
      );
      tl.to(flyInRef.current, { opacity: 1, duration: 0.15, ease: 'none' }, 0.45);

      // .6: the flyer becomes the closed front cover
      tl.add(() => {
        show(baseRef.current, rightWrapRef.current, coverRef.current);
        hide(flyRef.current);
      }, 0.6);

      // .6 - 1.0: the cover opens like a book (left page = its back face)
      tl.to(coverRef.current, { rotateY: -180, duration: 0.4, ease: 'power2.inOut' }, 0.6);
      tl.to(gutterRef.current, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0.7);
      tl.to(baseRef.current, { clipPath: CLIP_FULL, duration: 0.3, ease: 'power1.inOut' }, 0.7);
      tl.fromTo(shadeRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.in' }, 0.6);
      tl.to(shadeRef.current, { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0.8);

      // .9 - 1.2: settle
      tl.add(focusTitle, 0.9);
      tl.to(leftItems(), { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }, 0.9);
      tl.to(rightItems(), { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }, 0.9);
      tl.to([escRef.current, hintRef.current], { opacity: 1, duration: 0.25, ease: 'power1.out' }, 1.0);
    };

    // No spine to fly from (deep link, resized across the breakpoint) or reduced motion:
    // no fly, no 3D. The overlay and the book just fade.
    const openFade = () => {
      phase.current = 'opening';
      const d = reduced ? 0.2 : 0.3;
      setOpenState();
      gsap.set(fitRef.current, { opacity: 0 });
      gsap.set([escRef.current, hintRef.current], { opacity: 0 });
      gsap.set(overlayRef.current, { opacity: 0 });
      if (!reduced) {
        const btn = live.current.spineOf(live.current.previews[live.current.index].slug);
        live.current.slots.hold(btn, { instant: true });
      }
      const tl = gsap.timeline({ onComplete: settle });
      tlRef.current = tl;
      tl.to(overlayRef.current, { opacity: 1, duration: d }, 0)
        .to(fitRef.current, { opacity: 1, duration: d }, 0)
        .to([escRef.current, hintRef.current], { opacity: 1, duration: d }, 0);
      tl.add(focusTitle, 0.05);
    };

    // ---- close --------------------------------------------------------------------------
    const finish = () => {
      phase.current = 'closed';
      live.current.onClosed();
    };

    const close = () => {
      if (phase.current === 'closing' || phase.current === 'closed') return;
      const wasPhase = phase.current;
      const openProgress = tlRef.current?.time() ?? 0;
      if (phase.current === 'turning') tlRef.current?.progress(1); // finish the page turn first
      else tlRef.current?.kill();
      gsap.ticker.lagSmoothing(0);
      phase.current = 'closing';

      const L = live.current;
      const slug = L.previews[L.index].slug;
      const btn = L.spineOf(slug);
      const spineRect = btn ? btn.getBoundingClientRect() : null;

      // Fade-out path: reduced motion, no spine on screen, or the fly never finished.
      const flyable = !reduced && spineRect && onScreen(spineRect) && !(wasPhase === 'opening' && openProgress < 0.6);
      if (!flyable) {
        const d = reduced ? 0.2 : 0.25;
        gsap
          .timeline({ onComplete: () => (L.slots.release(btn, { slide: !reduced }), finish()) })
          .to([overlayRef.current, fitRef.current, flyRef.current, escRef.current, hintRef.current], { opacity: 0, duration: d, ease: 'power1.in' }, 0);
        return;
      }

      const tl = gsap.timeline({ onComplete: finish });
      tlRef.current = tl;
      const all = [...leftItems(), ...rightItems()];
      const cover = coverRef.current;

      tl.to(all, { opacity: 0, y: 6, duration: 0.18, stagger: 0.01, ease: 'power1.in' }, 0);
      tl.to([escRef.current, hintRef.current], { opacity: 0, duration: 0.15 }, 0);
      tl.to(cover, { rotateY: 0, duration: 0.35, ease: 'power2.inOut' }, 0.1);
      tl.fromTo(shadeRef.current, { opacity: 0 }, { opacity: 1, duration: 0.17, ease: 'power1.in' }, 0.1);
      tl.to(shadeRef.current, { opacity: 0, duration: 0.18, ease: 'power1.out' }, 0.27);
      tl.to(gutterRef.current, { opacity: 0, duration: 0.2 }, 0.2);
      tl.to(baseRef.current, { clipPath: CLIP_RIGHT, duration: 0.25, ease: 'power1.inOut' }, 0.2);

      // .45: the closed cover hands over to the flyer, which carries it back to its slot
      tl.add(() => {
        const s = slotRect();
        hide(cover, rightWrapRef.current, baseRef.current, shadeRef.current, gutterRef.current);
        gsap.set(flyRef.current, { visibility: 'visible', x: s.left, y: s.top, width: s.width, height: s.height, borderRadius: 8 });
        gsap.set(flyInRef.current, { opacity: 1 });
      }, 0.45);
      tl.to(flyInRef.current, { opacity: 0, duration: 0.15, ease: 'none' }, 0.45);
      tl.to(
        flyRef.current,
        { x: spineRect.left, y: spineRect.top, width: spineRect.width, height: spineRect.height, borderRadius: 5, duration: 0.35, ease: 'power3.inOut' },
        0.45
      );
      tl.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power1.in' }, 0.5);
      // .8: the spine reappears and slides back into the stack
      tl.add(() => {
        L.slots.release(btn, { slide: true });
        hide(flyRef.current);
      }, 0.8);
      tl.to({}, { duration: 0.04 }, 0.8);
    };

    // ---- prev / next (page turn on the right page only) ----------------------------------
    const turn = (dir) => {
      const L = live.current;
      const total = L.previews.length;
      if (total < 2 || phase.current !== 'open') return;
      const target = (L.index + dir + total) % total;
      const swap = () => flushSync(() => L.setIndex(target));
      phase.current = 'turning';

      if (reduced) {
        const pages = [leftRef.current, rightRef.current];
        const tl = gsap.timeline({ onComplete: () => ((phase.current = 'open'), focusTitle()) });
        tlRef.current = tl;
        tl.to(pages, { opacity: 0, duration: 0.1 }).add(swap).to(pages, { opacity: 1, duration: 0.1 });
        return;
      }

      leafFrontRef.current.replaceChildren(clonePage(rightRef.current));
      gsap.set(leafRef.current, { visibility: 'visible', rotateY: 0 });
      const tl = gsap.timeline({
        onComplete: () => {
          hide(leafRef.current);
          leafFrontRef.current.replaceChildren();
          leafBackRef.current.replaceChildren();
          phase.current = 'open';
          focusTitle();
        },
      });
      tlRef.current = tl;
      tl.to(leafRef.current, { rotateY: -180, duration: 0.5, ease: 'power2.inOut' }, 0);
      tl.fromTo(shadeRef.current, { opacity: 0 }, { opacity: 0.8, duration: 0.25, ease: 'power1.in' }, 0);
      tl.to(shadeRef.current, { opacity: 0, duration: 0.25, ease: 'power1.out' }, 0.25);
      // halfway (the leaf is edge-on): swap the data, move the spine slot, give the leaf its back face
      tl.add(() => {
        const old = L.previews[L.index].slug;
        swap();
        L.slots.release(L.spineOf(old), { slide: true });
        L.slots.hold(L.spineOf(L.previews[target].slug), { instant: true });
        leafBackRef.current.replaceChildren(clonePage(leftRef.current));
      }, 0.25);
    };

    apiRef.current = { close, turn };

    if (live.current.intro === 'fly' && live.current.origin && !reduced) openFly();
    else openFade();

    return () => {
      tlRef.current?.kill();
      gsap.ticker.lagSmoothing(0);
      gsap.killTweensOf(
        [overlayRef.current, fitRef.current, flyRef.current, flyInRef.current, escRef.current, hintRef.current, baseRef.current, coverRef.current, shadeRef.current, gutterRef.current, leafRef.current]
      );
      apiRef.current = null;
      live.current.slots.reset();
    };
    // The view is mounted once per session; props are read through `live`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bp bp-laptop" data-bp-root ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="bp-title">
      <div className="bp-overlay" ref={overlayRef} onClick={onRequestClose} />

      <button type="button" className="bp-esc" ref={escRef} onClick={onRequestClose} aria-label="Close preview (Esc)">
        <span className="mono bp-esc-k">ESC</span>
        <span className="bp-esc-x">
          <CloseIcon />
        </span>
      </button>

      <div className="bp-fit" ref={fitRef} style={{ '--bp-s': fit.s, '--bp-cy': `${fit.cy}px` }}>
        <div className="bp-stage">
          {/* stacked page edges */}
          <div className="bp-base" ref={baseRef} aria-hidden="true">
            <div className="bp-edge bp-edge-1" />
            <div className="bp-edge bp-edge-2" />
          </div>
          <div className="bp-slot" ref={slotRef} aria-hidden="true" />

          <div className="bp-half bp-half-r" ref={rightWrapRef}>
            <RightPage
              ref={rightRef}
              p={p}
              prevP={prevP}
              nextP={nextP}
              titleRef={titleRef}
              onRead={onRead}
              onTurn={(d) => apiRef.current?.turn(d)}
            />
          </div>
          <div className="bp-shade" ref={shadeRef} aria-hidden="true" />

          {/* cover: front = closed book, back = the left page */}
          <div className="bp-half bp-half-r bp-flip" ref={coverRef}>
            <div className="bp-face bp-face-front" aria-hidden="true">
              <Cover p={p} variant="closed" />
            </div>
            <div className="bp-face bp-face-back" ref={backRef}>
              <LeftPage ref={leftRef} p={p} />
            </div>
          </div>

          {/* page-turn leaf for prev / next */}
          <div className="bp-half bp-half-r bp-flip bp-leaf" ref={leafRef} aria-hidden="true">
            <div className="bp-face bp-face-front" ref={leafFrontRef} />
            <div className="bp-face bp-face-back" ref={leafBackRef} />
          </div>

          <div className="bp-gutter" ref={gutterRef} aria-hidden="true" />
        </div>
      </div>

      <div className="bp-hint mono" ref={hintRef} aria-hidden="true">
        ← → TURN TO THE NEXT BOOK · ESC TO PUT IT BACK
      </div>

      {/* the flyer: spine-coloured block that carries the book between the shelf and its place on the table */}
      <div className="bp-fly" ref={flyRef} aria-hidden="true" style={{ '--fit': fit.s, '--spine': p.spineColor }}>
        <div className="bp-fly-in" ref={flyInRef}>
          <Cover p={p} variant="closed" />
        </div>
      </div>
    </div>
  );
}
