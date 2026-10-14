import { useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ARTICLES, ALL_ARTICLES_URL } from '../data/articles.js';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EASE = [0.22, 1, 0.36, 1];

// Hover / focus (lift, tilt, shadow, pill, dimming) is pure CSS in index.css
// (.rc-*), on the inner elements; GSAP only touches the outer .latest-read-item.
function ArticleBook({ article }) {
  return (
    <>
      <a
        href={article.url}
        target="_blank"
        rel="noreferrer"
        className="rc-book"
        aria-label={`Read "${article.title}" (${article.readTime})`}
      >
        <span className="rc-shadow" aria-hidden />
        <span className="rc-inner">
          {/* pages (right side) */}
          <span
            className="absolute right-0 top-0 block h-full w-5 rounded-r-sm bg-gradient-to-l from-[#efe7d8] to-[#cfc4ad]"
            style={{ transform: 'rotateY(90deg)', transformOrigin: 'right center' }}
            aria-hidden
          >
            <span className="block h-full w-full [background:repeating-linear-gradient(0deg,transparent_0,transparent_3px,rgba(0,0,0,0.12)_3px,rgba(0,0,0,0.12)_4px)]" />
          </span>

          {/* spine (left side) */}
          <span
            className="absolute left-0 top-0 flex h-full w-6 items-center justify-center rounded-l-sm"
            style={{ backgroundColor: article.color, transform: 'rotateY(-90deg)', transformOrigin: 'left center' }}
            aria-hidden
          >
            <span className="absolute inset-0 bg-black/30" />
            <span className="absolute inset-x-1 top-2 h-px bg-white/25" />
            <span className="absolute inset-x-1 bottom-2 h-px bg-white/25" />
            <span className="book-title relative max-h-[78%] overflow-hidden whitespace-nowrap text-[10px] font-semibold tracking-[0.12em] text-white/90">
              {article.title}
            </span>
          </span>

          {/* front cover: editorial jacket */}
          <span
            className="absolute inset-0 flex flex-col overflow-hidden rounded-l-sm rounded-r-md p-4"
            style={{ backgroundColor: article.color, backfaceVisibility: 'hidden' }}
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/25" />
            <span className="pointer-events-none absolute inset-0 opacity-20 [background:repeating-linear-gradient(45deg,transparent_0,transparent_3px,rgba(255,255,255,0.05)_3px,rgba(255,255,255,0.05)_4px)]" />
            <span className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/45 to-transparent" />
            <span className="pointer-events-none absolute inset-2.5 rounded-[4px] border border-white/25" />

            <span className="relative flex h-full flex-col p-1.5">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.3em] text-white/60">
                Article {String(article.number).padStart(2, '0')}
              </span>
              <span className="mt-2 block h-px w-8 bg-white/40" />

              <span className="mt-auto block">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-white/55">
                  {article.kicker}
                </span>
                <span className="mt-1.5 block text-[1.35rem] font-bold leading-[1.08] tracking-tight text-white">
                  {article.title}
                </span>
                <span className="mt-2 block text-[13.5px] leading-snug text-white/[.82]">{article.blurb}</span>
              </span>

              <span className="mt-3 block border-t border-white/20 pt-2 font-display text-[11px] italic tracking-[0.1em] text-white/70">
                Siddharth Dongardive
              </span>
            </span>
          </span>
        </span>
      </a>
      <span className="rc-pill" aria-hidden>
        {article.readTime} &middot; Read &rarr;
      </span>
    </>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/**
 * Mobile-only Reading Corner: a vertical timeline of articles. Each node is a
 * terracotta dot on a connecting line; tapping a row expands its blurb + read
 * time + a "Read ↗" link (single-open accordion, first item open by default).
 * This replaces the 3D book row on phones, where the hover-driven lift/face-on
 * effect never fires. Desktop keeps the books unchanged.
 */
function ReadingTimeline({ articles }) {
  const [openIndex, setOpenIndex] = useState(0);
  const uid = useId();

  return (
    <ul className="relative mx-auto max-w-md">
      {/* the connecting line running through the dots */}
      <span
        aria-hidden
        className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-terracotta/70 via-terracotta/40 to-transparent"
      />
      {articles.map((a, i) => {
        const open = openIndex === i;
        return (
          <li key={a.title} className="relative pl-8">
            {/* node dot */}
            <span
              aria-hidden
              className="absolute left-0 top-[18px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-terracotta bg-[#15100C] transition-colors"
              style={open ? { backgroundColor: a.color, borderColor: a.color } : undefined}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta" style={open ? { backgroundColor: '#fff' } : undefined} />
            </span>

            <div className="border-b border-cream/10 py-1">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? -1 : i)}
                aria-expanded={open}
                aria-controls={`${uid}-panel-${i}`}
                className="flex min-h-[56px] w-full items-center justify-between gap-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-terracotta/90">
                    {a.kicker}
                  </span>
                  <span className="mt-0.5 block truncate text-lg font-bold leading-tight tracking-tight text-cream">
                    {a.title}
                  </span>
                </span>
                <motion.span
                  aria-hidden
                  animate={{ rotate: open ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="shrink-0 text-xl leading-none text-cream/70"
                >
                  +
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    key="panel"
                    id={`${uid}-panel-${i}`}
                    role="region"
                    aria-label={a.title}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="pt-2 text-sm leading-relaxed text-cream/70">{a.blurb}</p>
                    <div className="mt-3 flex items-center justify-between pb-3">
                      {a.readTime && (
                        <span className="text-[11px] font-medium uppercase tracking-widest text-cream/45">
                          {a.readTime}
                        </span>
                      )}
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-5 text-xs font-semibold text-black transition-transform active:scale-95"
                        style={{ backgroundColor: a.color, color: '#fff' }}
                        aria-label={`Read "${a.title}" on Medium`}
                      >
                        Read&nbsp;&#8599;
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function ReadingCorner() {
  const sectionRef = useRef(null);
  const listRef = useRef(null);

  useGSAP(
    () => {
      const articles = gsap.utils.toArray('.latest-read-item', listRef.current);
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) {
        gsap.set(articles, { opacity: 1, y: 0 });
        gsap.set('.rc-underline', { strokeDasharray: 'none' });
        return;
      }

      gsap.fromTo(
        '.rc-underline',
        { strokeDasharray: 1, strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.rc-underline', start: 'top 90%', once: true },
        },
      );

      gsap.fromTo(
        articles,
        { opacity: 0, y: -30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 80%',
            once: true,
          },
          onComplete: () => gsap.set(articles, { clearProps: 'transform,opacity' }),
        },
      );
    },
    { scope: sectionRef },
  );

  const allLink = ALL_ARTICLES_URL ? (
    <p className="mt-10 text-center md:mt-14">
      <a
        href={ALL_ARTICLES_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-[44px] items-center text-sm font-semibold tracking-wide text-cream/80 underline-offset-4 transition-colors hover:text-cream hover:underline focus-visible:text-cream focus-visible:underline"
      >
        All articles &rarr;
      </a>
    </p>
  ) : null;

  return (
    <section ref={sectionRef} id="reading" className="grain relative overflow-hidden bg-[#15100C] text-cream">
      {/* The Toolbox → Reading Corner seam is drawn by <ScrollMorphEdge> in
          Home.jsx (a velocity-reactive morphing curve), so there is no static
          edge here. Top padding below leaves room for that overlay. */}

      {/* faint dot grid (same as the Workshop) */}
      <div
        aria-hidden
        className="absolute inset-0 [background-image:radial-gradient(rgba(237,228,214,0.045)_1px,transparent_1px)] [background-size:18px_18px]"
      />

      <div className="relative px-6 pb-16 pt-10 md:px-16 md:pb-[120px] md:pt-14">
        <motion.header
          className="mx-auto mb-14 max-w-2xl text-center md:mb-20"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-terracotta md:text-sm">
            03 &mdash; The Reading Corner
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-cream md:text-6xl">Reading Corner</h2>
          <svg viewBox="0 0 220 12" className="mx-auto mt-4 w-40 text-terracotta">
            <path className="rc-underline" pathLength="1" d="M2 8 C 30 2, 50 10, 80 6 S 140 2, 218 6" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-cream/60 md:text-base">
            Sharing what I learn through articles, tutorials, and engineering insights.
          </p>
        </motion.header>

        {/* Mobile: vertical reading timeline (books' hover effect is dead on
            touch). Desktop keeps the 3D book shelf below. */}
        <div className="md:hidden">
          <ReadingTimeline articles={ARTICLES} />
          {allLink}
        </div>

        <div className="mx-auto hidden max-w-5xl md:block">
          <div ref={listRef} className="flex flex-wrap items-end justify-center gap-x-14 gap-y-16 md:gap-x-16">
            {ARTICLES.slice(0, 4).map((a) => (
              <div key={a.title} className="latest-read-item rc-item">
                <ArticleBook article={a} />
              </div>
            ))}
          </div>

          {/* wooden ledge the books stand on */}
          <div className="relative mt-3">
            <div className="h-2.5 rounded-[3px] border-t border-white/20 bg-gradient-to-b from-[#8B6F55] to-[#5E4936]" />
            <div className="absolute inset-x-10 top-full h-5 bg-black/80 blur-lg" />
          </div>
          {allLink}
        </div>
      </div>
    </section>
  );
}
