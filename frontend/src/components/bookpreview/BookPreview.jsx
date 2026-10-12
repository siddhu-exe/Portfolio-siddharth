import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import { usePageTransition } from '../PageTransition.jsx';
import { startScroll, stopScroll } from '../SmoothScroll.jsx';
import LaptopBook from './LaptopBook.jsx';
import MobileSheet from './MobileSheet.jsx';
import { createSlots, spineOf } from './shelfSlots.js';
import './bookpreview.css';

const PARAM = 'book';
const TABBABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

const bookInUrl = () => new URLSearchParams(window.location.search).get(PARAM);

function setUrlBook(slug, mode) {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set(PARAM, slug);
  else url.searchParams.delete(PARAM);
  const state = { ...(window.history.state || {}) };
  if (mode === 'push') window.history.pushState(state, '', url);
  else window.history.replaceState(state, '', url);
}

/** Slug to open from the URL on first load (deep link), or null. */
export const initialBookRequest = () => {
  const slug = typeof window === 'undefined' ? null : bookInUrl();
  return slug ? { slug, el: null } : null;
};

/**
 * Project Shelf popup. One template for every book: `previews` come from data/bookPreview.js.
 * >= 1024px an open-book spread (LaptopBook), below that a bottom sheet (MobileSheet).
 *
 * This component owns everything that is not animation: the session, scroll lock, focus
 * (to the title on open, trapped, back to the spine on close), Esc / arrow keys, and the
 * `?book=<slug>` URL (deep link + Back closes). The views own their own motion.
 *
 * request: { slug, el } | null  (el = the clicked spine button, null for a deep link)
 */
export default function BookPreview({ previews, request, onClose }) {
  const transitionTo = usePageTransition();
  const isLaptop = useMediaQuery('(min-width: 1024px)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [session, setSession] = useState(null); // { id, el, fromClick }
  const [index, setIndex] = useState(0);
  const slots = useMemo(() => createSlots(), []);
  const apiRef = useRef(null);
  const closing = useRef(false);
  const pushed = useRef(false);
  const introRef = useRef('fly');
  const idRef = useRef(0);

  // --- start a session when a request arrives (and its book is in the list) -----------------
  useEffect(() => {
    if (!request || session || !previews.length) return;
    const i = previews.findIndex((p) => p.slug === request.slug);
    if (i < 0) {
      // stale / unknown ?book= : drop it quietly
      if (bookInUrl()) setUrlBook(null, 'replace');
      onClose();
      return;
    }
    closing.current = false;
    introRef.current = reduced ? 'reduced' : request.el ? 'fly' : 'fade';
    setIndex(i);
    setSession({ id: ++idRef.current, el: request.el, fromClick: !!request.el });
  }, [request, session, previews, reduced, onClose]);

  const sessionId = session?.id;

  // Resized across the 1024px breakpoint while open: the other layout mounts already open (no replay).
  const lastLaptop = useRef(isLaptop);
  useEffect(() => {
    if (lastLaptop.current !== isLaptop) introRef.current = reduced ? 'reduced' : 'fade';
    lastLaptop.current = isLaptop;
  }, [isLaptop, reduced]);

  // --- close plumbing ---------------------------------------------------------------------
  const requestClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    if (pushed.current) {
      pushed.current = false;
      window.history.back(); // pops the entry we pushed; the popstate handler sees `closing` and ignores it
    } else if (bookInUrl()) {
      setUrlBook(null, 'replace');
    }
    apiRef.current?.close();
  }, []);

  const onViewClosed = useCallback(() => {
    setSession(null);
    onClose();
  }, [onClose]);

  const onRead = useCallback(
    (p) => {
      if (closing.current) return;
      closing.current = true;
      pushed.current = false;
      if (bookInUrl()) setUrlBook(null, 'replace');
      transitionTo(`/projects/${p.slug}`, { color: p.spineColor, title: p.title, category: p.category });
    },
    [transitionTo]
  );

  // --- session lifetime: scroll lock, inert page, URL, keys, focus ------------------------------
  const live = useRef({});
  live.current = { previews, index, isLaptop };
  const sessionRef = useRef(null);
  sessionRef.current = session;

  useEffect(() => {
    if (!sessionId) return undefined;
    const sess = sessionRef.current;
    const scrollY = window.scrollY;
    stopScroll();

    const appRoot = document.getElementById('root');
    appRoot?.setAttribute('inert', '');
    appRoot?.setAttribute('aria-hidden', 'true');

    // Back button closes the popup: our own history entry carries ?book=
    const slug0 = live.current.previews[live.current.index]?.slug;
    if (sess.fromClick) {
      setUrlBook(slug0, 'push');
      pushed.current = true;
    } else {
      setUrlBook(slug0, 'replace');
    }

    const onPop = () => {
      if (closing.current) return;
      if (!bookInUrl()) {
        closing.current = true;
        pushed.current = false;
        apiRef.current?.close();
      }
    };
    window.addEventListener('popstate', onPop);

    const onKey = (e) => {
      if (e.defaultPrevented) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        requestClose();
      } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && live.current.isLaptop) {
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
        e.preventDefault();
        apiRef.current?.turn(e.key === 'ArrowRight' ? 1 : -1);
      } else if (e.key === 'Tab') {
        const root = document.querySelector('[data-bp-root]');
        if (!root) return;
        const list = [...root.querySelectorAll(TABBABLE)].filter(
          (el) => !el.closest('[inert]') && !el.closest('[aria-hidden="true"]') && getComputedStyle(el).visibility !== 'hidden'
        );
        if (!list.length) {
          e.preventDefault();
          return;
        }
        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement;
        if (!root.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && (active === first || active === root.querySelector('#bp-title'))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey, true);

    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey, true);
      appRoot?.removeAttribute('inert');
      appRoot?.removeAttribute('aria-hidden');
      startScroll();
      if (Math.abs(window.scrollY - scrollY) > 0.5) window.scrollTo(0, scrollY); // restore exactly
      slots.reset();
      // focus goes back to the spine that was clicked
      const target = sess.el?.isConnected ? sess.el : null;
      if (target && !closing.current) return;
      target?.focus({ preventScroll: true });
    };
  }, [sessionId, slots, requestClose]);

  // --- the shown book changed (prev / next): keep the URL in step -----------------------------------
  useEffect(() => {
    if (!sessionId || closing.current) return;
    const slug = previews[index]?.slug;
    if (slug && bookInUrl() !== slug) setUrlBook(slug, 'replace');
  }, [index, sessionId, previews]);

  // --- render ---------------------------------------------------------------------------------------
  if (!session || !previews[index]) return null;

  const common = {
    previews,
    index,
    setIndex,
    origin: session.el,
    apiRef,
    onRequestClose: requestClose,
    onRead,
    onClosed: onViewClosed,
  };

  return createPortal(
    isLaptop ? (
      <LaptopBook key="laptop" {...common} intro={introRef.current} slots={slots} spineOf={spineOf} />
    ) : (
      <MobileSheet key="mobile" {...common} intro={reduced ? 'reduced' : 'slide'} />
    ),
    document.body
  );
}
