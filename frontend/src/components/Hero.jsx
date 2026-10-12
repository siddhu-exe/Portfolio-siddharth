import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';
import Signature from './Signature.jsx';
import MenuPill from './MenuPill.jsx';
import CursorBadge from './CursorBadge.jsx';
import CyclingTypewriter from './CyclingTypewriter.jsx';
import CursorProximityText from './CursorProximityText.jsx';
import { scrollToSection } from './SmoothScroll.jsx';
import { RESUME_HREF } from '../data/siteLinks.js';

const CURSOR_PHRASES = ['hey there?', 'Curious?', 'Explore My Library ↓'];

const LAPTOP_QUERY = '(min-width: 1024px)';
const INTRO_HOLD_S = 3.1; // signature draw (~2.4s) + a beat, then glide to the header
const LIFT_S = 0.95;
const LINE_FINAL_OPACITY = 0.67; // bg-ink/30 line -> the design's ink/20 hairline

gsap.registerPlugin(useGSAP, SplitText, CustomEase);
const LIFT_EASE = CustomEase.create('heroLift', '0.76, 0, 0.24, 1');

/**
 * Intro sequence:
 *  intro -> signature draws itself while side lines extend in from the edges
 *  lift  -> the SAME signature element glides (measured x/y/scale) into its
 *           resting slot in the header; the side lines contract into the two
 *           short lines beside it (laptop) or fade out (mobile)
 *  hero  -> eyebrow, headline, intro line, CTAs, then menu pill + bottom row
 * After the intro, a blue "Hey there!" badge follows the cursor over the hero
 * (typed out with a blinking caret), mirroring the reference site.
 *
 * GSAP owns the outer wrappers (signature, line wrappers, text blocks, menu
 * wrapper); framer-motion owns the inner draw-in transforms.
 */
export default function Hero({ sinkStyle, onIntroComplete, skipIntro = false, volumes }) {
  const [cursorOn, setCursorOn] = useState(false);
  const [cursorSequenceComplete, setCursorSequenceComplete] = useState(false);
  // Returning visitors + reduced motion land straight in the final state.
  const [instant] = useState(
    () => skipIntro || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const stageRef = useRef(null);
  const sigRef = useRef(null);
  const lineLRef = useRef(null);
  const lineRRef = useRef(null);
  const slotSigRef = useRef(null);
  const slotLineLRef = useRef(null);
  const slotLineRRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headMaskRef = useRef(null);
  const headlineRef = useRef(null);
  const introRef = useRef(null);
  const ctaRef = useRef(null);
  const bottomRef = useRef(null);
  const menuRef = useRef(null);
  const proximityRef = useRef(null);
  const onCompleteRef = useRef(onIntroComplete);
  onCompleteRef.current = onIntroComplete;

  useGSAP(
    (_ctx, contextSafe) => {
      const stage = stageRef.current;
      const sig = sigRef.current;
      const lines = [lineLRef.current, lineRRef.current];
      const slotLines = [slotLineLRef.current, slotLineRRef.current];
      const isLaptop = () => window.matchMedia(LAPTOP_QUERY).matches;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const blocks = [
        eyebrowRef.current,
        headMaskRef.current,
        introRef.current,
        ctaRef.current,
        bottomRef.current,
        menuRef.current,
      ];
      let split = null;
      let landed = false;
      let completed = false;
      let timeline = null;
      let rafId = 0;

      /** Where the signature (+ lines) must sit to be "landed", in stage-local px. */
      const measureFinal = () => {
        gsap.set([sig, ...lines], { clearProps: 'transform' });
        // The stage can be mid scale-down (hero sink on scroll): undo it so the
        // deltas stay in the stage's own coordinate space.
        const k = stage.getBoundingClientRect().width / stage.offsetWidth || 1;
        const s = sig.getBoundingClientRect();
        const f = slotSigRef.current.getBoundingClientRect();
        const target = {
          sig: {
            x: (f.left + f.width / 2 - (s.left + s.width / 2)) / k,
            y: (f.top + f.height / 2 - (s.top + s.height / 2)) / k,
            scale: f.width / s.width,
          },
          lines: null,
        };
        if (isLaptop()) {
          target.lines = lines.map((el, i) => {
            const l = el.getBoundingClientRect();
            const fl = slotLines[i].getBoundingClientRect();
            return {
              x: (fl.left - l.left) / k,
              y: (fl.top + fl.height / 2 - (l.top + l.height / 2)) / k,
              scaleX: fl.width / l.width,
            };
          });
        }
        return target;
      };

      const placeFinal = () => {
        const t = measureFinal();
        gsap.set(sig, { ...t.sig, transformOrigin: '50% 50%' });
        if (t.lines) {
          lines.forEach((el, i) =>
            gsap.set(el, { ...t.lines[i], transformOrigin: '0% 50%', autoAlpha: LINE_FINAL_OPACITY }),
          );
        } else {
          gsap.set(lines, { autoAlpha: 0 });
        }
      };

      const finish = () => {
        proximityRef.current?.activate(split?.chars);
        // Let the hover-scaled letters overshoot the reveal mask.
        gsap.set(headMaskRef.current, { overflow: 'visible' });
        if (!completed) {
          completed = true;
          onCompleteRef.current?.();
        }
      };

      const showAll = () => {
        gsap.set(blocks, { autoAlpha: 1, y: 0 });
        if (!reduceMotion) {
          split = SplitText.create(headlineRef.current, { type: 'chars', charsClass: 'inline-block' });
        }
        finish();
      };

      const reveal = contextSafe(() => {
        split = SplitText.create(headlineRef.current, { type: 'chars', charsClass: 'inline-block' });
        gsap.set(split.chars, { yPercent: 110, opacity: 0 });
        const rise = { autoAlpha: 0, y: 18 };
        const settle = { autoAlpha: 1, y: 0, duration: 0.5 };
        timeline = gsap
          .timeline({ defaults: { ease: 'power3.out' }, onComplete: finish })
          .fromTo(eyebrowRef.current, rise, settle, 0)
          .set(headMaskRef.current, { autoAlpha: 1 }, 0.12)
          .to(split.chars, { yPercent: 0, opacity: 1, duration: 0.42, stagger: 0.016 }, 0.12)
          .fromTo(introRef.current, rise, settle, 0.36)
          .fromTo(ctaRef.current, rise, settle, 0.48)
          .fromTo(
            [menuRef.current, bottomRef.current],
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.5 },
            0.62,
          );
      });

      const lift = contextSafe(() => {
        const t = measureFinal();
        timeline = gsap.timeline({
          defaults: { duration: LIFT_S, ease: LIFT_EASE },
          onComplete: () => {
            landed = true;
            placeFinal(); // re-measure in case the viewport changed mid-flight
            reveal();
          },
        });
        timeline.to(sig, { ...t.sig, transformOrigin: '50% 50%' }, 0);
        if (t.lines) {
          lines.forEach((el, i) =>
            timeline.to(
              el,
              { ...t.lines[i], transformOrigin: '0% 50%', opacity: LINE_FINAL_OPACITY },
              0,
            ),
          );
        } else {
          timeline.to(lines, { opacity: 0, duration: 0.45, ease: 'power2.out' }, 0);
        }
      });

      const onResize = contextSafe(() => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (landed) placeFinal();
        });
      });
      window.addEventListener('resize', onResize);

      // Everything below the signature starts hidden; the signature itself is
      // either mid-intro (centered) or already in its slot.
      gsap.set(blocks, { autoAlpha: 0 });
      let hold = null;
      if (instant) {
        landed = true;
        placeFinal();
        showAll();
      } else {
        hold = gsap.delayedCall(INTRO_HOLD_S, lift);
      }

      return () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(rafId);
        hold?.kill();
        timeline?.kill();
        proximityRef.current?.deactivate();
        split?.revert();
      };
    },
    { scope: stageRef, dependencies: [] },
  );

  const goShelf = (event) => {
    event.preventDefault();
    scrollToSection('shelf');
  };

  return (
    <>
      <section
        className="relative h-[100svh] overflow-hidden font-grotesk text-ink"
        onMouseEnter={() => setCursorOn(true)}
        onMouseLeave={() => setCursorOn(false)}
      >
        {/* Cursor badge runs from the moment the signature starts drawing,
            cycling through its phrases as the mouse moves over the hero. */}
        <CursorBadge
          active={cursorOn && !cursorSequenceComplete}
          centered={false}
          className="h-14 whitespace-nowrap bg-[#37ACE8] px-5 text-base text-white"
        >
          <CyclingTypewriter
            phrases={CURSOR_PHRASES}
            run={cursorOn}
            onComplete={() => setCursorSequenceComplete(true)}
          />
        </CursorBadge>

        <motion.div ref={stageRef} className="absolute inset-0" style={sinkStyle}>
          {/* Invisible measuring slots: where the signature + its two lines land. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[18px] flex h-14 items-center px-7 md:px-16 lg:top-7 lg:h-16 lg:justify-center lg:px-[88px]"
          >
            <span ref={slotLineLRef} className="hidden h-px w-[120px] shrink-0 lg:block" />
            <span
              ref={slotSigRef}
              className="-ml-1 block h-16 w-[163px] shrink-0 lg:ml-0 lg:h-[84px] lg:w-[214px]"
            />
            <span ref={slotLineRRef} className="hidden h-px w-[120px] shrink-0 lg:block" />
          </div>

          {/* Signature block: starts centered (intro), then glides into the slots */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex w-full items-center">
              <div ref={lineLRef} className="flex-1">
                <motion.div
                  className="h-px w-full origin-left bg-ink/30"
                  initial={instant ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2.1, ease: 'easeInOut' }}
                />
              </div>
              <div ref={sigRef} className="shrink-0">
                <Signature
                  instant={instant}
                  className="block w-[min(64vw,460px)] md:w-[min(46vw,460px)]"
                />
              </div>
              <div ref={lineRRef} className="flex-1">
                <motion.div
                  className="h-px w-full origin-right bg-ink/30"
                  initial={instant ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2.1, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </div>

          {/* Hero copy — mounted from the start, revealed once the signature lands */}
          <div className="absolute inset-0 flex flex-col justify-center px-7 pb-16 pt-24 md:px-16 lg:items-center lg:px-[88px] lg:pb-24 lg:pt-28 lg:text-center">
            <p
              ref={eyebrowRef}
              className="text-[11px] uppercase tracking-[3.5px] text-umber-mid lg:text-[13px] lg:tracking-[5px]"
            >
              SIDDHARTH DONGARDIVE
            </p>

            {/* Reveal mask. Font size lives here so the padding (italic overhang,
                the "g" descender) scales with the type. */}
            <div
              ref={headMaskRef}
              className="-mx-[0.1em] mb-[-0.14em] mt-5 overflow-hidden px-[0.1em] pb-[0.14em] pt-[0.04em] text-[length:min(56px,14.2vw)] lg:mt-[30px] lg:text-[length:clamp(64px,min(8.4vw,13.4svh),120px)]"
            >
              <h1
                ref={headlineRef}
                className="whitespace-nowrap font-display font-black leading-[0.93] tracking-[-0.017em] lg:leading-[0.92]"
              >
                TURNING <br className="lg:hidden" />
                DATA <br className="max-lg:hidden" />
                INTO <br className="lg:hidden" />
                <span className="font-bold italic tracking-[-0.026em] text-brick">Intelligence</span>
              </h1>
            </div>

            <p
              ref={introRef}
              className="mt-6 text-[16.5px] leading-[1.55] text-umber lg:mt-[34px] lg:max-w-[34ch] lg:text-[19px]"
            >
              AI engineer and data scientist building retrieval systems, forecasting models and ML
              products that work outside the notebook.
            </p>

            <div ref={ctaRef} className="mt-[30px] flex flex-col lg:mt-10 lg:flex-row lg:items-center lg:gap-7">
              <a
                href="#shelf"
                onClick={goShelf}
                className="flex h-[54px] items-center justify-center gap-2.5 rounded-full bg-ink px-[30px] text-[15px] font-bold tracking-[0.3px] text-cream transition-colors duration-200 hover:bg-brick lg:gap-3"
              >
                Explore the shelf
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </a>
              <div className="mt-2.5 flex justify-center lg:mt-0">
                <a
                  href={RESUME_HREF ?? '#'}
                  onClick={RESUME_HREF ? undefined : (event) => event.preventDefault()}
                  {...(RESUME_HREF ? { download: true } : {})}
                  className="inline-flex min-h-[44px] items-center text-sm font-semibold underline decoration-ink/35 underline-offset-[5px] transition-colors hover:text-brick lg:text-[15px]"
                >
                  Download résumé
                </a>
              </div>
            </div>

            <CursorProximityText ref={proximityRef} />
          </div>

          {/* Bottom row */}
          <div
            ref={bottomRef}
            className="absolute inset-x-0 bottom-7 flex items-end justify-between px-7 text-[12.5px] text-umber md:px-16 lg:bottom-9 lg:px-[88px] lg:text-[13px]"
          >
            <span className="inline-flex items-center gap-[7px] lg:gap-2">
              <span className="h-[7px] w-[7px] rounded-full bg-moss" aria-hidden="true" />
              Open to DS &amp; AI roles
            </span>
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2.5 lg:flex"
            >
              <span className="h-11 w-px bg-gradient-to-b from-ink/0 to-ink/50" />
              <span className="font-mono text-[10.5px] tracking-[2px] text-umber-soft">SCROLL</span>
            </span>
            <span>
              <span className="lg:hidden">Mumbai, IN</span>
              <span className="max-lg:hidden">Mumbai, India</span>
            </span>
          </div>
        </motion.div>
      </section>

      <MenuPill wrapperRef={menuRef} volumes={volumes} />
    </>
  );
}
