// View-model for the Project Shelf popup (laptop book spread + phone bottom sheet).
// One template for every book: this module merges the shelf's own list (volume, tag,
// spine colour, category, year, slug) with the project's content file
// (data/projects/<slug>.js) and returns plain, already-clean values. Anything missing
// comes back as '' / [] / null so the UI hides that block instead of rendering a hole.
import { projectContent } from './projects/index.js';
import { metricOf, spineTheme, stampFor } from './shelfBooks.js';

const SUMMARY_MAX = 220;
const STACK_SHOWN = 6;

const PLACEHOLDER_RE = /^\s*\[.*\]\s*$|\[—\]|placeholder|lorem ipsum/i;

const txt = (v) => {
  if (typeof v === 'number') return String(v);
  if (typeof v !== 'string') return '';
  const s = v.trim();
  return s && !PLACEHOLDER_RE.test(s) ? s : '';
};

const realUrl = (u) =>
  typeof u === 'string' && /^https?:\/\//i.test(u) && !/^https:\/\/github\.com\/?$/i.test(u) ? u : '';

/** Trim to `max` chars on a word boundary, adding an ellipsis only when something was cut. */
function clip(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max * 0.6))}…`;
}

// "0.000% critical misses · 95.71% 24h severe recall" -> [{ value, label }, ...]
// Only pieces that start with a real number count ("PR-AUC 0.801" and "497-question
// benchmark" are skipped), so a free-text result never turns into a bogus stat.
function statsFromResult(result) {
  return result
    .split('·')
    .map((part) => part.trim())
    .map((part) => part.match(/^(\d[\d.,]*[%kKMx]?)\s+(\S.*)$/))
    .filter(Boolean)
    .map((m) => ({ value: m[1], label: m[2].charAt(0).toUpperCase() + m[2].slice(1) }));
}

const cleanStats = (arr) =>
  (Array.isArray(arr) ? arr : [])
    .map((s) => ({ value: txt(s?.value), label: txt(s?.short) || txt(s?.label) }))
    .filter((s) => s.value && s.label);

function stackOf(c, book) {
  const fromPreview = Array.isArray(c?.preview?.stack) ? c.preview.stack : null;
  const fromGroups = Array.isArray(c?.stack) ? c.stack.flatMap((g) => g?.items || []) : [];
  const raw = fromPreview || (fromGroups.length ? fromGroups : book.tech_stack || []);
  return [...new Set(raw.map(txt).filter(Boolean))];
}

/** Title font size (px) that keeps the headline inside the 450px page column. */
export function titleSizeFor(title) {
  const longestWord = Math.max(...title.split(/\s+/).map((w) => w.length), 1);
  let size = Math.min(64, Math.floor(444 / (0.56 * longestWord)));
  if (title.length > 26) size = Math.min(size, 40);
  else if (title.length > 18) size = Math.min(size, 46);
  return Math.max(size, 32);
}

/**
 * @param {object[]} books  published shelf books in shelf order (selectShelfBooks)
 * @returns {object[]}      one preview per book, same order
 */
export function buildBookPreviews(books) {
  const total = books.length;
  const pad2 = (n) => String(n).padStart(2, '0');

  return books.map((book, i) => {
    const c = projectContent[book.slug] || null;
    const pv = c?.preview || {};

    const tagline = txt(c?.tagline);
    const summary = clip(
      [txt(pv.summary), txt(c?.overview?.lead), txt(book.description)].find((s) => s && s !== tagline) || '',
      SUMMARY_MAX
    );

    const shelfStats = statsFromResult(metricOf(book));
    const stats = [cleanStats(pv.stats), cleanStats(c?.stats), shelfStats].find((s) => s.length) || [];

    const stack = stackOf(c, book);

    const src = txt(pv.image?.src) || txt(book.thumbnail);
    const links = {
      demo: realUrl(c?.links?.demo ?? book.links?.demo),
      github: realUrl(c?.links?.github ?? book.links?.github),
      kaggle: realUrl(c?.links?.kaggle ?? book.links?.kaggle),
    };

    const spineColor = book.spineColor || '#2B2724';
    const title = c?.title || book.title;

    return {
      slug: book.slug,
      index: i,
      volume: i + 1,
      volumeLabel: pad2(i + 1),
      total,
      title,
      titleSize: titleSizeFor(title),
      tag: stampFor(book),
      category: book.category || '',
      year: c?.year || book.year || '',
      spineColor,
      theme: spineTheme(spineColor),
      tagline,
      summary,
      stats,
      stack: stack.slice(0, STACK_SHOWN),
      stackMore: Math.max(0, stack.length - STACK_SHOWN),
      image: src ? { src, alt: txt(pv.image?.alt) || `${title} screenshot` } : null,
      caption: txt(pv.caption),
      links,
      // neighbours wrap around at the ends
      prev: total > 1 ? books[(i - 1 + total) % total].slug : null,
      next: total > 1 ? books[(i + 1) % total].slug : null,
    };
  });
}

// Image warm-up: called on hover / focus / touch of a spine so the open is instant.
const warmed = new Set();
export function preloadBookImage(preview) {
  const src = preview?.image?.src;
  if (!src || warmed.has(src)) return;
  warmed.add(src);
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
}
