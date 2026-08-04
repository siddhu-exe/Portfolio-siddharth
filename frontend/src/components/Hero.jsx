import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import Signature from './Signature.jsx';
import MenuPill from './MenuPill.jsx';
import CursorBadge from './CursorBadge.jsx';
import CyclingTypewriter from './CyclingTypewriter.jsx';
import CursorProximityText from './CursorProximityText.jsx';

const CURSOR_PHRASES = ['hey there?', 'Curious?', 'Explore My Library ↓'];

const EASE = [0.76, 0, 0.24, 1];

gsap.registerPlugin(useGSAP, SplitText);

/**
 * Intro sequence:
 *  intro -> signature draws itself while side lines extend in from the edges
 *  lift  -> signature block shrinks and rides up to the top of the viewport
 *  hero  -> main hero text staggers in, then the menu pill
 * After the intro, a blue "Hey there!" badge follows the cursor over the hero
 * (typed out with a blinking caret), mirroring the reference site.
 */
export default function Hero({ sinkStyle, onIntroComplete, skipIntro = false }) {
  const [phase, setPhase] = useState(skipIntro ? 'hero' : 'intro');
  const [cursorOn, setCursorOn] = useState(false);
  const [cursorSequenceComplete, setCursorSequenceComplete] = useState(false);
  const heroTextRef = useRef(null);
  const leftLabelRef = useRef(null);
  const headlineRef = useRef(null);
  const rightLabelRef = useRef(null);
  const menuRef = useRef(null);
  const proximityRef = useRef(null);
  const introCompleteRef = useRef(false);

  useEffect(() => {
    // Skip the intro entirely when returning from a project — start on 'hero'.
    if (skipIntro) return;
    // Signature draw takes ~2.4s; a short beat, then lift.
    const t = setTimeout(() => setPhase((p) => (p === 'intro' ? 'lift' : p)), 3100);
    return () => clearTimeout(t);
  }, [skipIntro]);

  useGSAP(
    () => {
      if (phase !== 'hero') return;

      const splits = [
        SplitText.create(leftLabelRef.current, { type: 'words', wordsClass: 'inline-block' }),
        SplitText.create(headlineRef.current, { type: 'chars', charsClass: 'inline-block' }),
        SplitText.create(rightLabelRef.current, { type: 'words', wordsClass: 'inline-block' }),
      ];
      const [leftSplit, headlineSplit, rightSplit] = splits;
      const units = [...leftSplit.words, ...headlineSplit.chars, ...rightSplit.words];
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) {
        gsap.set([...units, menuRef.current], { yPercent: 0, opacity: 1 });
        if (!introCompleteRef.current) {
          introCompleteRef.current = true;
          onIntroComplete?.();
        }
        return () => splits.forEach((split) => split.revert());
      }

      gsap.set(units, { yPercent: 110, opacity: 0 });
      gsap.set(menuRef.current, { y: 24, opacity: 0 });

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          proximityRef.current?.activate(headlineSplit.chars);
          if (!introCompleteRef.current) {
            introCompleteRef.current = true;
            onIntroComplete?.();
          }
        },
      });
      timeline
        .to(leftSplit.words, { yPercent: 0, opacity: 1, duration: 0.3, stagger: 0.035 })
        .to(
          headlineSplit.chars,
          { yPercent: 0, opacity: 1, duration: 0.42, stagger: 0.018 },
          0.16,
        )
        .to(
          rightSplit.words,
          { yPercent: 0, opacity: 1, duration: 0.28, stagger: 0.03 },
          0.76,
        )
        .to(menuRef.current, { y: 0, opacity: 1, duration: 0.28 }, 0.82);

      return () => {
        proximityRef.current?.deactivate();
        timeline.kill();
        splits.forEach((split) => split.revert());
      };
    },
    { scope: heroTextRef, dependencies: [phase, onIntroComplete] },
  );

  return (
    <section
      className="relative h-[100dvh] overflow-hidden md:h-screen"
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

      <motion.div className="absolute inset-0" style={sinkStyle}>
        {/* Signature block: starts centered, lifts to the top on phase change */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            className="flex w-full flex-col items-center"
            animate={
              phase === 'intro'
                ? { y: 0, scale: 1 }
                : { y: '-40vh', scale: 0.38 }
            }
            transition={{ duration: 0.95, ease: EASE }}
            onAnimationComplete={() => {
              if (phase === 'lift') setPhase('hero');
            }}
          >
            <div className="flex w-full items-center">
              <motion.div
                className="h-px flex-1 origin-left bg-ink/30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2.1, ease: 'easeInOut' }}
              />
              <Signature className="w-[min(64vw,460px)] shrink-0 md:w-[min(46vw,460px)]" />
              <motion.div
                className="h-px flex-1 origin-right bg-ink/30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2.1, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </div>

        {/* Main hero text, staggered bottom-to-top / left-to-right */}
        {phase === 'hero' && (
          <div
            ref={heroTextRef}
            className="absolute inset-0 flex flex-col justify-start pt-[32vh] px-5 md:justify-center md:pt-24 md:px-16"
          >
            <div className="mb-4 overflow-hidden md:mb-6">
              <p
                ref={leftLabelRef}
                className="text-left text-[0.72rem] font-light uppercase leading-snug tracking-[0.2em] text-ink/70 md:text-base md:tracking-[0.35em]"
              >
                SIDDHARTH DONGARDIVE
              </p>
            </div>

            <div className="overflow-hidden">
              <h1
                ref={headlineRef}
                className="text-center font-display text-[8.5vw] font-bold leading-[1.02] tracking-tight text-ink md:text-[8.5vw] md:leading-[0.95] lg:text-[7vw]"
              >
                <span className="block whitespace-nowrap">TURNING DATA</span>
                <span className="block whitespace-nowrap">INTO INTELLIGENCE</span>
              </h1>
            </div>

            <div className="mt-4 overflow-hidden md:mt-6">
              <p
                ref={rightLabelRef}
                className="text-right text-[0.72rem] font-light uppercase leading-snug tracking-[0.2em] text-ink/70 md:text-base md:tracking-[0.35em]"
              >
                AI Engineer • Data Scientist
              </p>
            </div>

            <div ref={menuRef} className="mt-8 md:mt-16">
              <MenuPill />
            </div>

            <CursorProximityText ref={proximityRef} />
          </div>
        )}
      </motion.div>
    </section>
  );
}
