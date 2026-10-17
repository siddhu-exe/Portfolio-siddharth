// View-model for the project page: merges a project's content file (data/projects)
// with the values the Project Shelf owns (volume, tag, spine colour, key result,
// category), and drops every empty block so the template never renders a hole.
import { projectContent } from './projects/index.js';
import { CHAPTERS, AUTHOR } from './projects/schema.js';
import { metricOf, spineTheme, stampFor } from './shelfBooks.js';

// Unfinished-copy markers ("[Your role]", "[—]") count as empty, same idea as the shelf.
const PLACEHOLDER_RE = /^\s*\[.*\]\s*$|\[—\]/;

/** A trimmed string, or '' when it is missing / a placeholder. */
export const txt = (v) => {
  if (typeof v === 'number') return String(v);
  if (typeof v !== 'string') return '';
  const s = v.trim();
  return s && !PLACEHOLDER_RE.test(s) ? s : '';
};

const list = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== undefined) : []);

const realUrl = (u) =>
  typeof u === 'string' && /^https?:\/\//i.test(u) && u !== 'https://github.com/' && u !== 'https://github.com'
    ? u
    : '';

const pad2 = (n) => String(n).padStart(2, '0');

function figureOf(f) {
  const src = txt(f?.src);
  if (!src) return null;
  return { src, mobileSrc: txt(f.mobileSrc), caption: txt(f.caption), alt: txt(f.alt), windowTitle: txt(f.windowTitle) };
}

const figuresOf = (arr) => list(arr).map(figureOf).filter(Boolean);

function normaliseChapters(ch = {}, links) {
  const a = ch.architecture || {};
  const flowNode = (n) => ({ kind: txt(n?.kind), title: txt(n?.title), sub: txt(n?.sub) });
  const flow = list(a.flow)
    .map((n) => {
      const parallel = list(n?.parallel).map(flowNode).filter((p) => p.title);
      return parallel.length ? { parallel } : flowNode(n);
    })
    .filter((n) => n.parallel || n.title);
  const architecture = {
    subtitle: txt(a.subtitle),
    flow,
    flowCaption: txt(a.flowCaption),
    decisions: list(a.decisions)
      .map((d) => ({ title: txt(d?.title), why: txt(d?.why) }))
      .filter((d) => d.title || d.why),
    figures: figuresOf(a.figures),
  };

  const d = ch.dataPipeline || {};
  const dataPipeline = {
    subtitle: txt(d.subtitle),
    steps: list(d.steps)
      .map((s) => ({ title: txt(s?.title), body: txt(s?.body) }))
      .filter((s) => s.title || s.body),
    figure: figureOf(d.figure),
    footprintTitle: txt(d.footprintTitle) || 'Footprint',
    footprint: list(d.footprint)
      .map((f) => ({
        label: txt(f?.label),
        value: txt(f?.value),
        percent: Number.isFinite(Number(f?.percent)) && f?.percent !== null ? Math.min(100, Math.max(0, Number(f.percent))) : null,
      }))
      .filter((f) => f.label && f.value),
    footprintNote: txt(d.footprintNote),
    figures: figuresOf(d.figures),
  };

  const m = ch.machineLearning || {};
  const hl = m.highlight || {};
  const machineLearning = {
    subtitle: txt(m.subtitle),
    highlight: txt(hl.value)
      ? { eyebrow: txt(hl.eyebrow), value: txt(hl.value), label: txt(hl.label), chips: list(hl.chips).map(txt).filter(Boolean) }
      : null,
    listTitle: txt(m.listTitle),
    list: list(m.list)
      .map((i) => ({ title: txt(i?.title), direction: txt(i?.direction) }))
      .filter((i) => i.title),
    finding: txt(m.finding),
    figures: figuresOf(m.figures),
  };

  const p = ch.platform || {};
  const platformFigure = figureOf(p.figure);
  if (platformFigure && !platformFigure.windowTitle && realUrl(links.demo)) {
    platformFigure.windowTitle = new URL(links.demo).hostname;
  }
  const platform = {
    subtitle: txt(p.subtitle),
    figure: platformFigure,
    notes: list(p.notes)
      .map((n) => ({ title: txt(n?.title), body: txt(n?.body) }))
      .filter((n) => n.title || n.body),
    latencyTitle: txt(p.latencyTitle) || 'Latency per request',
    latency: list(p.latency)
      .map((l) => ({ stage: txt(l?.stage), value: txt(l?.value) }))
      .filter((l) => l.stage && l.value),
    figures: figuresOf(p.figures),
  };

  const r = ch.results || {};
  const columns = list(r.table?.columns).map(txt);
  const rows = list(r.table?.rows)
    .map((row) => list(row).map(txt))
    .filter((row) => row[0] && row.slice(1).some(Boolean));
  const results = {
    subtitle: txt(r.subtitle),
    metrics: list(r.metrics)
      .map((x) => ({ value: txt(x?.value), label: txt(x?.label) }))
      .filter((x) => x.value && x.label),
    table: columns.length > 1 && rows.length ? { title: txt(r.table?.title), columns, rows } : null,
    next: list(r.next).map(txt).filter(Boolean),
    figures: figuresOf(r.figures),
  };

  return { architecture, dataPipeline, machineLearning, platform, results };
}

const hasContent = {
  architecture: (c) => c.flow.length || c.decisions.length || c.figures.length,
  dataPipeline: (c) => c.steps.length || c.figure || c.footprint.length || c.figures.length,
  machineLearning: (c) => c.highlight || c.list.length || c.finding || c.figures.length,
  platform: (c) => c.figure || c.notes.length || c.latency.length || c.figures.length,
  results: (c) => c.metrics.length || c.table || c.next.length || c.figures.length,
};

// Roughly every string the reader sees, for the "n min read" estimate.
function wordCount(value) {
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean).length;
  if (Array.isArray(value)) return value.reduce((n, v) => n + wordCount(v), 0);
  if (value && typeof value === 'object') return Object.values(value).reduce((n, v) => n + wordCount(v), 0);
  return 0;
}

function neighbour(book, i) {
  if (!book) return null;
  return {
    slug: book.slug,
    title: book.title,
    volume: i + 1,
    volumeLabel: pad2(i + 1),
    tag: stampFor(book),
    category: book.category || '',
    spineColor: book.spineColor,
    theme: spineTheme(book.spineColor),
    keyResult: metricOf(book),
  };
}

/**
 * @param {string} slug
 * @param {object[]} books  published shelf books in shelf order (selectShelfBooks)
 * @returns {object|null}   null when no content file exists for the slug
 */
export function buildProjectPage(slug, books) {
  const c = projectContent[slug];
  if (!c) return null;

  const idx = books.findIndex((b) => b.slug === slug);
  const book = idx >= 0 ? books[idx] : null;
  const total = books.length;

  const links = {
    demo: realUrl(c.links?.demo),
    github: realUrl(c.links?.github),
    kaggle: realUrl(c.links?.kaggle),
    api: realUrl(c.links?.api),
  };

  const chaptersData = normaliseChapters(c.chapters, links);
  const chapters = CHAPTERS.filter((ch) => hasContent[ch.key](chaptersData[ch.key])).map((ch) => ({
    ...ch,
    subtitle: chaptersData[ch.key].subtitle,
    data: chaptersData[ch.key],
  }));

  const ov = c.overview || {};
  const overview = {
    lead: txt(ov.lead),
    leadAccent: txt(ov.leadAccent),
    parts: [
      { letter: 'A', label: 'Approach', body: txt(ov.approach) },
      { letter: 'B', label: 'Evaluation', body: txt(ov.evaluation) },
      { letter: 'C', label: 'Serving', body: txt(ov.serving) },
    ].filter((p) => p.body),
  };
  const stack = list(c.stack)
    .map((g) => ({ group: txt(g?.group), items: list(g?.items).map(txt).filter(Boolean) }))
    .filter((g) => g.group && g.items.length);

  const category = book?.category || '';
  const spineColor = book?.spineColor || '#2B2724';

  const page = {
    slug,
    title: c.title,
    tagline: txt(c.tagline),
    year: c.year || '',
    author: AUTHOR,
    category,
    tag: book ? stampFor(book) : '',
    volume: idx >= 0 ? idx + 1 : null,
    volumeLabel: idx >= 0 ? pad2(idx + 1) : '',
    total,
    spineColor,
    theme: spineTheme(spineColor),
    keyResult: book ? metricOf(book) : '',
    links,
    demoNote: links.demo ? txt(c.demoNote) : '',
    meta: {
      role: txt(c.meta?.role),
      timeline: txt(c.meta?.timeline),
      deployedOn: txt(c.meta?.deployedOn),
    },
    stats: list(c.stats)
      .map((s) => ({ value: txt(s?.value), label: txt(s?.label) }))
      .filter((s) => s.value && s.label)
      .slice(0, 4),
    overview,
    stack,
    hasOverview: Boolean(overview.lead || overview.parts.length || stack.length),
    chapters,
    // Shelf order is volume order; the last volume loops back to the first.
    prev: idx > 0 ? neighbour(books[idx - 1], idx - 1) : null,
    next: idx >= 0 && total > 1 ? neighbour(books[(idx + 1) % total], (idx + 1) % total) : null,
  };

  page.readMinutes = Math.max(
    1,
    Math.round(wordCount([page.tagline, overview, stack, chapters.map((ch) => ch.data), chapters.map((ch) => ch.subtitle)]) / 200)
  );
  return page;
}
