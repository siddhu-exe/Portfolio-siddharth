import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValueEvent } from 'framer-motion';
import Signature from './Signature.jsx';
import MaskedRevealText from './MaskedRevealText.jsx';
import { SITE_EMAIL, SITE_MAILTO } from '../data/site.js';
import { GITHUB_URL, LINKEDIN_URL } from '../data/siteLinks.js';

const SOCIALS = [
  { label: 'GitHub', href: GITHUB_URL },
  { label: 'LinkedIn', href: LINKEDIN_URL },
];

/**
 * Fixed to the viewport bottom BEHIND the page (z-0 vs main's z-10). The page
 * content scrolls up and off it, and as it does the footer's content RISES from
 * bottom to top (via `riseStyle`, driven by Home's reveal window) and fades in
 * — so the footer animates as part of the final transition instead of sitting
 * there static (juanmora.co style).
 */
export default function Footer({ onReachOut, panelStyle, riseStyle }) {
  const [time, setTime] = useState('');
  // Draw the signature only when the name block scrolls into view, so the
  // stroke animation plays as the footer is revealed (not invisibly on load).
  const sigRef = useRef(null);
  const sigInView = useInView(sigRef, { once: true, margin: '-10%' });
  const creamRef = useRef(null);
  const creamInView = useInView(creamRef, { once: true, margin: '-10%' });

  // Fade the fixed Menu pill out while the footer's top bar is on screen (the
  // rise opacity passes 0.5 once the revealed panel covers that corner). CSS
  // in index.css does the fade via a data attribute on <html>.
  useMotionValueEvent(riseStyle.opacity, 'change', (v) => {
    document.documentElement.dataset.footerBar = v > 0.5 ? 'in' : 'out';
  });
  useEffect(() => () => document.documentElement.removeAttribute('data-footer-bar'), []);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
    const update = () => setTime(formatter.format(new Date()).toUpperCase());
    update();
    const id = window.setInterval(update, 60000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <motion.footer
      style={{
        // Explicit initial clip-path so the FIRST paint is already fully
        // hidden. panelStyle is a framer-motion useTransform value that isn't
        // written to the DOM until the first frame after mount / first scroll —
        // without this fallback, some (slower) phones paint the un-clipped
        // mustard footer over the page for a frame on load (the "black/yellow
        // box on load" glitch). The transform overrides this the moment it runs.
        clipPath: 'inset(0% 7% 100% 7% round 0px 0px 48px 48px)',
        ...panelStyle,
      }}
      className="fixed bottom-0 left-0 z-20 flex h-[100dvh] w-full flex-col overflow-hidden bg-mustard will-change-[clip-path] md:h-screen"
    >
      {/* denser dot grid on yellow */}
      <div
        aria-hidden
        className="absolute inset-0 [background-image:radial-gradient(rgba(23,23,23,0.16)_1.5px,transparent_1.5px)] [background-size:26px_26px]"
      />

      {/* content rises bottom→top as the footer is revealed */}
      <motion.div style={{ opacity: 0, ...riseStyle }} className="relative flex min-h-0 flex-1 flex-col">
      <div className="relative flex min-h-0 flex-1 flex-col px-8 pt-6 md:px-16">
        {/* top bar: socials + email */}
        <div className="flex flex-col items-start gap-2 text-[11px] font-semibold uppercase tracking-widest text-ink/70 md:flex-row md:items-center md:justify-between md:gap-0 md:text-xs">
            <div className="flex flex-row gap-4 md:gap-6">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">
                  {s.label}
                </a>
              ))}
            </div>
            <a href={SITE_MAILTO} className="transition-colors hover:text-ink">
              {SITE_EMAIL}
            </a>
          </div>

        {/* ghost name with the signature floating over it — masked line reveal */}
        <div ref={sigRef} className="relative flex min-h-0 max-h-[38vh] flex-1 items-center justify-center md:max-h-none">
          <MaskedRevealText
            as="h2"
            inView={sigInView}
            lines={['SIDDHARTH', 'DONGARDIVE']}
            className="font-display select-none text-center font-bold leading-[0.95] tracking-headline text-[#E0C336]"
            lineClassName="text-[11vw]"
          />
          <Signature play={sigInView} className="absolute w-[200px] md:w-[300px]" />
        </div>
      </div>

      {/* cream strip */}
      <div ref={creamRef} className="relative border-t border-ink/15 bg-cream px-8 py-7 md:px-16 md:py-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <MaskedRevealText
              as="h3"
              inView={creamInView}
              lines={['LIBRARY', 'CLOSED']}
              className="font-display text-3xl font-bold leading-[1.02] tracking-headline text-ink md:text-5xl"
            />
            <MaskedRevealText
              as="p"
              inView={creamInView}
              lines={['Until the next project.']}
              className="mt-4 text-sm text-ink/70 md:text-base"
            />
          </div>

          {/* big CTA — the footer's primary call to action, centered */}
          <a
            href={SITE_MAILTO}
            className="footer-cta group inline-flex flex-wrap items-baseline gap-x-3 md:justify-center"
          >
            <span className="footer-cta-line font-display text-4xl font-bold leading-[0.95] tracking-headline text-ink md:text-5xl">
              Let&rsquo;s build
            </span>
            <span className="font-display text-4xl font-bold italic leading-[0.95] tracking-headline text-[#B5533C] md:text-5xl">
              something<span className="footer-cta-arrow ml-[0.25em] inline-block">&rarr;</span>
            </span>
          </a>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <span className="text-sm text-ink/60">Reach out</span>
            <div className="flex gap-3">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink/30 text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
                </svg>
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink/30 text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S.02 4.88.02 3.5 1.13 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4v15h-4V8zm7.5 0h3.8v2.05h.06c.53-1 1.82-2.05 3.75-2.05 4.01 0 4.75 2.64 4.75 6.07V23h-4v-7.9c0-1.88-.03-4.3-2.62-4.3-2.62 0-3.02 2.05-3.02 4.17V23H8V8z" />
                </svg>
              </a>
              <button
                onClick={onReachOut}
                aria-label="Send a message"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink/30 text-xl font-bold text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                @
              </button>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-1.5 border-t border-ink/10 pt-4 text-xs font-medium text-ink/60 md:flex-row md:items-center md:justify-between">
          <a
            href="https://www.nithinmwarrier.com/"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-ink"
          >
            Inspired by <span className="font-bold text-ink/80">Nithin M Warrier</span>
          </a>
          <span>© {new Date().getFullYear()} Siddharth Dongardive</span>
          <span>Mumbai, IN &middot; {time}</span>
          <span>
            Created with <span className="font-bold text-ink/80">Claude Code</span>
          </span>
        </div>
      </div>
      </motion.div>
    </motion.footer>
  );
}
