import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { subscribeToScrollProgress } from './SmoothScroll.jsx';

const TOTAL_PAGES = 6;

export default function BookmarkProgress({ visible }) {
  const fillRef = useRef(null);
  const tabRef = useRef(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!visible) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fillTo = gsap.quickTo(fillRef.current, 'scaleY', {
      duration: reduceMotion ? 0 : 0.16,
      ease: 'power2.out',
    });
    const tabTo = gsap.quickTo(tabRef.current, 'y', {
      duration: reduceMotion ? 0 : 0.16,
      ease: 'power2.out',
    });

    // Cache viewport height (read on resize, not per scroll tick) so the
    // subscriber below doesn't force layout on every frame while scrolling.
    let viewportH = window.innerHeight;
    const onResize = () => {
      viewportH = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    let lastPage = -1;
    const unsubscribe = subscribeToScrollProgress((progress) => {
      fillTo(progress);
      tabTo(progress * (viewportH - 20));
      const nextPage = Math.min(TOTAL_PAGES, Math.floor(progress * TOTAL_PAGES) + 1);
      // Only touch React state when the page label actually changes — avoids a
      // re-render on every scroll frame.
      if (nextPage !== lastPage) {
        lastPage = nextPage;
        setPage(nextPage);
      }
    });

    return () => {
      window.removeEventListener('resize', onResize);
      unsubscribe();
    };
  }, [visible]);

  return (
    <aside
      aria-label={`Reading progress: page ${page} of ${TOTAL_PAGES}`}
      className={`group pointer-events-none fixed bottom-0 right-[6px] top-0 z-[70] transition-opacity duration-300 md:right-[18px] ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute bottom-0 right-0 top-0 w-[3px] overflow-hidden rounded-full bg-ink/10 shadow-[inset_0_0_1px_rgba(0,0,0,0.15)] backdrop-blur-sm">
        <div
          ref={fillRef}
          className="absolute inset-x-0 top-0 h-full origin-top scale-y-0 rounded-full bg-gradient-to-b from-mustard via-mustard to-terracotta shadow-[0_0_10px_1px_rgba(255,232,98,0.55)] will-change-transform"
        />
      </div>

      <div
        ref={tabRef}
        className="pointer-events-auto absolute right-[-6px] top-0 h-6 w-4 -translate-y-1 will-change-transform"
      >
        <span className="absolute inset-0 bg-gradient-to-b from-mustard to-terracotta shadow-[0_2px_8px_rgba(217,131,74,0.4)] ring-1 ring-cream/40 [clip-path:polygon(0_0,100%_0,100%_100%,50%_68%,0_100%)]" />
        <span className="absolute right-6 top-1/2 hidden -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-md bg-ink/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-cream opacity-0 shadow-lg ring-1 ring-cream/10 backdrop-blur-md transition-all duration-200 group-hover:opacity-100 md:flex">
          <span className="text-mustard">{page}</span>
          <span className="text-cream/50">/ {TOTAL_PAGES}</span>
        </span>
      </div>
    </aside>
  );
}
