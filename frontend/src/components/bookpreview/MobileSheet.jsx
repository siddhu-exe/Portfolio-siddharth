import { useEffect, useLayoutEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { animate, motion, useDragControls, useMotionValue } from 'framer-motion';
import gsap from 'gsap';
import { ArrowIcon, CloseIcon, Figure, Stats, linkList, stackLine } from './parts.jsx';

const pad2 = (n) => String(n).padStart(2, '0');
const SLIDE = { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] };
const SWIPE_MIN = 56;

/**
 * Bottom sheet (< 1024px). Ownership: Framer Motion owns the sheet's `y` ONLY (slide in / out
 * and the drag-down-to-close); GSAP owns the overlay, the cover scale and the prev/next
 * cross-slide, each on its own element. `apiRef.current` = { close(), turn(dir) }.
 */
export default function MobileSheet({
  previews,
  index,
  setIndex,
  origin,
  intro, // 'slide' | 'reduced'
  apiRef,
  onRequestClose,
  onRead,
  onClosed,
}) {
  const n = previews.length;
  const p = previews[index];
  const prevP = n > 1 ? previews[(index - 1 + n) % n] : null;
  const nextP = n > 1 ? previews[(index + 1) % n] : null;
  const links = linkList(p, { demoLabel: 'Demo' });
  const stack = stackLine(p);

  const y = useMotionValue(typeof window === 'undefined' ? 800 : window.innerHeight);
  const controls = useDragControls();
  const overlayRef = useRef(null);
  const fadeRef = useRef(null);
  const bodyRef = useRef(null);
  const contentRef = useRef(null);
  const coverRef = useRef(null);
  const actionsRef = useRef(null);
  const titleRef = useRef(null);
  const swipe = useRef(null);
  const phase = useRef('opening'); // opening | open | closing
  const busy = useRef(false);
  const live = useRef({});
  live.current = { previews, index, setIndex, onClosed };

  useLayoutEffect(() => {
    const reduced = intro === 'reduced';
    let timer = null;
    let slideAnim = null;

    const settle = () => {
      if (phase.current !== 'opening') return;
      phase.current = 'open';
      titleRef.current?.focus({ preventScroll: true });
    };

    const start = () => {
      origin?.classList.remove('is-pressing');
      gsap.to(overlayRef.current, { opacity: 1, duration: reduced ? 0.2 : 0.3, ease: 'power1.out' });
      if (reduced) {
        gsap.to(fadeRef.current, { opacity: 1, duration: 0.2, onComplete: settle });
      } else {
        gsap.fromTo(coverRef.current, { scale: 0.96 }, { scale: 1, duration: SLIDE.duration, ease: 'power3.out' });
        slideAnim = animate(y, 0, { ...SLIDE, onComplete: settle });
      }
    };

    gsap.set(overlayRef.current, { opacity: 0 });
    if (reduced) {
      y.set(0);
      gsap.set(fadeRef.current, { opacity: 0 });
    } else {
      y.set(window.innerHeight);
    }

    // a small press on the tapped row, then the sheet comes up
    if (!reduced && origin) {
      origin.classList.add('is-pressing');
      timer = setTimeout(start, 110);
    } else {
      start();
    }

    const finish = () => {
      phase.current = 'closed';
      live.current.onClosed();
    };

    const close = () => {
      if (phase.current === 'closing' || phase.current === 'closed') return;
      phase.current = 'closing';
      clearTimeout(timer);
      slideAnim?.stop();
      origin?.classList.remove('is-pressing');
      gsap.to(overlayRef.current, { opacity: 0, duration: reduced ? 0.2 : 0.3, ease: 'power1.in' });
      if (reduced) {
        gsap.to(fadeRef.current, { opacity: 0, duration: 0.2, onComplete: finish });
      } else {
        animate(y, window.innerHeight, { duration: 0.35, ease: [0.4, 0, 1, 1], onComplete: finish });
      }
    };

    // prev / next: the content cross-slides (x 24px + fade, 0.3s). No 3D on a phone.
    const turn = (dir) => {
      const L = live.current;
      const total = L.previews.length;
      if (total < 2 || busy.current || phase.current !== 'open') return;
      busy.current = true;
      const target = (L.index + dir + total) % total;
      const els = [contentRef.current, actionsRef.current];
      const dx = reduced ? 0 : 24 * dir;
      gsap
        .timeline({
          onComplete: () => {
            busy.current = false;
            titleRef.current?.focus({ preventScroll: true });
          },
        })
        .to(els, { x: -dx, opacity: 0, duration: 0.15, ease: 'power1.in' })
        .add(() => {
          flushSync(() => L.setIndex(target));
          bodyRef.current.scrollTop = 0;
          gsap.set(els, { x: dx });
        })
        .to(els, { x: 0, opacity: 1, duration: 0.15, ease: 'power1.out' });
    };

    apiRef.current = { close, turn };

    // ScrollTrigger.normalizeScroll (desktop-width windows) would otherwise eat wheel / touch
    // events meant for this sheet's own scroll area.
    const body = bodyRef.current;
    const stop = (e) => e.stopPropagation();
    body.addEventListener('wheel', stop, { passive: true });
    body.addEventListener('touchmove', stop, { passive: true });

    return () => {
      clearTimeout(timer);
      slideAnim?.stop();
      origin?.classList.remove('is-pressing');
      gsap.killTweensOf([overlayRef.current, fadeRef.current, coverRef.current, contentRef.current, actionsRef.current]);
      body.removeEventListener('wheel', stop);
      body.removeEventListener('touchmove', stop);
      apiRef.current = null;
    };
    // mounted once per session; props are read through `live`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the scroll area at the top when the book changes
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [index]);

  const onDragEnd = (_, info) => {
    if (info.offset.y > 120 || info.velocity.y > 500) onRequestClose();
    else animate(y, 0, { type: 'spring', stiffness: 420, damping: 38 });
  };

  // horizontal swipe on the content = prev / next
  const onBodyDown = (e) => {
    swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onBodyUp = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.6) apiRef.current?.turn(dx < 0 ? 1 : -1);
  };

  const meta = p.category;

  return (
    <div className="bp bp-mobile" data-bp-root role="dialog" aria-modal="true" aria-labelledby="bp-title">
      <div className="bp-overlay" ref={overlayRef} onClick={onRequestClose} />

      <div className="bp-sheet-fade" ref={fadeRef}>
        <motion.div
          className="bp-sheet"
          style={{ y }}
          drag="y"
          dragListener={false}
          dragControls={controls}
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0, bottom: 0.15 }}
          dragMomentum={false}
          onDragEnd={onDragEnd}
        >
          <div className="bp-m-head" onPointerDown={(e) => controls.start(e)}>
            <div className="bp-m-handle">
              <span />
            </div>
            <div className="bp-m-headrow">
              <span className="lbl">
                Vol.{p.volumeLabel} / {pad2(p.total)}
              </span>
              <button
                type="button"
                className="bp-m-close"
                aria-label="Close preview"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onRequestClose}
              >
                <CloseIcon size={14} stroke={2.4} />
              </button>
            </div>
          </div>

          <div className="bp-m-body" ref={bodyRef} onPointerDown={onBodyDown} onPointerUp={onBodyUp} onPointerCancel={() => (swipe.current = null)}>
            <div className="bp-m-content" ref={contentRef}>
              <div className="bp-m-cover" ref={coverRef}>
                <Figure p={p} className="bp-m-fig" />
              </div>
              {meta && <div className="lbl bp-m-cat">{meta}</div>}
              <h2 id="bp-title" ref={titleRef} tabIndex={-1} className="bp-m-title">
                {p.title}
              </h2>
              {p.summary && <p className="bp-m-summary">{p.summary}</p>}
              <Stats stats={p.stats.slice(0, 2)} className="bp-stats--m" />
              {stack && <div className="bp-m-stack mono">{stack}</div>}
            </div>
          </div>

          <div className="bp-m-actions">
            <div ref={actionsRef}>
              <a
                className="bp-m-read"
                href={`/projects/${p.slug}`}
                onClick={(e) => {
                  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                  e.preventDefault();
                  onRead(p);
                }}
              >
                Read the full chapter
                <span className="bp-m-read-go">
                  <ArrowIcon size={16} />
                </span>
              </a>
              {links.length > 0 && (
                <div className="bp-m-links" style={{ '--n': links.length }}>
                  {links.map((l) => (
                    <a key={l.key} className="bp-m-link" href={l.href} target="_blank" rel="noreferrer noopener">
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              )}
              {n > 1 && (
                <div className="bp-m-nav">
                  <button type="button" className="bp-m-navb" onClick={() => apiRef.current?.turn(-1)}>
                    <span aria-hidden="true">←</span> {prevP.title}
                  </button>
                  <button type="button" className="bp-m-navb bp-m-navb--next" onClick={() => apiRef.current?.turn(1)}>
                    {nextP.title} <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
