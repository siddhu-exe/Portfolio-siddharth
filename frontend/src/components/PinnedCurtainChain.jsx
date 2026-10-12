import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Chains N sections through N-1 curtain transitions, each section mounted
 * EXACTLY ONCE. This is the multi-section version of PinnedCurtain: passing
 * the same element to two separate <PinnedCurtain> instances (one as `curtain`,
 * one as `base`) would mount it twice, producing a duplicate section in the
 * DOM. Rendering a section twice here (once "for spacing", once "for display")
 * has the same problem — duplicate ids, duplicate image requests, duplicate
 * hover state — so each section is measured and rendered exactly once.
 *
 * Layout: every section after the first sits in a "stage" — a document-flow
 * box whose height is set explicitly (in px, via ResizeObserver measuring the
 * section's own natural height) rather than relying on the section's own
 * layout inside an `absolute` wrapper (which would be 0-height and collapse).
 * The section is rendered `absolute inset-0` inside that fixed-height stage,
 * so it can be slid with `yPercent` without affecting document flow height.
 * Crucially, each stage's height is independent, so the curtain motion never
 * compounds across sections (that compounding — via a shared `margin-top:
 * -100vh` applied at every step — is what previously collapsed later
 * sections' rendered height and made them appear to vanish).
 *
 * Motion: section i pins once its bottom hits the viewport; section i+1's
 * stage slides up from translateY(100%) to 0 over `revealVh` of scroll
 * (default 100), optionally holding first for `startOffsetVh` and dwelling
 * fully-covered for `dwellVh` before the pin releases. Pin length =
 * startOffsetVh + revealVh + dwellVh.
 *
 * Usage:
 *   <PinnedCurtainChain
 *     sections={[
 *       { node: <ProjectShelf/> },
 *       { node: <Toolbox/> },
 *       { node: <ReadingCorner/>, dwellVh: 70 },
 *     ]}
 *   />
 *
 * Below md every pin is skipped (touch-scroll pinning is jank-prone): sections
 * stack in normal flow with a light fade-in on each.
 */
export default function PinnedCurtainChain({ sections }) {
  const stageRefs = useRef([]); // per section: the pinned trigger / stage element
  const curtainRefs = useRef([]); // per section (index 0 unused): the sliding node
  const measureRefs = useRef([]); // per section: inner node used to measure natural height
  const [heights, setHeights] = useState(() => sections.map(() => null));

  stageRefs.current = sections.map((_, i) => stageRefs.current[i] || null);
  curtainRefs.current = sections.map((_, i) => curtainRefs.current[i] || null);
  measureRefs.current = sections.map((_, i) => measureRefs.current[i] || null);

  // Measure each section's natural height so its stage can be sized without
  // rendering the section a second time.
  useEffect(() => {
    const observers = measureRefs.current.map((el, i) => {
      if (!el) return null;
      const ro = new ResizeObserver(([entry]) => {
        const h = Math.ceil(entry.contentRect.height);
        setHeights((prev) => {
          if (prev[i] === h) return prev;
          const next = [...prev];
          next[i] = h;
          return next;
        });
      });
      ro.observe(el);
      return ro;
    });
    return () => observers.forEach((ro) => ro?.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.length]);

  useEffect(() => {
    // Don't wire up ScrollTrigger until every section has a measured height —
    // otherwise stages 1..n-1 are 0px tall and pins land at the wrong point.
    if (heights.some((h, i) => i > 0 && !h)) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      const triggers = [];

      for (let i = 0; i < sections.length - 1; i++) {
        const baseEl = stageRefs.current[i];
        const curtainEl = curtainRefs.current[i + 1];
        const dwellVh = sections[i + 1].dwellVh || 0;
        // Delay before the curtain starts rising, spent pinned on the base
        // section. Implemented INSIDE the timeline (not by moving the trigger
        // start) — delaying the pin start itself leaves the next stage's empty
        // band visible below the base section (a transparent gap) while the
        // curtain hasn't engaged yet.
        const startOffsetVh = sections[i + 1].startOffsetVh || 0;
        // mode 'scale' = scale-through: outgoing section recedes (scale down,
        // dim, blur) while the incoming one settles forward from oversized.
        const mode = sections[i + 1].mode || 'slide';

        gsap.set(curtainEl, { yPercent: 100 });

        // Scroll length (in viewport heights) of the curtain itself. Together
        // with startOffsetVh and dwellVh this is the whole pin length.
        const revealVh = sections[i + 1].revealVh ?? 100;
        const totalVh = startOffsetVh + revealVh + dwellVh;
        const delayFraction = startOffsetVh / totalVh;
        const revealFraction = revealVh / totalVh;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: baseEl,
            start: 'bottom bottom',
            end: `+=${totalVh}%`,
            pin: baseEl,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        if (delayFraction > 0) {
          // hold: pinned on the base section before the curtain engages
          tl.to(curtainEl, { yPercent: 100, duration: delayFraction }, 0);
        }
        tl.to(curtainEl, { yPercent: 0, ease: 'none', duration: revealFraction }, delayFraction);
        if (mode === 'scale') {
          // Animate the inner content nodes, never baseEl — it's pinned and
          // ScrollTrigger owns its transform. Only scale + opacity here: both
          // are compositor-only (cheap). A `filter: blur()` tween was removed
          // because animating blur re-rasterizes the whole subtree (15 icon
          // images) every scroll frame — that was the Toolbox lag.
          const outgoing = measureRefs.current[i];
          const incoming = measureRefs.current[i + 1];
          // Paint the stage black so the receding section shrinks into
          // darkness instead of exposing the transparent stage (and the
          // fixed yellow footer behind the page).
          gsap.set(baseEl, { backgroundColor: '#000' });
          if (outgoing) {
            gsap.set(outgoing, { willChange: 'transform, opacity' });
            tl.to(
              outgoing,
              {
                scale: 0.92,
                opacity: 0.4,
                ease: 'power1.inOut',
                duration: revealFraction,
              },
              delayFraction
            );
          }
          if (incoming) {
            gsap.set(incoming, { willChange: 'transform' });
            tl.fromTo(
              incoming,
              { scale: 1.06 },
              { scale: 1, ease: 'power2.out', duration: revealFraction },
              delayFraction
            );
          }
        }
        if (dwellVh > 0) {
          tl.to(
            curtainEl,
            { yPercent: 0, duration: 1 - delayFraction - revealFraction },
            delayFraction + revealFraction
          );
        }
        triggers.push(tl.scrollTrigger);
      }

      return () => {
        triggers.forEach((st) => st?.kill());
        curtainRefs.current.forEach((el) => el && gsap.set(el, { yPercent: 0 }));
        measureRefs.current.forEach(
          (el) => el && gsap.set(el, { clearProps: 'transform,opacity,filter,willChange' })
        );
      };
    });

    mm.add('(max-width: 767px)', () => {
      const anims = [];
      for (let i = 1; i < sections.length; i++) {
        const el = curtainRefs.current[i];
        gsap.set(el, { yPercent: 0 });
        anims.push(
          gsap.from(el, {
            opacity: 0,
            y: 40,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
          })
        );
      }
      return () => anims.forEach((a) => a.scrollTrigger?.kill());
    });

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);

    return () => {
      window.removeEventListener('load', onLoad);
      mm.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.length, heights]);

  return (
    <div className="relative">
      {sections.map((s, i) =>
        i === 0 ? (
          // First section: plain document flow, measured for the next stage's
          // pin trigger and to know when to reveal section 1's curtain.
          <div
            key={i}
            ref={(el) => (stageRefs.current[i] = el)}
            className="relative overflow-hidden"
            style={{ zIndex: 30 }}
          >
            <div ref={(el) => (measureRefs.current[i] = el)}>{s.node}</div>
          </div>
        ) : (
          // Every later section is a fixed-height stage (measured, not a
          // second copy) holding the section absolutely, slid up over the
          // previous stage on reveal. Falls back to 100vh until measured so
          // there's no layout collapse before the ResizeObserver reports in.
          <div
            key={i}
            ref={(el) => (stageRefs.current[i] = el)}
            className="relative overflow-hidden"
            style={{ zIndex: 30 + i, height: heights[i] ? `${heights[i]}px` : '100vh' }}
          >
            <div ref={(el) => (curtainRefs.current[i] = el)} className="absolute inset-0">
              <div ref={(el) => (measureRefs.current[i] = el)}>{s.node}</div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
