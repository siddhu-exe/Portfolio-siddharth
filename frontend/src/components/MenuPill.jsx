import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { scrollToSection, startScroll, stopScroll } from './SmoothScroll.jsx';
import { GITHUB_URL, LINKEDIN_URL, RESUME_HREF } from '../data/siteLinks.js';

const ITEMS = [
  { label: 'Home', target: 'top', number: '01', note: 'You are here', here: true },
  { label: 'Works', target: 'shelf', number: '02' }, // note: live volume count, see below
  { label: 'Contact', target: 'contact', number: '03', note: 'Say hello' },
];

const EXTERNAL = [
  { label: 'GitHub', href: GITHUB_URL },
  { label: 'LinkedIn', href: LINKEDIN_URL },
  { label: 'Resume', href: RESUME_HREF },
];

const EASE = [0.22, 1, 0.36, 1];
// Shared by the pill + panel backgrounds so framer morphs one surface into the other.
const SURFACE_TRANSITION = { layout: { duration: 0.55, ease: EASE } };
const EXIT_HOLD = { opacity: 0.98, transition: { duration: 0.55 } };

const fade = (index) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.2 + index * 0.06, duration: 0.4, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
});

/**
 * Fixed top-right "Menu" pill. Opening morphs the yellow pill into the black
 * contents panel (shared `layoutId` surface). The outer wrapper is exposed via
 * `wrapperRef` so Hero's GSAP intro can fade it in — GSAP only touches that
 * wrapper's opacity; framer owns the transforms on the inner surfaces.
 * Portaled to <body> so the sinking hero's transform can't capture `fixed`.
 */
export default function MenuPill({ wrapperRef, volumes }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const wasOpen = useRef(false);

  const close = useCallback(() => setOpen(false), []);

  // Open: freeze scroll, Esc closes, Tab is trapped inside the panel.
  useEffect(() => {
    if (!open) return undefined;
    stopScroll();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const nodes = panelRef.current.querySelectorAll('a[href], button:not([disabled])');
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (!panelRef.current.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus({ preventScroll: true });

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      startScroll();
    };
  }, [open]);

  // Closing hands focus back to the pill.
  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  const go = (event, target) => {
    event.preventDefault();
    setOpen(false);
    // Lenis ignores scrollTo while stopped, so resume before gliding.
    startScroll();
    scrollToSection(target);
  };

  return createPortal(
    <MotionConfig reducedMotion="user">
      <div
        ref={wrapperRef}
        className="menu-pill-wrap fixed right-7 top-6 z-[65] md:right-16 lg:right-[88px] lg:top-9"
      >
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="site-menu"
          tabIndex={open ? -1 : 0}
          onClick={() => setOpen(true)}
          className={`relative flex h-11 items-center justify-center gap-2.5 px-[18px] text-sm font-bold text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream lg:h-12 lg:w-[120px] lg:gap-3 lg:px-0 lg:text-[15px] ${
            open ? 'pointer-events-none' : ''
          }`}
          style={{ borderRadius: 24 }}
        >
          {!open && (
            <motion.span
              layoutId="menu-surface"
              className="absolute inset-0 bg-sun"
              style={{ borderRadius: 24 }}
              transition={SURFACE_TRANSITION}
            />
          )}
          <span
            className={`relative flex items-center gap-[inherit] transition-opacity duration-150 ${
              open ? 'opacity-0' : 'opacity-100'
            }`}
          >
            Menu
            <svg width="18" height="11" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M1 3h18M1 9h18" />
            </svg>
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.button
            key="dim"
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={close}
            className="fixed inset-0 z-[74] cursor-default bg-[rgba(245,240,234,0.72)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          />
        )}
        {open && (
          <motion.div
            key="panel"
            className="pointer-events-none fixed inset-x-4 top-[clamp(4rem,16.5svh,9.4rem)] z-[75] flex justify-center md:inset-x-8"
            animate={{ opacity: 1 }}
            exit={EXIT_HOLD}
          >
            <div
              ref={panelRef}
              id="site-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              className="pointer-events-auto relative w-full max-w-[620px] text-cream"
            >
              <motion.div
                layoutId="menu-surface"
                className="absolute inset-0 bg-ink"
                style={{ borderRadius: 32, boxShadow: '0 50px 90px -40px rgba(26,20,16,0.7)' }}
                transition={SURFACE_TRANSITION}
              />

              <div className="relative max-h-[calc(100svh-5rem)] overflow-y-auto px-6 pb-5 pt-7 lg:px-11 lg:pb-8 lg:pt-10">
                <motion.div
                  {...fade(0)}
                  className="flex items-center justify-between font-mono text-[11px] tracking-[1.8px] text-cream/60"
                >
                  <span>CONTENTS</span>
                  <span>03 PAGES</span>
                </motion.div>

                <nav aria-label="Main menu" className="mt-5 border-t border-cream/15 lg:mt-[22px]">
                  {ITEMS.map((item, index) => (
                    <motion.div key={item.label} {...fade(index + 1)}>
                      <a
                        href={`#${item.target}`}
                        onClick={(event) => go(event, item.target)}
                        className="group flex items-baseline gap-3 border-b border-cream/15 py-3 outline-none focus-visible:bg-cream/5 lg:gap-[22px] lg:py-[18px]"
                      >
                        <span className="font-mono text-[11px] text-sand lg:text-xs">{item.number}</span>
                        <span className="flex-1 font-display text-[clamp(34px,10vw,64px)] font-extrabold leading-none tracking-[-0.015em] transition-colors duration-200 group-hover:text-sun group-focus-visible:text-sun">
                          {item.label}
                        </span>
                        <span
                          className={`font-mono text-[10px] uppercase lg:text-[11px] ${
                            item.here ? 'text-sun' : 'text-cream/60'
                          }`}
                        >
                          {item.here && '● '}
                          {item.note ?? (volumes ? `${volumes} ${volumes === 1 ? 'volume' : 'volumes'}` : 'The shelf')}
                        </span>
                      </a>
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  {...fade(4)}
                  className="mt-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-1 lg:mt-[26px]"
                >
                  <div className="flex gap-5 text-sm font-semibold">
                    {EXTERNAL.map((link) => (
                      <a
                        key={link.label}
                        href={link.href ?? '#'}
                        {...(link.href?.startsWith('http')
                          ? { target: '_blank', rel: 'noreferrer' }
                          : link.href
                            ? { download: true }
                            : {})}
                        onClick={link.href ? undefined : (event) => event.preventDefault()}
                        className="inline-flex min-h-[44px] items-center outline-none transition-colors hover:text-sun focus-visible:text-sun"
                      >
                        {link.label} ↗
                      </a>
                    ))}
                  </div>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    className="inline-flex h-12 items-center gap-3 rounded-full bg-sun px-6 text-[15px] font-bold text-ink outline-none focus-visible:ring-2 focus-visible:ring-cream"
                  >
                    Close
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>,
    document.body,
  );
}
