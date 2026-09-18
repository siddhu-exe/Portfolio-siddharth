import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProject } from '../api.js';
import { fallbackProjects } from '../data/fallbackProjects.js';
import { usePageTransition } from '../components/PageTransition.jsx';
import ImageGallery from '../components/ImageGallery.jsx';

const EASE = [0.22, 1, 0.36, 1];

// Mirrors backend/data.py's _GALLERY_TEMPLATE so the offline fallback shows
// the same section structure (with placeholder-only images).
const GALLERY_TEMPLATE = [
  { key: 'architecture', heading: 'Architecture', subtitle: 'The complete system architecture, from data collection to prediction.', count: 1 },
  { key: 'pipeline', heading: 'Data Pipeline', subtitle: 'From raw football data to production-ready predictions.', count: 2 },
  { key: 'ml', heading: 'Machine Learning', subtitle: 'How the model learns, evaluates, and predicts tournament outcomes.', count: 3 },
  { key: 'platform', heading: 'Platform', subtitle: 'Interactive dashboards and prediction experiences built for users.', count: 2 },
  { key: 'results', heading: 'Results', subtitle: 'The final outcome of the project and its key achievements.', count: 1 },
];

// Fill fields for a bare fallback project so the page still renders fully.
function enrich(p) {
  return {
    emoji: p.emoji || '📘',
    year: p.year || new Date().getFullYear(),
    subtitle: p.subtitle || `${p.description.split('.')[0]}.`,
    gallery: p.gallery || GALLERY_TEMPLATE.map((g) => ({ ...g, images: Array(g.count).fill(null) })),
    links: p.links || { github: null, demo: null },
    prev: p.prev || null,
    next: p.next || null,
    ...p,
  };
}

const reveal = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

function Divider() {
  return <div className="border-t border-ink/10" />;
}

function GallerySection({ section, color }) {
  return (
    <motion.section
      className="py-14 md:py-20"
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
    >
      <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">{section.heading}</h2>
      <p className="mt-2 max-w-xl text-base italic leading-relaxed text-ink/55 md:text-lg">
        {section.subtitle}
      </p>
      <div className="mt-8 md:mt-10">
        <ImageGallery images={section.images} color={color} alt={section.heading} />
      </div>
    </motion.section>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const transitionTo = usePageTransition();
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ok | missing

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    fetchProject(slug)
      .then((p) => alive && (setProject(p), setStatus('ok')))
      .catch(() => {
        const fb = fallbackProjects.find((p) => p.slug === slug);
        if (!alive) return;
        if (fb) {
          setProject(enrich(fb));
          setStatus('ok');
        } else {
          setStatus('missing');
        }
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  const goBack = () =>
    transitionTo('/', {
      color: '#171717',
      title: 'Back to the Library',
      category: 'The Library',
      landAt: 'shelf',
    });

  const goToProject = (p) => {
    if (!p) return;
    transitionTo(`/projects/${p.slug}`, { color: '#171717', title: p.title, category: 'Chapter' });
  };

  if (status === 'loading') {
    return (
      <main className="dot-grid flex min-h-screen items-center justify-center bg-cream">
        <span className="text-sm uppercase tracking-widest text-ink/40">Opening…</span>
      </main>
    );
  }

  if (status === 'missing') {
    return (
      <main className="dot-grid flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-8 text-center">
        <h1 className="text-4xl font-bold tracking-headline text-ink">Chapter not found</h1>
        <button onClick={goBack} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:scale-105">
          &larr; Back to the Library
        </button>
      </main>
    );
  }

  const hasDemo = Boolean(project.links?.demo);
  const hasKaggle = Boolean(project.links?.kaggle);
  const hasGithub = Boolean(
    project.links?.github &&
      project.links.github !== 'https://github.com/' &&
      project.links.github !== '#'
  );
  const gallery = project.gallery || [];

  return (
    <motion.main
      className="dot-grid min-h-screen bg-cream text-ink"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="px-8 md:px-16">
        {/* 1. Breadcrumb nav */}
        <div className="flex items-center py-6 text-xs font-semibold uppercase tracking-widest text-ink/60">
          <button onClick={goBack} className="transition-colors hover:text-ink">
            &larr; Back to Library
          </button>
        </div>

        {/* 2. Header row — title left, links + category + year right */}
        <header className="border-t border-ink/10 py-8 md:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="flex items-center gap-3 text-3xl font-bold leading-[1.05] tracking-headline text-ink md:text-5xl">
              <span aria-hidden>{project.emoji}</span>
              <span>{project.title}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {hasDemo && (
                <a
                  href={project.links.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-terracotta px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cream shadow-sm transition-all duration-200 hover:scale-105 hover:bg-terracotta/90"
                >
                  Live Demo &#8599;
                </a>
              )}
              {hasKaggle && (
                <a
                  href={project.links.kaggle}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#20BEFF] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#20BEFF]/90 font-bold"
                >
                  Kaggle &#8599;
                </a>
              )}
              {hasGithub && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cream shadow-sm transition-all duration-200 hover:scale-105 hover:bg-ink/85"
                >
                  GitHub &#8599;
                </a>
              )}
              <span className="inline-block rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink/70">
                {project.category}
              </span>
              <span className="text-sm font-medium text-ink/40">{project.year}</span>
            </div>
          </div>
        </header>

        {/* 3. Description */}
        <p className="max-w-2xl pb-10 text-lg leading-relaxed text-ink/80 md:pb-12 md:text-xl">
          {project.description}
        </p>

        {/* 4. Stack card — bordered/rounded container, not just dividers */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/15 bg-ink/[0.03] px-6 py-5 md:px-8 md:py-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink/40">Stack</span>
          <span className="text-sm font-medium text-ink/70 md:text-base">
            {(project.tech_stack || []).join('  •  ')}
          </span>
        </div>

        <Divider />

        {/* 5. Gallery sections, each separated by a divider */}
        {gallery.map((section, i) => (
          <div key={section.key}>
            <GallerySection section={section} color={project.color} />
            {i < gallery.length - 1 && <Divider />}
          </div>
        ))}

        <Divider />

        {/* 6. Chapter nav footer */}
        <div className="flex items-center justify-between gap-4 py-10 md:py-14">
          {project.prev ? (
            <button
              onClick={() => goToProject(project.prev)}
              className="max-w-[45%] text-left text-sm font-semibold text-ink/60 transition-colors hover:text-ink md:text-base"
            >
              &larr; Previous Chapter
              <span className="mt-1 block truncate text-xs font-normal text-ink/40">{project.prev.title}</span>
            </button>
          ) : (
            <span />
          )}
          {project.next ? (
            <button
              onClick={() => goToProject(project.next)}
              className="max-w-[45%] text-right text-sm font-semibold text-ink/60 transition-colors hover:text-ink md:text-base"
            >
              Next Chapter &rarr;
              <span className="mt-1 block truncate text-xs font-normal text-ink/40">{project.next.title}</span>
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </motion.main>
  );
}
