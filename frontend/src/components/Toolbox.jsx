import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import { scrollToSection } from './SmoothScroll.jsx';
import { NEXT_TOOL, TOOL_DRAWERS, monogramOf, toolCount } from '../data/tools.js';

gsap.registerPlugin(SplitText, useGSAP);

const TITLE_DELAY = 0.15; // eyebrow goes first, title follows
const pad = (n) => String(n).padStart(2, '0');

// Runs `cb` once, the first time `el` is on screen above the bottom `inset`
// (a fraction of the viewport). This watches the element's live position, not a
// measured scroll offset: the section sits inside PinnedCurtainChain, where pin
// spacers and the curtain transform make ScrollTrigger start positions unreliable.
function onceVisible(el, inset, cb) {
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      cb();
    },
    { rootMargin: `0px 0px -${Math.round(inset * 100)}% 0px` }
  );
  io.observe(el);
  return () => io.disconnect();
}

function goToShelf(e) {
  e?.preventDefault();
  scrollToSection('shelf');
}

/**
 * "02 — The Workshop": four drawers of tools. All content comes from
 * src/data/tools.js. Laptop (>= 1024px) and phone (< 1024px) share one tree;
 * the differences (columns vs stack, list rows vs 2-col cards) are CSS in
 * index.css (.tb-*).
 *
 * Transform ownership: GSAP only touches the outer wrappers (header pieces,
 * drawer head, rule, the <li> of each tool); hover / focus lives on the inner
 * <a> and its tile via CSS, so the two never share an element.
 */
export default function Toolbox() {
  const sectionRef = useRef(null);
  const tools = toolCount();
  const drawers = TOOL_DRAWERS.length;

  useGSAP(
    () => {
      const section = sectionRef.current;
      const mm = gsap.matchMedia();

      // Nothing here runs under prefers-reduced-motion: the CSS rest state is
      // the final state, so everything is simply shown (numbers included).
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 1024px)' },
        (ctx) => {
          const { motion, wide } = ctx.conditions;
          // the callback runs when ANY condition matches, so gate on motion explicitly
          if (!motion) return undefined;
          const q = (sel, root = section) => [...root.querySelectorAll(sel)];
          const eyebrow = section.querySelector('[data-tb="eyebrow"]');
          const title = section.querySelector('[data-tb="title"]');
          const side = section.querySelector('[data-tb="side"]');
          const header = section.querySelector('[data-tb="header"]');
          const counters = q('[data-count]');
          const drawerEls = q('[data-tb="drawer"]');

          // Counters count up once, writing into the text React rendered.
          const countUps = counters.map((el) => {
            const target = Number(el.dataset.count);
            const o = { v: 0 };
            el.textContent = '0';
            return gsap.to(o, {
              v: target,
              duration: 1.1,
              ease: 'power2.out',
              paused: true,
              onUpdate: () => {
                el.textContent = String(Math.round(o.v));
              },
              onComplete: () => {
                el.textContent = String(target);
              },
            });
          });

          // One entrance timeline for a drawer: head + rule together, then its
          // tool rows fading up. Starts at `at` inside `tl`.
          const drawerIn = (tl, drawer, at) => {
            const head = drawer.querySelector('[data-tb="dhead"]');
            const rule = drawer.querySelector('[data-tb="rule"]');
            const rows = q('[data-tb="tool"]', drawer);
            tl.from(head, { y: 14, opacity: 0, duration: 0.55, ease: 'power3.out' }, at)
              .from(rule, { scaleX: 0, duration: 0.7, ease: 'power3.inOut' }, at)
              .from(rows, { y: 14, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out' }, at + 0.55);
          };

          // Title: SplitText lines in a mask. autoSplit re-splits once webfonts
          // load so line breaks stay right; the tween is returned so it is
          // reverted with the split.
          let entered = false;
          let titleTween = null;
          const split = SplitText.create(title, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit(self) {
              titleTween = gsap.from(self.lines, {
                yPercent: 110,
                duration: 0.9,
                stagger: 0.12,
                ease: 'power4.out',
                delay: TITLE_DELAY,
                paused: !entered,
              });
              return titleTween;
            },
          });

          const stops = [];
          const intro = gsap.timeline({ paused: true });
          intro.from(eyebrow, { y: 12, opacity: 0, duration: 0.6, ease: 'power3.out' }, 0);
          intro.from(side, { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out' }, 0.45);
          intro.add(() => countUps.forEach((t) => t.play()), 0.45);

          const playHeader = () => {
            entered = true;
            intro.play();
            titleTween?.play();
          };

          if (wide) {
            // Laptop: header, then the drawers left to right, one trigger.
            drawerEls.forEach((d, i) => drawerIn(intro, d, 0.8 + i * 0.14));
            stops.push(onceVisible(section, 0.35, playHeader));
          } else {
            // Phone: drawers are stacked far apart, so each one enters on its own.
            stops.push(onceVisible(header, 0.15, playHeader));
            drawerEls.forEach((d) => {
              const tl = gsap.timeline({ paused: true });
              drawerIn(tl, d, 0);
              stops.push(onceVisible(d, 0.12, () => tl.play()));
            });
          }

          return () => {
            stops.forEach((stop) => stop());
            split.revert();
            counters.forEach((el) => {
              el.textContent = el.dataset.count;
            });
          };
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="toolbox"
      aria-labelledby="tb-title"
      className="tb grain relative flex flex-col overflow-hidden font-grotesk lg:min-h-[100dvh]"
    >
      {/* transition in: the cream shelf tears down into the espresso */}
      <svg
        viewBox="0 0 1440 70"
        preserveAspectRatio="none"
        aria-hidden
        className="relative z-10 block h-6 w-full shrink-0 text-cream md:h-9"
      >
        <path
          fill="currentColor"
          d="M0,0 L1440,0 L1440,30 C 1400,42 1360,26 1320,36 C 1280,46 1240,28 1200,34
             C 1160,40 1120,50 1080,40 C 1040,30 1000,26 960,34 C 920,42 880,48 840,38
             C 800,28 760,26 720,32 C 680,38 640,50 600,42 C 560,34 520,26 480,32
             C 440,38 400,48 360,40 C 320,32 280,26 240,34 C 200,42 160,50 120,40
             C 80,30 40,28 0,36 Z"
        />
      </svg>

      <div className="tb-main relative">
        <div className="tb-group">
          <header data-tb="header" className="tb-header">
            <div>
              <p data-tb="eyebrow" className="tb-eyebrow text-terracotta">
                02 &mdash; THE WORKSHOP
              </p>
              <h2 id="tb-title" data-tb="title" className="tb-title">
                Tools behind
                <br />
                <em>every chapter.</em>
              </h2>
            </div>
            <div data-tb="side" className="tb-side">
              <p className="tb-sub">
                The technologies that bring these ideas to life, sorted by what they do
                <span className="hidden lg:inline"> in a project</span>.
              </p>
              <div className="tb-stats">
                <span>
                  <b data-count={tools}>{tools}</b> TOOLS
                </span>
                <span>
                  <b data-count={drawers}>{drawers}</b> DRAWERS
                </span>
              </div>
            </div>
          </header>

          <div className="tb-drawers">
            {TOOL_DRAWERS.map((d) => (
              <div
                key={d.key}
                data-tb="drawer"
                className="tb-drawer"
                style={{ '--tb-tile': d.tile, '--tb-label': d.label }}
              >
                <div data-tb="dhead" className="tb-dhead">
                  <div className="tb-dlabelrow">
                    <span className="tb-dlabel">
                      {d.key} · {d.name}
                    </span>
                    <span className="tb-dcount">{pad(d.tools.length)}</span>
                  </div>
                  <p className="tb-ddesc">
                    <span className="lg:hidden">{d.short}</span>
                    <span className="hidden lg:inline">{d.desc}</span>
                  </p>
                </div>
                <div data-tb="rule" className="tb-rule" />
                <ul className="tb-tools">
                  {d.tools.map((t) => (
                    <li key={t.name} data-tb="tool">
                      <a
                        href="#shelf"
                        className="tb-tool"
                        aria-label={`${t.name} — see it on the shelf`}
                        onClick={goToShelf}
                      >
                        <span className="tb-tile" aria-hidden>
                          {monogramOf(t)}
                        </span>
                        <span className="tb-name">{t.name}</span>
                        <svg
                          className="tb-go"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Laptop: both halves. Phone: only "currently learning". */}
          {/* With no NEXT_TOOL the phone has nothing to show, so .tb-foot--solo hides the row there. */}
          <div className={`tb-foot${NEXT_TOOL ? '' : ' tb-foot--solo'}`}>
            <button type="button" className="tb-foot-link hidden lg:block" onClick={goToShelf}>
              SEE THEM IN ACTION ON THE SHELF ↑
            </button>
            {NEXT_TOOL ? (
              <span>
                CURRENTLY LEARNING · <span className="text-terracotta">{NEXT_TOOL}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
