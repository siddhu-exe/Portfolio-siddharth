import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTransition } from './PageTransition.jsx';
import EyeFollowButton from './EyeFollowButton.jsx';

const EASE = [0.22, 1, 0.36, 1];
// Cover flip + spread re-centering share this so the book stays physical.
const OPEN = { duration: 0.9, delay: 0.45, ease: EASE };
const CLOSE = { duration: 0.55, ease: EASE };

// Below this width the two-page spread pages are too narrow (~180px each) to
// read, so we render a dedicated single-page mobile layout instead. Matches the
// `md` Tailwind breakpoint used across the site.
const MOBILE_MAX = 767;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

const content = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.8 } },
};
const line = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/**
 * The book "opens" for real: a closed book (front cover in the spine color)
 * flies onto the stage, then the cover rotates -180° around the spine. The
 * inside of the cover becomes the left page (project image) and the right
 * page holds the writeup. The spread shifts from off-center to centered as it
 * opens, exactly like laying a book flat. Close reverses every step.
 */
export default function BookModal({ project, onClose }) {
  const transitionTo = usePageTransition();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!project) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [project, onClose]);

  // Portal to <body> so the modal's fixed positioning resolves against the
  // viewport — the Project Shelf can be pinned (transformed) by GSAP, and a
  // transformed ancestor would otherwise break `position: fixed`.
  return createPortal(
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8">
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.6, duration: 0.3 } }}
          />

          {/* Stage: flies in as a closed book, flies out after the book shuts */}
          <motion.div
            className="relative z-10"
            style={{ perspective: 2600 }}
            initial={{ scale: 0.35, y: 110, rotate: -5, opacity: 0 }}
            animate={{ scale: 1, y: 0, rotate: 0, opacity: 1, transition: { duration: 0.5, ease: EASE } }}
            exit={{ scale: 0.4, y: 110, rotate: -5, opacity: 0, transition: { duration: 0.4, ease: EASE, delay: 0.5 } }}
          >
            {isMobile ? (
              <MobileSpread project={project} onClose={onClose} transitionTo={transitionTo} />
            ) : (
            /* Spread: two pages wide; shifts x so the closed book is centered */
            <motion.div
              className="relative flex h-[min(64vh,540px)] w-[min(90vw,920px)]"
              style={{ transformStyle: 'preserve-3d' }}
              initial={{ x: '-25%' }}
              animate={{ x: 0, transition: OPEN }}
              exit={{ x: '-25%', transition: CLOSE }}
            >
              {/* left half: empty slot the flipped cover lands on */}
              <div className="h-full w-1/2" />

              {/* right page: the writeup */}
              <div className="relative flex h-full w-1/2 flex-col rounded-r-xl bg-cream p-5 shadow-2xl md:p-8">
                {/* stacked page edges */}
                <span className="pointer-events-none absolute inset-y-1 right-0 w-px bg-ink/15" />
                <span className="pointer-events-none absolute inset-y-2 right-1 w-px bg-ink/10" />
                {/* spine shadow */}
                <span className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/15 to-transparent" />

                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-ink/90 text-lg text-cream transition-colors hover:bg-ink"
                >
                  &times;
                </button>

                <motion.div className="flex min-h-0 flex-1 flex-col" variants={content} initial="hidden" animate="show">
                  <motion.p variants={line} className="text-[10px] font-semibold uppercase tracking-widest text-terracotta md:text-xs">
                    {project.category}
                  </motion.p>
                  <motion.h3 variants={line} className="mt-1 text-lg font-bold leading-tight tracking-tight text-ink md:text-3xl">
                    {project.title}
                  </motion.h3>
                  <motion.p variants={line} className="mt-3 min-h-0 flex-1 overflow-y-auto text-xs leading-relaxed text-ink/75 md:text-base">
                    {project.description}
                  </motion.p>

                  {project.tech_stack?.length > 0 && (
                    <motion.div variants={line} className="mt-3 flex flex-wrap gap-1.5 md:gap-2">
                      {project.tech_stack.map((t) => (
                        <span key={t} className="rounded-full border border-ink/20 px-2.5 py-0.5 text-[10px] font-medium text-ink/70 md:px-3 md:py-1 md:text-xs">
                          {t}
                        </span>
                      ))}
                    </motion.div>
                  )}

                  <motion.div variants={line}>
                    <EyeFollowButton
                      onClick={() =>
                        transitionTo(`/projects/${project.slug}`, {
                          color: project.color,
                          title: project.title,
                          category: project.category,
                        })
                      }
                      className="mt-4 self-start md:mt-6"
                    >
                      View Full Project
                    </EyeFollowButton>
                  </motion.div>
                </motion.div>
              </div>

              {/* cover: overlays the right page closed, flips onto the left half */}
              <motion.div
                className="absolute left-1/2 top-0 h-full w-1/2"
                style={{ transformStyle: 'preserve-3d', transformOrigin: 'left center' }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -180, transition: OPEN }}
                exit={{ rotateY: 0, transition: CLOSE }}
              >
                {/* front face: the book cover */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-between rounded-r-xl p-6 shadow-2xl md:p-8"
                  style={{ backfaceVisibility: 'hidden', backgroundColor: project.color }}
                >
                  {/* spine curvature */}
                  <span className="pointer-events-none absolute inset-y-0 left-0 w-5 rounded-l-sm bg-gradient-to-r from-black/35 to-transparent" />
                  {/* embossed frame */}
                  <span className="pointer-events-none absolute inset-3 rounded-lg border border-black/25" />
                  <span className="pointer-events-none absolute inset-4 rounded-md border border-black/10" />

                  <span className="relative mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-ink/60 md:text-xs">
                    {project.category}
                  </span>
                  <span className="relative px-2 text-center text-xl font-bold leading-tight tracking-tight text-ink/90 md:text-3xl">
                    {project.title}
                  </span>
                  <span className="relative mb-4 flex flex-col items-center gap-2">
                    <span className="h-px w-10 bg-ink/40" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink/60 md:text-xs">
                      S. Dongardive
                    </span>
                  </span>
                </div>

                {/* back face: inside of the cover = left page with the image */}
                <div
                  className="absolute inset-0 flex flex-col rounded-l-xl bg-cream p-4 shadow-2xl md:p-6"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/15 to-transparent" />
                  <div
                    className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="px-4 text-center text-xs font-semibold uppercase tracking-widest text-ink/70">
                        {project.title}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-widest text-ink/50">
                    Fig. 01 — {project.title}
                  </p>
                </div>
              </motion.div>
            </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/**
 * Mobile layout: same cover-flip motion, but a single full-width page instead
 * of the desktop two-page spread (which gives ~180px-wide pages on a phone).
 * The closed cover fills the top "banner" region and flips UP around its top
 * edge (rotateX, top origin) to reveal the project image beneath it; the
 * writeup fills the rest of the page below. Desktop is untouched.
 */
function MobileSpread({ project, onClose, transitionTo }) {
  return (
    <motion.div
      className="relative flex h-[min(82vh,680px)] w-[min(92vw,460px)] flex-col overflow-hidden rounded-xl bg-cream shadow-2xl"
      style={{ transformStyle: 'preserve-3d' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: CLOSE }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-ink/90 text-lg text-cream transition-colors hover:bg-ink"
      >
        &times;
      </button>

      {/* Banner region: the flipping cover sits over the image, then lifts up */}
      <div className="relative h-[42%] w-full shrink-0" style={{ perspective: 1400 }}>
        {/* revealed image (under the cover) */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: project.color }}
        >
          {project.thumbnail ? (
            <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span className="px-4 text-center text-xs font-semibold uppercase tracking-widest text-ink/70">
              {project.title}
            </span>
          )}
        </div>

        {/* the cover flips up around its TOP edge to expose the image */}
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d', transformOrigin: 'top center' }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -180, transition: OPEN }}
          exit={{ rotateX: 0, transition: CLOSE }}
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6"
            style={{ backfaceVisibility: 'hidden', backgroundColor: project.color }}
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-black/35 to-transparent" />
            <span className="pointer-events-none absolute inset-3 rounded-lg border border-black/25" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ink/60">{project.category}</span>
            <span className="px-2 text-center text-xl font-bold leading-tight tracking-tight text-ink/90">
              {project.title}
            </span>
            <span className="mt-1 flex flex-col items-center gap-1.5">
              <span className="h-px w-10 bg-ink/40" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink/60">S. Dongardive</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* writeup: full width below the banner */}
      <div className="relative flex min-h-0 flex-1 flex-col p-5">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/10 to-transparent" />
        <motion.div className="flex min-h-0 flex-1 flex-col" variants={content} initial="hidden" animate="show">
          <motion.p variants={line} className="text-[10px] font-semibold uppercase tracking-widest text-terracotta">
            {project.category}
          </motion.p>
          <motion.h3 variants={line} className="mt-1 text-lg font-bold leading-tight tracking-tight text-ink">
            {project.title}
          </motion.h3>
          <motion.p variants={line} className="mt-3 min-h-0 flex-1 overflow-y-auto text-xs leading-relaxed text-ink/75">
            {project.description}
          </motion.p>

          {project.tech_stack?.length > 0 && (
            <motion.div variants={line} className="mt-3 flex flex-wrap gap-1.5">
              {project.tech_stack.map((t) => (
                <span key={t} className="rounded-full border border-ink/20 px-2.5 py-0.5 text-[10px] font-medium text-ink/70">
                  {t}
                </span>
              ))}
            </motion.div>
          )}

          <motion.div variants={line}>
            <EyeFollowButton
              onClick={() =>
                transitionTo(`/projects/${project.slug}`, {
                  color: project.color,
                  title: project.title,
                  category: project.category,
                })
              }
              className="mt-4 self-start"
            >
              View Full Project
            </EyeFollowButton>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
