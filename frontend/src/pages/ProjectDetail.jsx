import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ProjectPage from '../components/project/ProjectPage.jsx';
import { usePageTransition } from '../components/PageTransition.jsx';
import { jumpToSection } from '../components/SmoothScroll.jsx';
import useShelfBooks from '../hooks/useShelfBooks.js';
import { buildProjectPage } from '../data/projectPage.js';

/** /projects/:slug — the case-study "inside the book" page (see components/project). */
export default function ProjectDetail() {
  const { slug } = useParams();
  const transitionTo = usePageTransition();
  const books = useShelfBooks();
  const page = useMemo(() => buildProjectPage(slug, books), [slug, books]);

  // Every volume opens at the top. Goes through Lenis (it keeps its own scroll target, so a
  // bare window.scrollTo gets pulled back) and is instant (the html element smooth-scrolls).
  useLayoutEffect(() => {
    jumpToSection('top');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    if (!page) return undefined;
    const previous = document.title;
    document.title = `${page.title} — Siddharth Dongardive`;
    return () => {
      document.title = previous;
    };
  }, [page?.title]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!page) {
    return (
      <main className="dot-grid flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-8 text-center">
        <h1 className="text-4xl font-bold tracking-headline text-ink">Chapter not found</h1>
        <button
          onClick={() =>
            transitionTo('/', { color: '#171717', title: 'Back to the Library', category: 'The Library', landAt: 'shelf' })
          }
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:scale-105"
        >
          &larr; Back to the Library
        </button>
      </main>
    );
  }

  // key: a new slug (prev/next volume) remounts the page so motion + scroll state start fresh.
  return <ProjectPage key={slug} page={page} />;
}
