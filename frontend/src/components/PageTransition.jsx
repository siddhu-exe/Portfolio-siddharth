import { createContext, useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Ctx = createContext(() => {});

/** Trigger a book-cover page transition: transitionTo(path, { color, title, category }) */
export const usePageTransition = () => useContext(Ctx);

/**
 * Full-page route transition styled as a giant book cover. Hinged on the left
 * edge of the viewport, it sweeps shut over the current page (like closing a
 * book), the route swaps underneath while it's closed, then it swings open to
 * reveal the new page.
 */
/**
 * One composited layer only: the cover swings shut from the left hinge going INTO a book, and from
 * the right hinge coming BACK to the library (landAt set). Transform + opacity only, no extra
 * moving layers, so it stays on the GPU. Text appears with a single fade.
 */
function Cover({ state, onSettled }) {
  const closing = state.phase === 'in';
  const back = Boolean(state.landAt);
  const open = back ? 90 : -90;
  const origin = back ? 'right center' : 'left center';

  return (
    <div className="fixed inset-0 z-[100]" style={{ perspective: '1800px' }}>
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ transformOrigin: origin, backgroundColor: state.color, backfaceVisibility: 'hidden', willChange: 'transform' }}
        initial={{ rotateY: open }}
        animate={{ rotateY: closing ? 0 : open }}
        transition={{ duration: closing ? 0.7 : 0.8, ease: [0.45, 0, 0.2, 1] }}
        onAnimationComplete={onSettled}
      >
        {/* static tonal depth, spine gutter and frame */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30" />
        <span
          className={`pointer-events-none absolute inset-y-0 w-16 from-black/50 to-transparent ${
            back ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'
          }`}
        />
        <span className="pointer-events-none absolute inset-4 rounded-xl border border-cream/30 md:inset-6" />

        <motion.div
          className="relative flex flex-col items-center px-10 text-center text-cream"
          initial={{ opacity: 0 }}
          animate={{ opacity: closing ? 1 : 0 }}
          transition={{ duration: 0.35, delay: closing ? 0.35 : 0 }}
        >
          {state.category && (
            <span className="font-display text-[11px] font-medium uppercase tracking-[0.42em] text-cream/80 md:text-sm">
              {state.category}
            </span>
          )}
          <span className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            {state.title}
          </span>
          <span className="mt-7 h-px w-12 bg-terracotta" />
          <span className="mt-5 font-display text-sm italic tracking-[0.14em] text-cream/85 md:text-lg">
            Siddharth Dongardive
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function PageTransitionProvider({ children }) {
  const [state, setState] = useState(null); // { path, color, title, category, phase }
  const navigate = useNavigate();

  const transitionTo = useCallback((path, opts = {}) => {
    setState({ path, color: '#171717', title: '', category: '', ...opts, phase: 'in' });
  }, []);

  const onCoverSettled = () => {
    if (!state) return;
    if (state.phase === 'in') {
      navigate(state.path, state.landAt ? { state: { landAt: state.landAt } } : undefined);
      // When landing on a specific section (e.g. returning to the shelf), Home
      // places the scroll itself while the cover is still closed — don't force
      // the top here.
      // instant: html has scroll-behavior: smooth, so a bare scrollTo would glide under the cover
      // and could still be moving when the cover opens
      if (!state.landAt) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      // brief hold while the new page mounts behind the closed cover
      setTimeout(() => setState((s) => (s ? { ...s, phase: 'out' } : s)), 420);
    } else {
      setState(null);
    }
  };

  return (
    <Ctx.Provider value={transitionTo}>
      {children}

      {state && <Cover state={state} onSettled={onCoverSettled} />}
    </Ctx.Provider>
  );
}
