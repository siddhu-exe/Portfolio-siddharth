import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// The book-cover page transition holds the screen for ~1s after the route swaps;
// start the hero a beat before it opens.
const HERO_DELAY = 0.55;

// "1,234" / "3.40" / "22.7%" -> { prefix, num, decimals, comma, suffix } (null if no number)
function parseNumeric(text) {
  const m = text.trim().match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const raw = m[2];
  return {
    prefix: m[1],
    num: parseFloat(raw.replace(/,/g, '')),
    decimals: raw.includes('.') ? raw.split('.')[1].length : 0,
    comma: raw.includes(','),
    suffix: m[3],
  };
}
const format = (n, p) =>
  `${p.prefix}${n.toLocaleString('en-US', {
    minimumFractionDigits: p.decimals,
    maximumFractionDigits: p.decimals,
    useGrouping: p.comma,
  })}${p.suffix}`;

/**
 * One motion recipe for every project page, driven by data attributes:
 *   [data-hero-title]  SplitText chars rise through a line mask
 *   [data-hero]        hero blocks fade up together after the title
 *   [data-reveal]      fade up 24px once at "top 85%"
 *   [data-flow]        its [data-flow-node] children appear in order (stagger 0.08)
 *   [data-countup]     number counts up once (final text is what the DOM holds)
 * GSAP only ever touches these outer wrappers; hover states live on inner elements.
 * Uses the existing Lenis<->ScrollTrigger sync (SmoothScroll) — no second ticker.
 */
export default function useProjectMotion(rootRef, variant) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cleanups = [];

        const title = root.querySelector('[data-hero-title]');
        if (title) {
          const split = SplitText.create(title, {
            type: 'lines,chars',
            mask: 'lines',
            maskClass: 'pp-title-mask',
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.chars, {
                yPercent: 140,
                duration: 0.9,
                stagger: 0.03,
                ease: 'power4.out',
                delay: HERO_DELAY,
                // end exactly at rest: no leftover transform pushing the name down
                onComplete: () => gsap.set(self.chars, { clearProps: 'transform' }),
              });
            },
          });
          cleanups.push(() => split.revert());
        }

        const hero = gsap.utils.toArray('[data-hero]', root);
        if (hero.length) {
          gsap.from(hero, { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: HERO_DELAY + 0.1 });
        }

        gsap.utils.toArray('[data-reveal]', root).forEach((el) => {
          gsap.from(el, {
            y: 24,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          });
        });

        gsap.utils.toArray('[data-flow]', root).forEach((flow) => {
          const nodes = flow.querySelectorAll('[data-flow-node]');
          if (!nodes.length) return;
          gsap.from(nodes, {
            ...(variant === 'laptop' ? { x: -24 } : { y: 24 }),
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: flow, start: 'top 85%', once: true },
          });
        });

        gsap.utils.toArray('[data-countup]', root).forEach((el) => {
          const finalText = el.textContent;
          const parsed = parseNumeric(finalText);
          if (!parsed) return;
          const state = { v: 0 };
          el.textContent = format(0, parsed);
          ScrollTrigger.create({
            trigger: el,
            start: 'top 90%',
            once: true,
            onEnter: () =>
              gsap.to(state, {
                v: parsed.num,
                duration: 1.4,
                ease: 'power2.out',
                onUpdate: () => {
                  el.textContent = format(state.v, parsed);
                },
                onComplete: () => {
                  el.textContent = finalText;
                },
              }),
          });
          cleanups.push(() => {
            el.textContent = finalText;
          });
        });

        return () => cleanups.forEach((fn) => fn());
      });
    }, root);

    // Layout shifts: fonts, then (below) late images, then the route-change settle.
    let t;
    const refresh = () => {
      clearTimeout(t);
      t = setTimeout(() => ScrollTrigger.refresh(), 120);
    };
    document.fonts?.ready.then(refresh);
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    root.addEventListener('load', refresh, true); // <img> load doesn't bubble; capture it

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      root.removeEventListener('load', refresh, true);
      ctx.revert();
    };
  }, [rootRef, variant]);
}
