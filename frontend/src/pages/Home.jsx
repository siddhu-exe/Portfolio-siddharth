import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScroll, useTransform } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from '../components/Hero.jsx';
import Statement from '../components/Statement.jsx';
import ProjectShelf from '../components/ProjectShelf.jsx';
import Toolbox from '../components/Toolbox.jsx';
import ReadingCorner from '../components/ReadingCorner.jsx';
import Footer from '../components/Footer.jsx';
import PinnedCurtainChain from '../components/PinnedCurtainChain.jsx';
import ContactModal from '../components/ContactModal.jsx';
import BookmarkProgress from '../components/BookmarkProgress.jsx';
import { jumpToSection } from '../components/SmoothScroll.jsx';
import { fetchProjects } from '../api.js';
import { fallbackProjects } from '../data/fallbackProjects.js';

export default function Home() {
  // When returning from a project we land directly on the shelf and skip the
  // hero intro (see PageTransition / ProjectDetail goBack). Captured once on
  // mount so clearing the history state below can't change it mid-session.
  const location = useLocation();
  const navigate = useNavigate();
  const [skipIntro] = useState(() => location.state?.landAt === 'shelf');
  const [projects, setProjects] = useState([]);
  const [contactOpen, setContactOpen] = useState(false);
  const [introComplete, setIntroComplete] = useState(skipIntro);
  const statementRef = useRef(null);
  const contactRef = useRef(null);
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(() => setProjects(fallbackProjects));
  }, []);

  // Returning from a project: jump straight to the shelf while the route
  // transition cover is still closed over the screen, so the reveal opens on
  // the bookshelf instead of the hero. #shelf's offset is stable (hero +
  // statement have fixed heights), so this is valid before any GSAP pin runs.
  useEffect(() => {
    if (!skipIntro) return;
    // Drop the marker from history so a manual reload of "/" plays the intro.
    if (location.state?.landAt) navigate('.', { replace: true, state: null });
    let raf2;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        jumpToSection('shelf');
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [skipIntro]);

  // Stage transition #1: the hero is pinned (sticky) while the black
  // Statement section's stepped podium edge rises over it; the hero sinks and
  // fades in lockstep with the scroll.
  const { scrollYProgress } = useScroll({
    target: statementRef,
    offset: ['start end', 'start start'],
  });

  const heroSink = {
    // reduce delay so the hero transition begins a bit sooner on scroll
    y: useTransform(scrollYProgress, [0.12, 1], ['0vh', '45vh']),
    opacity: useTransform(scrollYProgress, [0.12, 0.9], [1, 0]),
    scale: useTransform(scrollYProgress, [0.12, 1], [1, 0.93]),
  };

  // Final transition: as the reveal window (#contact) scrolls up and uncovers
  // the footer, the footer's content RISES from bottom to top and fades in —
  // so the footer animates as part of the transition (juanmora.co style) rather
  // than sitting there static.
  const { scrollYProgress: revealProgress } = useScroll({
    target: contactRef,
    offset: ['start end', 'start start'],
  });

  const footerRise = {
    y: useTransform(revealProgress, [0.05, 1], ['60vh', '0vh']),
    opacity: useTransform(revealProgress, [0.1, 0.7], [0, 1]),
  };

  // Keep the footer reveal reading as a growing card through all three
  // stages. The lower corners only resolve to the viewport edges at the very
  // end of the existing one-screen handoff.
  const footerPanel = {
    clipPath: useTransform(
      revealProgress,
      [0, 0.08, 0.34, 0.72, 0.98, 1],
      [
        'inset(0% 7% 100% 7% round 0px 0px 48px 48px)',
        'inset(0% 7% 92% 7% round 0px 0px 48px 48px)',
        'inset(0% 5% 62% 5% round 0px 0px 48px 48px)',
        'inset(0% 2.5% 22% 2.5% round 0px 0px 40px 40px)',
        'inset(0% 0% 0% 0% round 0px 0px 32px 32px)',
        'inset(0% 0% 0% 0% round 0px)',
      ],
    ),
  };

  return (
    <>
      {/* Opaque page content, above the fixed footer. No background of its
          own — each section paints itself, so the stepped bottom edge can
          show the footer through its gaps. */}
      <main id="top" className="relative z-10">
        {/* The sticky hero is scoped to this wrapper: it stays pinned only
            while the Statement covers it, then releases. */}
        <div className="relative">
          <div className="dot-grid sticky top-0 z-10 h-[100dvh] md:h-[170vh] bg-cream">
            <Hero sinkStyle={heroSink} skipIntro={skipIntro} onIntroComplete={handleIntroComplete} />
          </div>
          <div ref={statementRef} className="relative z-30">
            <Statement />
          </div>
        </div>

        {/* Stage transitions #2 + #3, chained: Shelf pins while Toolbox
            curtains over it; Toolbox then pins (holding a dwell beat so a fast
            scroller actually sees it) while Reading Corner curtains over that.
            Each section is mounted exactly once and shared between the two
            transitions it participates in — no duplicate sections. */}
        <PinnedCurtainChain
          sections={[
            { node: <ProjectShelf projects={projects} /> },
            { node: <Toolbox /> },
            { node: <ReadingCorner />, dwellVh: 70, mode: 'scale' },
          ]}
        />
      </main>

      {/* Reveal window for the fixed footer underneath — also the scroll
          driver for the footer's rise-in animation. */}
      <div ref={contactRef} id="contact" className="relative h-screen bg-black" />
      <Footer
        panelStyle={footerPanel}
        riseStyle={footerRise}
        onReachOut={() => setContactOpen(true)}
      />

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <BookmarkProgress visible={introComplete} />
    </>
  );
}
