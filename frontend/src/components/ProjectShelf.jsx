import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import BookPreview, { initialBookRequest } from './bookpreview/BookPreview.jsx';
import CursorBadge from './CursorBadge.jsx';
import { metricOf, pileFor, selectShelfBooks, spineTheme, stampFor } from '../data/shelfBooks.js';
import { buildBookPreviews, preloadBookImage } from '../data/bookPreview.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Desktop (>= 1024px): pin the stack and build it book by book while scrubbing.
// OFF by default: the pin adds ~220vh of height inside the section that the
// Shelf -> Toolbox curtain pins, which delays/misaligns everything after it.
// false -> desktop uses the same unpinned batch reveal as mobile.
const PIN_SHELF = false;

const pad = (n) => String(n).padStart(2, '0');

/**
 * Cream shelf section: a flat stack of "book spines", one row per published
 * project, in `sort_order`. Everything shown (rows, VOL numbers, counters, tag
 * list) is computed from the published list, so it stays correct at 1, 2 or 12 books.
 *
 * Transform ownership: GSAP owns the outer <li class="bk-wrap"> (entrance, scroll
 * states); the inner <button> owns hover / focus / is-active / press via CSS
 * transitions only. They never share an element.
 */
export default function ProjectShelf({ projects }) {
  // The open book: { slug, el } (el = the clicked spine; null when opened from a ?book= link)
  const [open, setOpen] = useState(initialBookRequest);
  const [hovering, setHovering] = useState(false);
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const stackRef = useRef(null);
  const listRef = useRef(null);
  const plankRef = useRef(null);

  const books = useMemo(() => selectShelfBooks(projects), [projects]);
  const previews = useMemo(() => buildBookPreviews(books), [books]);
  // SUBJECTS = distinct tags, in order of first appearance on the shelf
  const subjects = useMemo(() => [...new Set(books.map(stampFor))], [books]);

  // Scroll + entrance motion. Everything is created inside one gsap.context and
  // reverted on cleanup (HMR / unmount / data change), so ScrollTriggers never
  // pile up. Nothing here runs under prefers-reduced-motion: the CSS rest state
  // is the final state, so books, header and counters are simply shown.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const list = listRef.current;
    if (!section || !list || !books.length) return undefined;
    let dead = false;
    const MOTION = '(prefers-reduced-motion: no-preference)';
    const TITLE_DELAY = 0.2; // eyebrow goes first, title follows

    let mm;
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia();

      // A. Header: eyebrow, split title, paragraph, counters. One trigger, 80% down.
      mm.add(MOTION, () => {
        const hdr = headerRef.current;
        const eyebrow = hdr.querySelector('[data-hdr="eyebrow"]');
        const title = hdr.querySelector('[data-hdr="title"]');
        const para = hdr.querySelector('[data-hdr="para"]');
        const counters = [...hdr.querySelectorAll('[data-count]')];

        let entered = false;
        let charTween = null;
        const intro = [
          gsap.from(eyebrow, { y: 12, opacity: 0, duration: 0.6, ease: 'power3.out', paused: true }),
          gsap.from(para, {
            y: 16,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            delay: TITLE_DELAY + 0.25,
            paused: true,
          }),
        ];

        // Count up by writing the number into the text node React rendered.
        const restore = counters.map((el) => {
          const node = el.firstChild;
          const target = Number(el.dataset.count);
          const o = { v: 0 };
          node.textContent = pad(0);
          intro.push(
            gsap.to(o, {
              v: target,
              duration: 1.2,
              ease: 'power2.out',
              delay: TITLE_DELAY,
              paused: true,
              onUpdate: () => {
                node.textContent = pad(Math.round(o.v));
              },
            })
          );
          return () => {
            node.textContent = pad(target);
          };
        });

        // autoSplit re-splits once webfonts load, so line breaks stay correct.
        const split = SplitText.create(title, {
          type: 'lines,chars',
          mask: 'lines',
          maskClass: 'shelf-title-mask',
          autoSplit: true,
          onSplit(self) {
            charTween = gsap.from(self.chars, {
              yPercent: 110,
              duration: 0.9,
              stagger: 0.03,
              ease: 'power4.out',
              delay: TITLE_DELAY,
              paused: !entered,
            });
            return charTween;
          },
        });

        ScrollTrigger.create({
          trigger: hdr,
          start: 'top 80%',
          end: 'max', // also plays if the page loads already scrolled past it
          once: true,
          onEnter: () => {
            entered = true;
            intro.forEach((t) => t.play());
            charTween?.play();
          },
        });

        return () => {
          split.revert();
          restore.forEach((fn) => fn());
        };
      });

      // B / C / D. Stack build (pinned, desktop), batch reveal (everything else),
      // and the "reading head" is-active state.
      mm.add({ motion: MOTION, wide: '(min-width: 1024px)' }, (c) => {
        const { motion, wide } = c.conditions;
        if (!motion) return undefined;

        const stack = stackRef.current;
        const plank = plankRef.current;
        const wraps = [...list.querySelectorAll('.bk-wrap')];
        const btns = wraps.map((w) => w.querySelector('.shelf-book'));
        // Resting tilt: read it once, animate TO it, never zero it out.
        const tilts = wraps.map((w) => {
          if (w.dataset.tilt === undefined) w.dataset.tilt = String(gsap.getProperty(w, 'rotation') || 0);
          return parseFloat(w.dataset.tilt) || 0;
        });

        // Only one book is ever the reading head.
        let current = null;
        const setCurrent = (btn) => {
          if (btn === current) return;
          current?.classList.remove('is-active');
          btn?.classList.add('is-active');
          current = btn;
        };

        if (wide && PIN_SHELF) {
          const STEP = 0.35; // each book starts before the previous one lands
          const DUR = 1;
          const vh = () => window.innerHeight;
          // 15% from the top, or higher if the stack would not fit on screen
          const pinTop = () =>
            Math.round(Math.max(16, Math.min(vh() * 0.15, vh() - stack.offsetHeight - 16)));

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: stack,
              start: () => `top ${pinTop()}px`,
              end: () => `+=${Math.round(vh() * 2.2)}`, // 220% of the viewport height
              pin: true,
              pinSpacing: true,
              scrub: 0.6,
              anticipatePin: 1,
              refreshPriority: 1, // measured before the Shelf -> Toolbox curtain pin
            },
          });
          const pinST = tl.scrollTrigger;

          wraps.forEach((w, i) => {
            tl.fromTo(
              w,
              {
                yPercent: -120,
                x: i % 2 === 0 ? -60 : 60, // books 01, 03, ... from the left
                autoAlpha: 0,
                rotation: tilts[i] + gsap.utils.random(-4, 4),
              },
              { yPercent: 0, x: 0, autoAlpha: 1, rotation: tilts[i], ease: 'power3.out', duration: DUR },
              i * STEP
            );
          });
          tl.fromTo(
            plank,
            { scaleX: 0, transformOrigin: '0% 50%' },
            { scaleX: 1, ease: 'power2.out', duration: 1.2 },
            0
          );

          // While pinned the active book is the one that just landed; once the pin
          // releases it is whichever book crosses the middle band, like on mobile.
          const refreshActive = () => {
            const p = pinST.progress;
            if (p <= 0) return setCurrent(null);
            if (p < 1) {
              const idx = Math.floor((tl.time() - DUR) / STEP + 1e-6);
              return setCurrent(idx >= 0 ? btns[Math.min(idx, btns.length - 1)] : null);
            }
            const lo = vh() * 0.45;
            const hi = vh() * 0.55;
            let best = null;
            let bestD = Infinity;
            btns.forEach((b) => {
              const r = b.getBoundingClientRect();
              if (r.top > hi || r.bottom < lo) return;
              const d = Math.abs((r.top + r.bottom) / 2 - vh() / 2);
              if (d < bestD) {
                bestD = d;
                best = b;
              }
            });
            return setCurrent(best);
          };
          tl.eventCallback('onUpdate', refreshActive); // scrub catch-up after scrolling stops
          ScrollTrigger.create({
            trigger: section,
            start: 'top bottom',
            end: 'bottom bottom',
            refreshPriority: 1,
            onUpdate: refreshActive,
            onLeave: refreshActive,
            onLeaveBack: () => setCurrent(null),
          });
        } else {
          // C. No pin: batches drop in as they enter, tilt untouched.
          gsap.set(wraps, { y: 40, autoAlpha: 0 });
          ScrollTrigger.batch(wraps, {
            start: 'top 92%',
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.7, ease: 'power3.out' }),
          });
          gsap.set(plank, { scaleX: 0, transformOrigin: '0% 50%' });
          ScrollTrigger.create({
            trigger: plank,
            start: 'top 92%',
            once: true,
            onEnter: () => gsap.to(plank, { scaleX: 1, duration: 0.8, ease: 'power3.out' }),
          });

          // D. Reading head: the book crossing the middle band.
          const live = new Set();
          wraps.forEach((w, i) => {
            ScrollTrigger.create({
              trigger: w,
              start: 'top 55%',
              end: 'bottom 45%',
              onToggle: (self) => {
                if (self.isActive) live.add(btns[i]);
                else live.delete(btns[i]);
                setCurrent([...live].pop() ?? null);
              },
            });
          });
        }

        return () => btns.forEach((b) => b?.classList.remove('is-active'));
      });
    }, section);

    // Re-measure everything (including the Shelf -> Toolbox -> Reading Corner pins)
    // once fonts are in and after every rebuild of this section's triggers.
    document.fonts.ready.then(() => {
      if (!dead) ScrollTrigger.refresh();
    });
    const raf = requestAnimationFrame(() => {
      if (!dead) ScrollTrigger.refresh();
    });

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      // matchMedia keeps its own contexts: revert it explicitly, otherwise the
      // old timelines / pins survive a rebuild (HMR, data load) and stack up.
      mm?.revert();
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [books]);

  // Neighbour response: books beside the hovered/focused one shift a few px.
  // Set on the inner buttons through a CSS custom property (CSS owns the transform).
  const nudge = (i) => {
    const btns = listRef.current?.querySelectorAll('.shelf-book');
    btns?.forEach((b, j) => {
      const d = i === null ? 99 : Math.abs(j - i);
      if (d === 1) b.style.setProperty('--nudge', '6px');
      else if (d === 2) b.style.setProperty('--nudge', '2px');
      else b.style.removeProperty('--nudge');
    });
  };

  // The popup (BookPreview) plays the pull-out, fly and open itself, starting from this spine.
  const openBook = (p, btn) => {
    setHovering(false);
    nudge(null);
    setOpen({ slug: p.slug, el: btn });
  };

  return (
    <section
      id="shelf"
      ref={sectionRef}
      className="dot-grid relative flex flex-col justify-center bg-paper md:min-h-[100dvh]"
    >
      <CursorBadge active={hovering} className="h-16 w-16 bg-mustard text-sm text-ink">
        Click
      </CursorBadge>

      <div className="relative px-9 pb-40 pt-20 text-ink md:px-16 md:pb-24 md:pt-24">
        <header
          ref={headerRef}
          className="mb-8 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-8"
        >
          <div>
            <p
              data-hdr="eyebrow"
              className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-brick md:text-xs"
            >
              01 &mdash; The Shelf
            </p>
            <h2 data-hdr="title" className="mt-3 font-display text-[46px] font-bold leading-[1.02] tracking-tight md:text-7xl">
              Project <em className="italic text-brick">Shelf</em>
            </h2>
            <p data-hdr="para" className="mt-4 max-w-md font-grotesk text-[15px] leading-relaxed text-ink/65 md:mt-5 md:text-base">
              Every project on this shelf represents a challenge, an idea, and the journey of turning code into
              real-world solutions.
            </p>
          </div>

          <div className="flex items-center gap-8 border-y border-ink/15 py-3 md:gap-12 md:border-0 md:py-0">
            <span className="sr-only">
              {books.length} volumes &middot; {subjects.length} subjects
            </span>
            {[
              ['Volumes', books.length],
              ['Subjects', subjects.length],
            ].map(([label, n]) => (
              <div key={label} aria-hidden className="flex items-baseline gap-2.5 md:block">
                <span data-count={n} className="block font-display text-[28px] font-medium leading-none md:text-7xl">
                  {pad(n)}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55 md:mt-2 md:text-[11px] md:tracking-[0.25em]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </header>

        {/* pinned as one unit on desktop: the books and the plank they sit on */}
        <div ref={stackRef} className="relative">
        {books.length > 0 ? (
          <ul ref={listRef} className="flex flex-col gap-[5px]">
            {books.map((p, i) => {
              const { width, offset, height } = pileFor(i);
              const spine = p.spineColor || '#2B2724';
              const { text, foil } = spineTheme(spine);
              const metric = metricOf(p);
              return (
                <li
                  key={p.id}
                  className="shelf-row-item bk-wrap md:w-[var(--w)] md:ml-[var(--ml)]"
                  style={{ '--w': width, '--ml': offset }}
                >
                  <button
                    type="button"
                    className="shelf-book grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 py-4 pl-9 pr-9 md:flex md:h-[var(--h)] md:gap-6 md:py-0 md:pl-10 md:pr-10"
                    style={{ '--spine': spine, '--foil': foil, '--h': height, color: text }}
                    aria-label={`Open ${p.title}`}
                    data-book={p.slug}
                    onPointerDown={() => preloadBookImage(previews[i])}
                    onMouseEnter={() => {
                      setHovering(true);
                      nudge(i);
                      preloadBookImage(previews[i]);
                    }}
                    onMouseLeave={() => {
                      setHovering(false);
                      nudge(null);
                    }}
                    onFocus={(e) => {
                      preloadBookImage(previews[i]);
                      if (e.currentTarget.matches(':focus-visible')) nudge(i);
                    }}
                    onBlur={() => nudge(null)}
                    onClick={(e) => openBook(p, e.currentTarget)}
                  >
                    <span className="col-start-1 row-start-1 shrink-0 font-mono text-[11px] font-medium tracking-[0.12em] opacity-80 md:w-14 md:text-xs">
                      VOL.{pad(i + 1)}
                    </span>

                    {/* phone: VOL + stamp on the top line, title + metric stacked below;
                        md+: flattened into one row (VOL, title, metric, stamp, OPEN) */}
                    <span className="col-span-2 row-start-2 flex min-w-0 flex-col gap-1.5 md:contents">
                      <span className="line-clamp-2 font-display text-[22px] font-semibold leading-tight tracking-tight md:min-w-0 md:flex-1 lg:text-[25px]">
                        {p.title}
                      </span>
                      {metric && (
                        <span className="font-mono text-[11.5px] leading-snug opacity-80 md:max-w-[17rem] md:shrink-0 md:text-right md:text-xs">
                          {metric}
                        </span>
                      )}
                    </span>

                    <span
                      className="col-start-2 row-start-1 shrink-0 justify-self-end rounded-[3px] border px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.18em] md:text-[11px]"
                      style={{ color: foil, borderColor: foil }}
                    >
                      {stampFor(p)}
                    </span>

                    <span
                      aria-hidden
                      className="shelf-open absolute bottom-[5px] right-9 shrink-0 font-mono text-[10px] font-medium tracking-[0.18em] md:static md:block md:w-16 md:text-[11px]"
                      style={{ color: foil }}
                    >
                      OPEN &rarr;
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          // Nothing published yet (or still loading): keep the shelf looking intentional
          <div className="flex h-[76px] items-center justify-center rounded-[5px] border border-dashed border-ink/25 font-mono text-xs uppercase tracking-[0.2em] text-ink/45">
            The first volume is being bound
          </div>
        )}

        {/* wooden plank + darker lower edge + cast shadow */}
        <div ref={plankRef} aria-hidden className="relative mt-[3px]">
          <div className="h-4 md:h-5 rounded-[3px] border-t border-white/30 bg-gradient-to-b from-tan to-wood shadow-[0_18px_24px_-10px_rgba(23,23,23,0.45)]" />
          <div className="mx-[0.6%] h-2 rounded-b-[3px] bg-bark md:h-[7px]" />
        </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <p className="font-grotesk text-sm text-ink/60">
            <span className="md:hidden">Tap any book to read its chapter.</span>
            <span className="hidden md:inline">Pull any book off the shelf to read its chapter.</span>
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 md:text-right md:text-xs">
            {subjects.join(' · ')}
          </p>
        </div>
      </div>

      <BookPreview previews={previews} request={open} onClose={() => setOpen(null)} />
    </section>
  );
}
