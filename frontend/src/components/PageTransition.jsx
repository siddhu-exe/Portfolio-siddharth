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

      {state && (
        <div className="fixed inset-0 z-[100]" style={{ perspective: '1800px' }}>
          {/* sweeping shadow cast by the cover as it closes */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: state.phase === 'in' ? 0.55 : 0 }}
            transition={{ duration: state.phase === 'in' ? 0.65 : 0.75, ease: 'easeOut' }}
          />

          {/* the cover */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
            style={{
              transformOrigin: 'left center',
              backgroundColor: state.color,
              backfaceVisibility: 'hidden',
            }}
            initial={{ rotateY: -92 }}
            animate={{ rotateY: state.phase === 'in' ? 0 : -92 }}
            transition={{
              duration: state.phase === 'in' ? 0.75 : 0.85,
              ease: [0.76, 0, 0.24, 1],
            }}
            onAnimationComplete={onCoverSettled}
          >
            {/* cloth texture + tonal depth */}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30" />
            <span className="pointer-events-none absolute inset-0 opacity-20 [background:repeating-linear-gradient(45deg,transparent_0,transparent_4px,rgba(255,255,255,0.05)_4px,rgba(255,255,255,0.05)_5px)]" />
            {/* spine gutter on the hinge side + foil frame */}
            <span className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/50 to-transparent" />
            <span className="pointer-events-none absolute inset-4 rounded-xl border border-white/25 md:inset-6" />
            <span className="pointer-events-none absolute inset-5 rounded-lg border border-white/10 md:inset-8" />

            {/* cover imprint */}
            <div className="relative flex flex-col items-center px-10 text-center">
              {state.category && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/60 md:text-xs">
                  {state.category}
                </span>
              )}
              <span className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white md:text-6xl">
                {state.title}
              </span>
              <span className="mt-6 h-px w-12 bg-white/40" />
              <span className="mt-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60 md:text-xs">
                S. Dongardive
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </Ctx.Provider>
  );
}
