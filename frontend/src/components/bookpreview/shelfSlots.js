// The popup's only contact with the Project Shelf's DOM: finding a book's spine and
// hiding / releasing it while that book is "out of the stack". Everything else on the
// shelf (its GSAP entrance, hover, is-active) is left alone.
//
// A held spine keeps `.is-pulling` (CSS: translateX(40px), the shelf's own pull) and
// `visibility: hidden`, so its rect still measures as the pulled position. Releasing it
// shows it where it was pulled to and removes the class, so it slides back into the stack.

export const spineOf = (slug) =>
  slug ? document.querySelector(`.shelf-book[data-book="${window.CSS?.escape ? CSS.escape(slug) : slug}"]`) : null;

/** True when a rect is (almost) fully inside the viewport, i.e. worth flying to / from. */
export const onScreen = (r) =>
  r.width > 0 &&
  r.height > 0 &&
  r.top >= -r.height / 2 &&
  r.bottom <= window.innerHeight + r.height / 2 &&
  r.right > 0 &&
  r.left < window.innerWidth;

const afterFrames = (n, fn) => {
  if (n <= 0) fn();
  else requestAnimationFrame(() => afterFrames(n - 1, fn));
};

export function createSlots() {
  let held = null;
  let pulled = null;

  const noTransition = (btn, fn) => {
    btn.style.transition = 'none';
    fn();
    btn.getBoundingClientRect(); // flush so the change is applied without animating
    btn.style.transition = '';
  };

  return {
    /** Hide the spine, leaving it in its pulled position. `animate`: it is already mid-pull (click). */
    hold(btn, { instant = false } = {}) {
      if (!btn) return;
      if (held && held !== btn) this.release(held, { slide: false });
      held = btn;
      if (instant) noTransition(btn, () => btn.classList.add('is-pulling'));
      else btn.classList.add('is-pulling');
      btn.style.visibility = 'hidden';
    },

    /** Show the spine again. slide: it slides back into the stack; otherwise it snaps. */
    release(btn, { slide = true } = {}) {
      if (!btn) return;
      if (held === btn) held = null;
      if (pulled === btn) pulled = null;
      btn.style.visibility = '';
      if (slide) afterFrames(2, () => btn.classList.remove('is-pulling'));
      else noTransition(btn, () => btn.classList.remove('is-pulling'));
    },

    /** Snap everything back (unmount / StrictMode re-run). Safe to call any time. */
    reset() {
      if (held) this.release(held, { slide: false });
      held = null;
      if (pulled) noTransition(pulled, () => pulled.classList.remove('is-pulling'));
      pulled = null;
    },

    /** Start the shelf's own 220ms pull-out (CSS) on the clicked spine. */
    pull(btn) {
      if (!btn) return;
      pulled = btn;
      btn.classList.add('is-pulling');
    },
  };
}
