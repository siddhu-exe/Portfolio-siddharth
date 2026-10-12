import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Active Lenis instance (null on touch devices / reduced motion, where native
// scroll is used instead). Nav clicks route through scrollToSection below so
// they glide through Lenis's pipeline instead of fighting it with native
// scrollIntoView (normalizeScroll intercepts native smooth scrolling).
let lenisInstance = null;
const scrollProgressSubscribers = new Set();

// Cached scrollable height so the native-scroll handler doesn't read layout
// (scrollHeight/innerHeight force a reflow) on every scroll event — that
// per-tick layout read is what makes native mobile scroll feel laggy. Refreshed
// on resize / load and lazily if it's stale (0).
let cachedScrollable = 0;
const measureScrollable = () => {
  cachedScrollable = document.documentElement.scrollHeight - window.innerHeight;
  return cachedScrollable;
};

const getNativeProgress = () => {
  const scrollable = cachedScrollable || measureScrollable();
  return scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
};

const publishScrollProgress = (progress) => {
  scrollProgressSubscribers.forEach((subscriber) => subscriber(progress));
};

export function subscribeToScrollProgress(subscriber) {
  scrollProgressSubscribers.add(subscriber);
  subscriber(lenisInstance?.progress ?? getNativeProgress());
  return () => scrollProgressSubscribers.delete(subscriber);
}

/**
 * Freeze / resume page scroll (open overlays). Lenis owns scrolling when it is
 * active; on touch / reduced-motion (native scroll) fall back to an overflow lock.
 */
export function stopScroll() {
  if (lenisInstance) lenisInstance.stop();
  else document.documentElement.style.overflow = 'hidden';
}

export function startScroll() {
  if (lenisInstance) lenisInstance.start();
  else document.documentElement.style.removeProperty('overflow');
}

/**
 * Smoothly scroll to a section id (or 'top'). Uses Lenis when active — with a
 * long eased glide so pinned sections scrub through premium-slow — and falls
 * back to native smooth scroll otherwise.
 */
export function scrollToSection(target) {
  const dest = target === 'top' ? 0 : document.getElementById(target);
  if (dest !== 0 && !dest) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(dest, {
      duration: 1.6,
      easing: (t) => 1 - Math.pow(1 - t, 4), // easeOutQuart glide
    });
  } else if (dest === 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    dest.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Instantly jump to a section id (or 'top'), no glide. Used when returning from
 * a project so the page is already positioned on the shelf behind the closed
 * route-transition cover. Reuses the active Lenis instance so its internal
 * scroll position stays in sync (a bare window.scrollTo would desync Lenis).
 */
export function jumpToSection(target) {
  const dest = target === 'top' ? 0 : document.getElementById(target);
  if (dest !== 0 && !dest) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(dest, { immediate: true });
  } else if (dest === 0) {
    window.scrollTo(0, 0);
  } else {
    dest.scrollIntoView();
  }
}

/**
 * Site-wide smooth scroll (Lenis), kept on the same frame clock as GSAP so it
 * never fights ScrollTrigger's pinned curtain transition:
 *  - Lenis's raf loop is driven by `gsap.ticker` instead of its own rAF, so
 *    both libraries tick in lockstep on the same frame.
 *  - Every Lenis `scroll` event calls `ScrollTrigger.update()`, so pins/scrubs
 *    read Lenis's (eased) scroll position immediately instead of waiting for
 *    the next native `scroll` event — this is what removes the "laggy /
 *    disconnected from input" feel during the pin.
 *  - `ScrollTrigger.normalizeScroll(true)` stops the browser's native scroll
 *    from fighting Lenis's virtual scroll (prevents the double-scroll jitter
 *    that otherwise shows up around pinned sections).
 * Lenis stays active through the pinned section — pausing/resuming it around
 * the pin introduced a visible hitch when re-enabled, so continuous smoothing
 * with ticker-sync ended up feeling tighter than toggling it off.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    // Touch devices keep native scroll — Lenis's virtual scroll can feel odd
    // against touch gestures, and ScrollTrigger's pin already has a simpler
    // non-pinned fallback on mobile.
    if (prefersReducedMotion || !isFinePointer) {
      // Native scroll on touch. The scroll event fires very frequently on
      // mobile, so coalesce work to one update per animation frame (rAF) and
      // avoid reading layout inside the handler (see cachedScrollable) — both
      // together remove the per-tick jank without changing behavior.
      let rafId = null;
      const flush = () => {
        rafId = null;
        publishScrollProgress(getNativeProgress());
      };
      const onNativeScroll = () => {
        if (rafId === null) rafId = requestAnimationFrame(flush);
      };
      const onResize = () => {
        measureScrollable();
        publishScrollProgress(getNativeProgress());
      };
      window.addEventListener('scroll', onNativeScroll, { passive: true });
      window.addEventListener('resize', onResize);
      window.addEventListener('load', onResize);
      measureScrollable();
      publishScrollProgress(getNativeProgress());
      return () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        window.removeEventListener('scroll', onNativeScroll);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('load', onResize);
      };
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    lenisInstance = lenis;

    const onLenisScroll = (event) => {
      ScrollTrigger.update();
      publishScrollProgress(event.progress);
    };
    lenis.on('scroll', onLenisScroll);

    // Drive Lenis from GSAP's ticker (shared frame clock) instead of its own
    // requestAnimationFrame loop.
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.normalizeScroll(true);
    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener('refresh', onRefresh);
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      lenis.off('scroll', onLenisScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}
