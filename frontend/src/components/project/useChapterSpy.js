import { useEffect, useState } from 'react';

/**
 * Which section is "current" (IntersectionObserver on a thin band ~40% down the
 * viewport). `ids` is document order; the last one inside the band wins.
 */
export default function useChapterSpy(ids, rootMargin = '-40% 0px -55% 0px') {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join('|');
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length || typeof IntersectionObserver === 'undefined') return undefined;
    const inBand = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? inBand.add(e.target.id) : inBand.delete(e.target.id)));
        const current = ids.filter((id) => inBand.has(id)).pop();
        if (current) setActive(current);
      },
      { rootMargin }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, rootMargin]);
  return [active, setActive];
}
