import { useEffect, useState } from 'react';

// Pieces shared by the laptop spread and the phone sheet. Everything here renders from one
// preview object (data/bookPreview.js) and hides what is empty.

export const ArrowIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const CloseIcon = ({ size = 12, stroke = 2.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const Chevron = ({ dir = 'left' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
  </svg>
);

/**
 * The book cover: spine-colour block with VOL, tag and title. Used as the closed front cover
 * (variant "closed"), and as the figure fallback when a book has no screenshot or it fails to load.
 */
export function Cover({ p, variant = 'figure' }) {
  const { text, foil } = p.theme;
  return (
    <div
      className={`bp-cover-art bp-cover-art--${variant}`}
      style={{ '--spine': p.spineColor, '--ct': text, '--foil': foil }}
    >
      <span className="bp-cover-rule" aria-hidden="true" />
      <div className="bp-cover-top">
        <span className="bp-cover-vol">VOL.{p.volumeLabel}</span>
        {p.tag && <span className="bp-cover-tag">{p.tag}</span>}
      </div>
      <div className="bp-cover-title">{p.title}</div>
    </div>
  );
}

/** Screenshot frame (object-fit: contain, whole image shown). Falls back to the book cover. */
export function Figure({ p, className = '', style }) {
  const src = p.image?.src;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  return (
    <div className={`bp-fig-frame ${className}`} style={{ '--spine': p.spineColor, ...style }}>
      {src && !failed ? (
        <img
          className="bp-img"
          src={src}
          alt={p.image.alt}
          draggable={false}
          decoding="async"
          onError={() => setFailed(true)}
          onLoad={(e) => e.currentTarget.naturalWidth === 0 && setFailed(true)}
        />
      ) : (
        <Cover p={p} variant="figure" />
      )}
    </div>
  );
}

/** "A · B · C +4 more", or null when the book has no stack. */
export function stackLine(p) {
  if (!p.stack.length) return null;
  return (
    <>
      {p.stack.join(' · ')}
      {p.stackMore > 0 && <span className="bp-more"> +{p.stackMore} more</span>}
    </>
  );
}

export function Stats({ stats, className = '' }) {
  if (!stats.length) return null;
  return (
    <div className={`bp-stats ${className}`} style={{ '--n': stats.length }}>
      {stats.map((s) => (
        <div className="bp-stat" key={s.label}>
          <div className="bp-stat-v">{s.value}</div>
          <div className="lbl bp-stat-l">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/** Link buttons for the links the book actually has, in demo / github / kaggle order. */
export function linkList(p, { demoLabel = 'Live demo' } = {}) {
  return [
    p.links.demo && { key: 'demo', href: p.links.demo, label: demoLabel, dot: true },
    p.links.github && { key: 'github', href: p.links.github, label: 'GitHub' },
    p.links.kaggle && { key: 'kaggle', href: p.links.kaggle, label: 'Kaggle' },
  ].filter(Boolean);
}
