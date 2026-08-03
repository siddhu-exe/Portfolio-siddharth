import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Signature from './Signature.jsx';
import MaskedRevealText from './MaskedRevealText.jsx';

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/siddhu-exe' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/siddharth-dongardive-906a79251' },
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

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
    const update = () => setTime(formatter.format(new Date()));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <motion.footer
      style={panelStyle}
      className="fixed bottom-0 left-0 z-20 flex h-[100dvh] w-full flex-col overflow-hidden bg-mustard will-change-[clip-path] md:h-screen"
    >
      {/* denser dot grid on yellow */}
      <div
        aria-hidden
        className="absolute inset-0 [background-image:radial-gradient(rgba(23,23,23,0.16)_1.5px,transparent_1.5px)] [background-size:26px_26px]"
      />

      {/* content rises bottom→top as the footer is revealed */}
      <motion.div style={riseStyle} className="relative flex min-h-0 flex-1 flex-col">
      <div className="relative flex min-h-0 flex-1 flex-col px-8 pt-6 md:px-16">
        {/* top bar: socials + email */}
        <div className="flex flex-col items-start gap-2 text-[11px] font-semibold uppercase tracking-widest text-ink/70 md:flex-row md:items-center md:justify-between md:gap-0 md:text-xs">
            <div className="flex flex-col gap-2 md:flex-row md:gap-6">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">
                  {s.label}
                </a>
              ))}
            </div>
            <a href="mailto:dongardivedeepak17@gmail.com" className="transition-colors hover:text-ink">
              dongardivedeepak17@gmail.com
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
            href="mailto:dongardivedeepak17@gmail.com"
            className="group inline-flex flex-wrap items-baseline gap-x-3 md:justify-center"
          >
            <span className="font-display text-4xl font-bold leading-[0.95] tracking-headline text-ink md:text-5xl">
              Let&rsquo;s build
            </span>
            <span className="font-display text-4xl font-bold italic leading-[0.95] tracking-headline text-ink/40 transition-colors duration-300 group-hover:text-ink md:text-5xl">
              something&nbsp;&rarr;
            </span>
          </a>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <span className="text-sm text-ink/60">Reach out</span>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/siddharth_20_d/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink/30 text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/siddharth-dongardive-906a79251"
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
          <span>India {time}</span>
          <span>
            Created with <span className="font-bold text-ink/80">Claude Code</span>
          </span>
        </div>
      </div>
      </motion.div>
    </motion.footer>
  );
}
