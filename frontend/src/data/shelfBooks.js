// Selection + presentation helpers for the Project Shelf's flat list.
// Everything the shelf shows (rows, VOL numbers, counters, category list) is
// derived from the list returned by selectShelfBooks().

// Unfinished-copy markers ("[RESULT METRIC]", lorem text): a result matching
// this is treated as empty, so the row simply has no metric line.
const PLACEHOLDER_RE = /\[[A-Z][A-Z0-9 _-]+\]|lorem|ipsum|placeholder|coming soon|\btbd\b/i;

/** The one-line metric to show, or '' (render nothing, leave no gap). */
export function metricOf(p) {
  const r = typeof p.result === 'string' ? p.result.trim() : '';
  return r && !PLACEHOLDER_RE.test(r) ? r : '';
}

/** A book is on the shelf when it is published. Result/images are optional. */
export const isShelfReady = (p) => p.published === true;

/** Published projects in their fixed `sort_order` (not creation order). */
export const selectShelfBooks = (projects) =>
  projects
    .filter(isShelfReady)
    .map((p, i) => ({ p, i }))
    .sort((a, b) => (a.p.sort_order ?? 1000) - (b.p.sort_order ?? 1000) || a.i - b.i)
    .map(({ p }) => p);

/** Category stamp (SQL / VIZ / ML / DL / NLP / AGENTS / APP): the project's `tag`. */
export const stampFor = (p) => (p.tag || p.category || '').toUpperCase();

// Deterministic "pile" variation per row index (no Math.random -> no flicker).
// width + offset never exceeds 98% so the 28px hover slide stays inside the
// frame lines.
const WIDTHS = [97, 93, 96, 90, 98, 92, 95, 88];
const OFFSETS = [0, 3, 1, 7, 0, 5, 2, 6];
const HEIGHTS = [78, 70, 84, 66, 74, 82, 68, 76];

export const pileFor = (i) => ({
  width: `${WIDTHS[i % WIDTHS.length]}%`,
  offset: `${OFFSETS[i % OFFSETS.length]}%`,
  height: `${HEIGHTS[i % HEIGHTS.length]}px`,
});

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const CREAM = '#F3EEE6';
const INK = '#171717';

/** Text + foil colours with enough contrast on a given spine colour. */
export function spineTheme(spine) {
  const l = luminance(spine);
  const vsCream = (luminance(CREAM) + 0.05) / (l + 0.05);
  const vsInk = (l + 0.05) / (luminance(INK) + 0.05);
  return vsCream >= vsInk
    ? { text: CREAM, foil: '#E8C77A' }
    : { text: INK, foil: '#5B3F10' };
}
