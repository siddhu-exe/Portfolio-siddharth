// Small pieces shared by the laptop and mobile trees (icons, figures, sizing helpers).

const Svg = ({ size = 16, sw = 2, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
export const IconBack = (p) => <Svg {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></Svg>;
export const IconPrev = (p) => <Svg {...p}><path d="M15 18l-6-6 6-6" /></Svg>;
export const IconNext = (p) => <Svg {...p}><path d="M9 18l6-6-6-6" /></Svg>;
export const IconOut = (p) => <Svg sw={2.4} {...p}><path d="M7 17L17 7M8 7h9v9" /></Svg>;
export const IconRight = (p) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
export const IconDown = (p) => <Svg {...p}><path d="M12 5v14M6 13l6 6 6-6" /></Svg>;

/** "FIG 2.1" — chapter number + running figure index. */
export const figLabel = (chapterNum, n) => `FIG ${parseInt(chapterNum, 10)}.${n}`;

/** Alt text from data, falling back to the caption, then a generic description. */
export const altOf = (fig, fallback) => fig.alt || fig.caption || fallback;

/**
 * Font size that never overflows its `.pp-fit` parent: capped at `max` px, and
 * shrinks with the container for long values ("100,000" in a narrow card).
 */
export const fitSize = (value, max, k = 0.62) => ({
  fontSize: `min(${max}px, calc(100cqw / ${Math.max(String(value).length, 3) * k}))`,
});

/** Hero title sizing from the title alone (same rule for every project). */
export function heroTitleVars(title, { laptop }) {
  const n = title.length;
  const longest = Math.max(...title.split(/\s+/).map((w) => w.length));
  const cap = laptop
    ? n <= 9 ? 150 : n <= 14 ? 120 : n <= 20 ? 96 : 76
    : n <= 9 ? 68 : n <= 14 ? 52 : n <= 20 ? 44 : 38;
  const width = laptop ? '(100vw - 128px) * 0.95' : '(min(100vw, 640px) - 40px) * 0.98';
  const k = laptop ? 1 : 0.6;
  return { fontSize: `min(${cap}px, calc((${width}) / ${longest * k}))` };
}

/** A figure image in a soft frame; `dark` variant for the architecture spread. */
export function FigureImage({ fig, fallbackAlt, dark = false, className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-[14px] p-2.5 ${
        dark ? 'border border-[rgba(245,240,234,.16)] bg-[#F5F0EA]' : 'pp-card'
      } ${className}`}
    >
      <picture>
        {fig.mobileSrc && <source media="(max-width: 1023px)" srcSet={fig.mobileSrc} />}
        <img
          src={fig.src}
          alt={altOf(fig, fallbackAlt)}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full rounded-[8px]"
        />
      </picture>
    </div>
  );
}

/** Extra figures at the end of a chapter (image-only projects). */
export function FigureList({ figures, chapter, startAt = 1, dark = false, mono = 'text-[12px]' }) {
  if (!figures.length) return null;
  return (
    <div className="flex flex-col gap-10">
      {figures.map((fig, i) => (
        <figure key={fig.src} className="m-0" data-reveal>
          <FigureImage fig={fig} fallbackAlt={`${chapter.title} figure ${startAt + i}`} dark={dark} />
          {fig.caption && (
            <figcaption className={`pp-mono mt-3 ${mono} ${dark ? 'text-[rgba(245,240,234,.55)]' : 'pp-muted'}`}>
              {figLabel(chapter.num, startAt + i)} — {fig.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

/** Split "420 ms" into a big number and a small unit. */
export function splitUnit(value) {
  const m = value.match(/^([\d.,]+)\s*(\D.*)?$/);
  return m ? { big: m[1], unit: m[2] || '' } : { big: value, unit: '' };
}

/** Lead sentence with an optional accented word. */
export function Lead({ text, accent }) {
  const at = accent ? text.indexOf(accent) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="pp-brick">{accent}</span>
      {text.slice(at + accent.length)}
    </>
  );
}
