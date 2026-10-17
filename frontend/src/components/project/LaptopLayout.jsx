import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToSection } from '../SmoothScroll.jsx';
import useProjectMotion from './useProjectMotion.js';
import useChapterSpy from './useChapterSpy.js';
import useProjectNav, { onPlainClick } from './useProjectNav.js';
import {
  IconBack, IconPrev, IconNext, IconOut, IconRight,
  FigureImage, FigureList, figLabel, altOf, fitSize, heroTitleVars, splitUnit, Lead,
} from './parts.jsx';

// Laptop layout (>= 1024px), after LegalRAG "Laptop v2". The page sits inside the
// site's fixed frame lines (40px from each edge, content at 64px), so full-bleed
// bands (chapter strip, dark spread) reach the frame lines with a -24px margin.
const BLEED = '-mx-6';
const FOIL_LINE = (foil, pct) => `color-mix(in srgb, ${foil} ${pct}%, transparent)`;

const PIN_SPOTS = [
  { left: -17, top: '30%' },
  { right: '24%', top: -17 },
  { right: -17, bottom: '22%' },
  { left: '18%', bottom: -17 },
];

/* ------------------------------------------------------------------ top bar */
function TopBar({ page, nav }) {
  const crumbs = ['The Library', page.category, page.title].filter(Boolean).join(' / ');
  const arrow = 'inline-flex h-11 w-11 items-center justify-center rounded-full border';
  return (
    <nav aria-label="Project navigation" className="flex items-center justify-between gap-6 border-b border-ink/10 pb-[22px] pt-7" data-hero>
      <a
        href="/"
        onClick={onPlainClick(nav.goBack)}
        className="pp-link inline-flex min-h-[44px] shrink-0 items-center gap-2 text-[13px] font-bold tracking-[1px] pp-soft"
      >
        <IconBack /> Back to Library
      </a>
      <div className="pp-mono min-w-0 flex-1 truncate text-center text-[12px] uppercase tracking-[1.4px] pp-muted">{crumbs}</div>
      <div className="flex shrink-0 items-center gap-1.5">
        {page.volume && (
          <span className="pp-mono mr-2.5 text-[12px] tracking-[1.4px] pp-muted">
            VOL.{page.volumeLabel} / {page.total}
          </span>
        )}
        {page.prev ? (
          <a href={`/projects/${page.prev.slug}`} onClick={onPlainClick(() => nav.goTo(page.prev))} aria-label={`Previous volume: ${page.prev.title}`} className={`${arrow} border-ink/35`}>
            <IconPrev />
          </a>
        ) : (
          <span aria-hidden="true" className={`${arrow} border-ink/15 pp-faint`}><IconPrev /></span>
        )}
        {page.next && (
          <a href={`/projects/${page.next.slug}`} onClick={onPlainClick(() => nav.goTo(page.next))} aria-label={`Next volume: ${page.next.title}`} className={`${arrow} border-ink/35`}>
            <IconNext />
          </a>
        )}
      </div>
    </nav>
  );
}

/* --------------------------------------------------------------------- hero */
function Cover({ page }) {
  const { theme } = page;
  const n = page.title.length;
  const size = n <= 9 ? 46 : n <= 18 ? 38 : 30;
  return (
    <div
      aria-hidden="true"
      className="relative flex aspect-[3/4] w-full max-w-[380px] flex-col justify-between rounded-[6px_16px_16px_6px] py-8 pl-11 pr-[34px]"
      style={{
        background: `linear-gradient(90deg,rgba(0,0,0,.28) 0,rgba(255,255,255,.08) 4%,rgba(0,0,0,0) 9%), ${page.spineColor}`,
        boxShadow: '0 40px 70px -30px rgba(26,20,16,.6), inset 0 1px 0 rgba(255,255,255,.12)',
        color: theme.text,
        paddingTop: 36,
      }}
    >
      <div className="absolute inset-y-0 left-[22px] w-px" style={{ background: FOIL_LINE(theme.foil, 45) }} />
      <div className="flex items-center justify-between">
        {page.volume && <span className="pp-mono text-[12px] tracking-[1.6px]" style={{ color: theme.foil }}>VOL.{page.volumeLabel}</span>}
        {page.tag && (
          <span className="rounded-full border px-[11px] py-[5px] text-[10px] font-bold tracking-[1.5px]" style={{ color: theme.foil, borderColor: theme.foil }}>
            {page.tag}
          </span>
        )}
      </div>
      <div>
        <div className="mb-[22px] h-px" style={{ background: FOIL_LINE(theme.foil, 50) }} />
        <div className="font-extrabold leading-none tracking-[-0.033em]" style={{ fontSize: `clamp(26px, 3.2vw, ${size}px)` }}>
          {page.title}
        </div>
        {page.keyResult && (
          <div className="pp-mono mt-3.5 text-[12.5px] leading-[1.6]" style={{ color: theme.text, opacity: 0.82 }}>{page.keyResult}</div>
        )}
        <div className="mt-[22px] h-px" style={{ background: FOIL_LINE(theme.foil, 50) }} />
      </div>
      <div className="pp-mono text-[11px] uppercase tracking-[1.4px]" style={{ opacity: 0.6 }}>
        {[page.author, page.year].filter(Boolean).join(' · ')}
      </div>
    </div>
  );
}

function Hero({ page }) {
  const eyebrow = [page.volume && `Vol.${page.volumeLabel}`, page.category, page.year].filter(Boolean).join(' · ');
  const buttons = [
    page.links.demo && { href: page.links.demo, label: 'LIVE DEMO', cls: 'bg-terracotta text-[#1A1410]' },
    page.links.kaggle && { href: page.links.kaggle, label: 'KAGGLE', cls: 'bg-[#20BEFF] text-ink' },
    page.links.github && { href: page.links.github, label: 'GITHUB', cls: 'bg-ink text-cream' },
    page.links.api && { href: page.links.api, label: 'API DOCS', cls: 'border border-ink/40 bg-cream text-ink' },
  ].filter(Boolean);
  return (
    <header className="pp-12 items-stretch pt-16">
      <div className="col-span-7 flex flex-col justify-end">
        {eyebrow && <div className="pp-eyebrow pp-rust" data-hero>{eyebrow}</div>}
        <h1
          data-hero-title
          className="mt-5 font-extrabold leading-[.88] tracking-[-0.04em]"
          style={heroTitleVars(page.title, { laptop: true })}
        >
          {page.title}
        </h1>
        {page.tagline && (
          <p className="mt-8 max-w-[28ch] text-[28px] font-medium leading-[1.3] text-[#2A2622]" data-hero>{page.tagline}</p>
        )}
        {(buttons.length > 0 || page.demoNote) && (
          <div className="mt-10 flex flex-wrap items-center gap-3" data-hero>
            {buttons.map((b) => (
              <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer" className={`pp-btn ${b.cls}`}>
                {b.label} <IconOut size={14} />
              </a>
            ))}
            {page.demoNote && (
              <span className="ml-2 inline-flex items-center gap-2 text-[13px] pp-soft">
                <span className="inline-block h-2 w-2 rounded-full bg-[#C9963C]" />
                {page.demoNote}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="col-span-4 col-start-9 flex justify-end" data-hero>
        <Cover page={page} />
      </div>
    </header>
  );
}

function MetaRow({ page }) {
  const cells = [
    ['Role', page.meta.role],
    ['Timeline', page.meta.timeline],
    ['Category', page.category],
    ['Deployed on', page.meta.deployedOn],
  ].filter(([, v]) => v);
  if (!cells.length) return null;
  return (
    <div
      className="mt-[72px] grid border-y border-ink/20"
      style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
      data-reveal
    >
      {cells.map(([label, value], i) => (
        <div key={label} className={`py-[22px] ${i === 0 ? 'pr-5' : 'border-l border-ink/10 px-5'}`}>
          <div className="pp-lbl">{label}</div>
          <div className="mt-2 text-[16px] font-semibold">{value}</div>
        </div>
      ))}
    </div>
  );
}

function Stats({ stats }) {
  if (!stats.length) return null;
  return (
    <section aria-label="Key numbers" className="mt-10 grid gap-4" style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }} data-reveal>
      {stats.map((s) => (
        <div key={s.label} className="pp-card pp-fit px-7 py-[30px]">
          <div data-countup className="whitespace-nowrap font-extrabold leading-none tracking-[-0.032em]" style={fitSize(s.value, 56)}>{s.value}</div>
          <div className="pp-lbl mt-3.5 pp-soft">{s.label}</div>
        </div>
      ))}
    </section>
  );
}

/* ------------------------------------------------------------ chapter strip */
function ChapterStrip({ page }) {
  const items = [
    ...(page.hasOverview ? [{ id: 'overview', num: '00', title: 'Overview' }] : []),
    ...page.chapters,
  ];
  const [active, setActive] = useChapterSpy(items.map((i) => i.id));
  const bar = useRef(null);

  useEffect(() => {
    const content = document.getElementById('pp-content');
    if (!content || !bar.current) return undefined;
    const st = ScrollTrigger.create({
      trigger: content,
      start: 'top 60%',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
      },
    });
    return () => st.kill();
  }, []);

  if (!page.chapters.length) return null;
  return (
    <div
      className={`pp-strip ${BLEED} sticky top-0 z-[5] mt-28 flex items-center justify-between border-y border-ink/15 bg-cream/95 px-[6px] backdrop-blur-[2px]`}
    >
      <nav aria-label="Chapters" className="flex">
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            aria-current={active === it.id ? 'true' : undefined}
            onClick={(e) => {
              e.preventDefault();
              setActive(it.id);
              scrollToSection(it.id);
            }}
          >
            <span className="pp-n">{it.num}</span>
            {it.title}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-3 pr-[18px]">
        <span className="pp-lbl">{page.readMinutes} min read</span>
        <span className="block h-[3px] w-[120px] overflow-hidden rounded-sm bg-ink/10" role="presentation">
          <span ref={bar} className="block h-full w-full origin-left scale-x-0 bg-mustard" />
        </span>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- overview */
function leadSize(len) {
  return len <= 170 ? 'clamp(30px, 3.05vw, 44px)' : len <= 300 ? 'clamp(24px, 2.4vw, 34px)' : 'clamp(20px, 1.95vw, 28px)';
}

function Overview({ page }) {
  const { overview, stack } = page;
  if (!page.hasOverview) return null;
  return (
    <section id="overview" aria-labelledby="overview-h" className="pt-28" style={{ scrollMarginTop: -8 }}>
      <div className="pp-12" data-reveal>
        <div className="col-span-3">
          <h2 id="overview-h" className="pp-eyebrow pp-rust">Overview</h2>
          <div className="mt-3.5 h-0.5 w-12 bg-brick" />
        </div>
        {overview.lead && (
          <p className="col-span-9 col-start-4 m-0 font-semibold leading-[1.18] tracking-[-0.027em]" style={{ fontSize: leadSize(overview.lead.length) }}>
            <Lead text={overview.lead} accent={overview.leadAccent} />
          </p>
        )}
      </div>

      {overview.parts.length > 0 && (
        <div className="pp-12 mt-[72px]" data-reveal>
          {overview.parts.map((p, i) => (
            <div key={p.letter} className={`col-span-3 ${i === 0 ? 'col-start-4' : ''}`}>
              <div className="text-[64px] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_#B5533C]" aria-hidden="true">{p.letter}</div>
              <div className="pp-lbl mt-3.5 !text-ink">{p.label}</div>
              <p className="mt-2.5 text-[16px] leading-[1.6] pp-body">{p.body}</p>
            </div>
          ))}
        </div>
      )}

      {stack.length > 0 && (
        <div className="pp-12 mt-20" data-reveal>
          <div className="col-span-3"><div className="pp-eyebrow pp-rust">Stack</div></div>
          <div className="col-span-9 col-start-4 border-t border-ink/25">
            {stack.map((g) => (
              <div key={g.group} className="flex items-center gap-6 border-b border-ink/10 py-4">
                <div className="pp-lbl w-[140px] shrink-0 !text-ink">{g.group}</div>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((it) => <span key={it} className="pp-chip">{it}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------- chapters */
function Opener({ ch, dark }) {
  return (
    <div className="pp-open" data-reveal>
      <div className="pp-ghost" aria-hidden="true" style={dark ? { WebkitTextStroke: '1.5px rgba(232,180,140,.4)' } : undefined}>{ch.num}</div>
      <div className="pp-open-r">
        <div className="pp-open-k" style={dark ? { color: 'var(--pp-peach)' } : undefined}>Chapter {ch.num}</div>
        <h2 id={`${ch.id}-h`} className="pp-open-t" style={dark ? { color: '#F5F0EA' } : undefined}>{ch.title}</h2>
        {ch.subtitle && <p className="pp-open-s" style={dark ? { color: 'rgba(245,240,234,.72)' } : undefined}>{ch.subtitle}</p>}
      </div>
    </div>
  );
}

function Chapter({ ch, dark = false, gap = 88, children }) {
  return (
    <section
      id={ch.id}
      aria-labelledby={`${ch.id}-h`}
      className={dark ? `pp-dark ${BLEED} mt-40 bg-ink px-6 pb-28 pt-[120px] text-[#F5F0EA]` : 'pt-40'}
      style={{ scrollMarginTop: dark ? 56 : -64 }}
    >
      <Opener ch={ch} dark={dark} />
      <div className="mt-[88px] flex flex-col" style={{ rowGap: gap }}>{children}</div>
    </section>
  );
}

const Arrow = () => (
  <div className="pp-peach flex items-center" aria-hidden="true" data-flow-node><IconRight size={22} /></div>
);

function Architecture({ ch }) {
  const { flow, flowCaption, decisions, figures } = ch.data;
  return (
    <Chapter ch={ch} dark gap={88}>
      {flow.length > 0 && (
        <figure className="m-0" data-flow>
          <div className="flex items-stretch gap-3">
            {flow.map((n, i) => {
              const last = i === flow.length - 1 && flow.length > 1;
              return (
                <div key={i} className="contents">
                  {i > 0 && <Arrow />}
                  {n.parallel ? (
                    <div className="flex min-w-0 flex-[1.25_1_0] flex-col gap-2.5" data-flow-node>
                      {n.parallel.map((p) => <Node key={p.title} n={p} />)}
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1" data-flow-node><Node n={n} out={last} /></div>
                  )}
                </div>
              );
            })}
          </div>
          {flowCaption && (
            <figcaption className="pp-mono mt-4 text-[12px] text-[rgba(245,240,234,.55)]">{figLabel(ch.num, 1)} — {flowCaption}</figcaption>
          )}
        </figure>
      )}

      {decisions.length > 0 && (
        <div
          className="grid gap-x-14 border-t border-[rgba(245,240,234,.16)] pt-10"
          style={{ gridTemplateColumns: `repeat(${Math.min(decisions.length, 3)}, minmax(0, 1fr))` }}
          data-reveal
        >
          {decisions.map((d, i) => (
            <div key={i}>
              <div className="pp-lbl pp-peach">Decision {String(i + 1).padStart(2, '0')}</div>
              {d.title && <div className="mt-3 text-[30px] font-bold leading-[1.15] tracking-[-0.027em]">{d.title}</div>}
              {d.why && <p className="mt-4 text-[16.5px] leading-[1.65] text-[rgba(245,240,234,.75)]">{d.why}</p>}
            </div>
          ))}
        </div>
      )}

      <FigureList figures={figures} chapter={ch} startAt={flow.length ? 2 : 1} dark />
    </Chapter>
  );
}

function Node({ n, out = false }) {
  return (
    <div className={`pp-dnode ${out ? 'pp-out' : ''} break-words`}>
      {n.kind && <div className="pp-dnode-k">{n.kind}</div>}
      <div className="pp-dnode-t">{n.title}</div>
      {n.sub && <div className="pp-dnode-s">{n.sub}</div>}
    </div>
  );
}

const BAR_COLORS = ['#171717', '#B5533C', '#D9834A'];

function DataPipeline({ ch }) {
  const { steps, figure, footprint, footprintTitle, footprintNote, figures } = ch.data;
  const cols = Math.min(steps.length, 4);
  return (
    <Chapter ch={ch} gap={80}>
      {steps.length > 0 && (
        <div className="relative grid gap-10" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} data-reveal>
          {steps.length <= 4 && <div className="absolute inset-x-0 top-[7px] h-px bg-ink/25" />}
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div
                className="h-[15px] w-[15px] rounded-full border-2 border-brick"
                style={{ background: i === steps.length - 1 ? '#B5533C' : '#F7F1ED' }}
              />
              <div className="pp-step-n mt-[22px]">STEP {String(i + 1).padStart(2, '0')}</div>
              {s.title && <div className="pp-step-t">{s.title}</div>}
              {s.body && <div className="pp-step-b">{s.body}</div>}
            </div>
          ))}
        </div>
      )}

      {(figure || footprint.length > 0) && (
        <div className="pp-12 items-start gap-x-8">
          {figure && (
            <figure className={`m-0 flex flex-col ${footprint.length ? 'col-span-7' : 'col-span-12'}`} data-reveal>
              <FigureImage fig={figure} fallbackAlt={`${ch.title} figure 1`} />
              {figure.caption && (
                <figcaption className="pp-mono mt-3 text-[12px] pp-muted">{figLabel(ch.num, 1)} — {figure.caption}</figcaption>
              )}
            </figure>
          )}
          {footprint.length > 0 && (
            <div className={`pp-card p-8 ${figure ? 'col-span-5 col-start-8' : 'col-span-6'}`} data-reveal>
              <div className="pp-lbl pp-rust">{footprintTitle}</div>
              <div className="mt-7 flex flex-col gap-[26px]">
                {footprint.map((f, i) => (
                  <div key={f.label}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[15px] font-semibold">{f.label}</span>
                      <span className="pp-mono text-[15px]">{f.value}</span>
                    </div>
                    {f.percent !== null && (
                      <div className="mt-2.5 h-2.5 rounded-md bg-ink/[.07]">
                        <div className="h-full rounded-md" style={{ width: `${f.percent}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {footprintNote && (
                <div className="mt-7 border-t border-ink/10 pt-[18px] text-[14px] leading-[1.55] pp-soft">{footprintNote}</div>
              )}
            </div>
          )}
        </div>
      )}

      <FigureList figures={figures} chapter={ch} startAt={figure ? 2 : 1} />
    </Chapter>
  );
}

function MachineLearning({ ch }) {
  const { highlight, listTitle, list, finding, figures } = ch.data;
  return (
    <Chapter ch={ch} gap={96}>
      {(highlight || list.length > 0) && (
        <div className="pp-12 items-start gap-x-12">
          {highlight && (
            <div className="col-span-5" data-reveal>
              {highlight.eyebrow && <div className="pp-lbl pp-rust">{highlight.eyebrow}</div>}
              <div className="pp-fit mt-2">
                <div data-countup className="whitespace-nowrap font-extrabold leading-[.85] tracking-[-0.05em]" style={fitSize(highlight.value, 180, 0.6)}>
                  {highlight.value}
                </div>
              </div>
              {highlight.label && <p className="mt-[18px] max-w-[30ch] text-[19px] leading-[1.5] text-[#2A2622]">{highlight.label}</p>}
              {highlight.chips.length > 0 && (
                <div className="mt-[22px] flex flex-wrap gap-2">
                  {highlight.chips.map((c) => <span key={c} className="pp-chip">{c}</span>)}
                </div>
              )}
            </div>
          )}
          {list.length > 0 && (
            <div className={highlight ? 'col-span-7 col-start-6' : 'col-span-9 col-start-4'} data-reveal>
              {listTitle && <div className="pp-lbl pp-rust mb-2.5">{listTitle}</div>}
              {list.map((j, i) => (
                <div key={j.title} className="flex items-baseline gap-[22px] border-t border-ink/15 py-5">
                  <span className="pp-mono w-7 shrink-0 text-[12px] pp-rust">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1 text-[24px] font-semibold tracking-[-0.02em]">{j.title}</span>
                  {j.direction && <span className="pp-mono text-[12px] pp-muted">{j.direction}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {finding && (
        <div className="relative overflow-hidden rounded-3xl bg-brick px-16 py-14 text-[#FFF8EC]" data-reveal>
          <div aria-hidden="true" className="pointer-events-none absolute -top-10 right-10 text-[320px] font-extrabold leading-none text-[rgba(255,248,236,.12)]">”</div>
          <div className="pp-eyebrow text-[rgba(255,248,236,.85)]">Honest finding</div>
          <p className="relative mt-5 max-w-[40ch] text-[32px] font-semibold leading-[1.3] tracking-[-0.019em]">{finding}</p>
        </div>
      )}

      <FigureList figures={figures} chapter={ch} />
    </Chapter>
  );
}

function Platform({ ch }) {
  const { figure, notes, latencyTitle, latency, figures } = ch.data;
  const badge = 'pp-mono flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-brick text-[12px] text-[#FFF8EC]';
  const noteEls = notes.map((n, i) => (
    <div key={i} className="flex gap-4">
      <span className={badge}>{i + 1}</span>
      <div>
        {n.title && <div className="text-[19px] font-bold">{n.title}</div>}
        {n.body && <p className="mt-1.5 text-[15.5px] leading-[1.6] pp-body">{n.body}</p>}
      </div>
    </div>
  ));
  return (
    <Chapter ch={ch} gap={72}>
      {(figure || notes.length > 0) && (
        <div className="pp-12 items-center gap-x-10">
          {figure && (
            <figure className={`relative m-0 ${notes.length ? 'col-span-8' : 'col-span-12'}`} data-reveal>
              <div className="overflow-hidden rounded-2xl border border-ink/15 bg-[var(--pp-card)] shadow-[0_40px_80px_-44px_rgba(26,20,16,.55)]">
                <div className="flex items-center gap-2 border-b border-ink/10 px-4 py-3">
                  {[0, 1, 2].map((d) => <span key={d} className="h-2.5 w-2.5 rounded-full bg-ink/20" />)}
                  {figure.windowTitle && <span className="pp-mono ml-3 text-[11.5px] pp-muted">{figure.windowTitle}</span>}
                </div>
                <img src={figure.src} alt={altOf(figure, `${ch.title} screenshot`)} loading="lazy" decoding="async" className="block h-auto w-full" />
              </div>
              {notes.length > 0 &&
                notes.slice(0, PIN_SPOTS.length).map((_, i) => (
                  <span key={i} className="pp-pin" aria-hidden="true" style={PIN_SPOTS[i]}>{i + 1}</span>
                ))}
              {figure.caption && (
                <figcaption className="pp-mono mt-3.5 text-[12px] pp-muted">{figLabel(ch.num, 1)} — {figure.caption}</figcaption>
              )}
            </figure>
          )}
          {notes.length > 0 && (
            <div
              className={figure ? 'col-span-4 col-start-9 flex flex-col gap-8' : 'col-span-12 grid gap-10'}
              style={figure ? undefined : { gridTemplateColumns: `repeat(${Math.min(notes.length, 3)}, minmax(0, 1fr))` }}
              data-reveal
            >
              {noteEls}
            </div>
          )}
        </div>
      )}

      {latency.length > 0 && (
        <div data-reveal>
          <div className="pp-lbl mb-3.5">{latencyTitle}</div>
          <div
            className="grid overflow-hidden rounded-[18px] border border-ink/20 bg-[var(--pp-card)]"
            style={{ gridTemplateColumns: `repeat(${Math.min(latency.length, 4)}, minmax(0, 1fr))` }}
          >
            {latency.map((l, i) => {
              const hl = latency.length > 1 && i === latency.length - 1;
              const { big, unit } = splitUnit(l.value);
              return (
                <div key={l.stage} className={`pp-fit px-7 py-[26px] ${i > 0 && !hl ? 'border-l border-ink/10' : ''}`} style={hl ? { background: '#171717' } : undefined}>
                  <div className={`pp-lbl ${hl ? 'pp-peach' : ''}`}>{l.stage}</div>
                  <div className="mt-2.5 whitespace-nowrap font-extrabold tracking-[-0.025em]" style={{ ...fitSize(l.value, 40), color: hl ? '#CFC6BC' : undefined }}>
                    {big}
                    {unit && <span className="pp-mono ml-1.5 text-[14px] font-normal">{unit}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <FigureList figures={figures} chapter={ch} startAt={figure ? 2 : 1} />
    </Chapter>
  );
}

function Results({ ch }) {
  const { metrics, table, next, figures } = ch.data;
  return (
    <Chapter ch={ch} gap={72}>
      {metrics.length > 0 && (
        <div
          className="grid border-b border-ink/20 border-t-2 border-t-ink"
          style={{ gridTemplateColumns: `repeat(${Math.min(metrics.length, 4)}, minmax(0, 1fr))` }}
          data-reveal
        >
          {metrics.map((m, i) => (
            <div key={m.label} className={`pp-fit py-9 ${i === 0 ? 'pr-8' : 'border-l border-ink/15 px-8'}`}>
              <div data-countup className="whitespace-nowrap font-extrabold leading-[.9] tracking-[-0.034em]" style={fitSize(m.value, 88)}>{m.value}</div>
              <div className="pp-lbl mt-4 !text-ink">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {(table || next.length > 0) && (
        <div className="pp-12 items-start gap-x-10">
          {table && (
            <div className={next.length ? 'col-span-8' : 'col-span-12'} data-reveal>
              {table.title && <div className="pp-lbl pp-rust mb-4">{table.title}</div>}
              <div className="pp-card px-2 pb-1 pt-3">
                <table className="pp-tbl">
                  <thead>
                    <tr>{table.columns.map((c, i) => <th key={i} className={i ? 'pp-num' : ''} scope="col">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, ri) => (
                      <tr key={ri} className={ri === table.rows.length - 1 ? 'pp-last' : ''}>
                        {table.columns.map((_, ci) => (
                          <td key={ci} className={ci ? 'pp-num' : ''}>{row[ci] || '–'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {next.length > 0 && (
            <div className={table ? 'col-span-4 col-start-9' : 'col-span-6'} data-reveal>
              <div className="pp-lbl pp-rust mb-4">What I&apos;d do next</div>
              <ol className="m-0 list-none border-t border-ink/20 p-0">
                {next.map((t, i) => (
                  <li key={i} className="flex gap-3.5 border-b border-ink/10 py-[18px]">
                    <span className="pp-mono text-[12px] pp-rust">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[16.5px]">{t}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      <FigureList figures={figures} chapter={ch} />
    </Chapter>
  );
}

const CHAPTER_VIEWS = { architecture: Architecture, dataPipeline: DataPipeline, machineLearning: MachineLearning, platform: Platform, results: Results };

/* -------------------------------------------------------------- end of book */
function NextVolume({ page, nav }) {
  const { next } = page;
  return (
    <>
      <div className="flex items-center gap-6 pt-40" data-reveal>
        <span className="h-px flex-1 bg-ink/20" />
        <span className="pp-eyebrow pp-muted">End of Volume {page.volumeLabel}</span>
        <span className="h-px flex-1 bg-ink/20" />
      </div>
      {next && (
        <section aria-label="Next volume" className="pb-28 pt-12" data-reveal>
          <a
            href={`/projects/${next.slug}`}
            onClick={onPlainClick(() => nav.goTo(next))}
            className="group relative flex min-h-[340px] items-stretch overflow-hidden rounded-3xl"
            style={{ background: next.spineColor, color: next.theme.text, boxShadow: '0 40px 80px -44px rgba(26,20,16,.6)' }}
          >
            <span className="w-7 shrink-0" style={{ background: 'linear-gradient(90deg,rgba(0,0,0,.3),rgba(255,255,255,.06) 50%,rgba(0,0,0,.2))' }} />
            <span className="flex flex-1 items-end justify-between gap-8 px-16 py-14">
              <span className="flex min-w-0 flex-col gap-[18px]">
                <span className="pp-eyebrow" style={{ color: next.theme.foil }}>
                  Next volume · Vol.{next.volumeLabel}{next.tag ? ` · ${next.tag}` : ''}
                </span>
                <span className="block font-extrabold leading-[.95] tracking-[-0.035em] [text-wrap:balance]" style={{ fontSize: 'clamp(48px, 5.8vw, 84px)' }}>
                  {next.title}
                </span>
                {next.keyResult && <span className="pp-mono text-[13px]" style={{ opacity: 0.78 }}>{next.keyResult}</span>}
              </span>
              <span className="inline-flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-full bg-[#F6EEDD] text-ink">
                <span className="inline-flex transition-transform duration-300 group-hover:translate-x-1"><IconRight size={26} /></span>
              </span>
            </span>
          </a>
          <div className="mt-5 flex justify-between">
            <a href="/" onClick={onPlainClick(nav.goBack)} className="pp-link pp-mono inline-flex min-h-[44px] items-center text-[12px] tracking-[1.4px] pp-soft">← BACK TO THE SHELF</a>
            <span className="pp-mono inline-flex items-center text-[12px] tracking-[1.4px] pp-faint">VOL.{page.volumeLabel} / {page.total}</span>
          </div>
        </section>
      )}
    </>
  );
}

/* --------------------------------------------------------------------- page */
export default function LaptopLayout({ page }) {
  const root = useRef(null);
  const nav = useProjectNav();
  useProjectMotion(root, 'laptop');

  return (
    <main ref={root} className="pp dot-grid min-h-screen bg-cream px-16 text-ink">
      <TopBar page={page} nav={nav} />
      <Hero page={page} />
      <MetaRow page={page} />
      <Stats stats={page.stats} />
      <ChapterStrip page={page} />
      <div id="pp-content">
        <Overview page={page} />
        {page.chapters.map((ch) => {
          const View = CHAPTER_VIEWS[ch.key];
          return <View key={ch.key} ch={ch} />;
        })}
      </div>
      {page.volume && <NextVolume page={page} nav={nav} />}
    </main>
  );
}
