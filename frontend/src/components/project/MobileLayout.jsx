import { Fragment, useEffect, useRef } from 'react';
import { scrollToSection } from '../SmoothScroll.jsx';
import useProjectMotion from './useProjectMotion.js';
import useChapterSpy from './useChapterSpy.js';
import useProjectNav, { onPlainClick } from './useProjectNav.js';
import {
  IconBack, IconNext, IconOut, IconRight, IconDown,
  FigureImage, FigureList, figLabel, altOf, fitSize, heroTitleVars, Lead,
} from './parts.jsx';

// Mobile layout (< 1024px), after LegalRAG "Mobile v2 (minimal)". A separate tree,
// not the laptop layout squeezed. Between 768 and 1023px it stays a single column
// (max 640px) so it never runs under the 40px frame lines.
const mid = (id) => `m-${id}`;
const FOIL_LINE = (foil, pct) => `color-mix(in srgb, ${foil} ${pct}%, transparent)`;
const withStop = (s) => (/[.!?:]$/.test(s) ? s : `${s}.`);

function Section({ id, label, ch, scrollMargin = 5, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="pp-sec px-5" style={{ scrollMarginTop: scrollMargin }}>
      {ch ? (
        <div data-reveal>
          <div className="pp-ch-k">{ch.num}</div>
          <h2 id={`${id}-h`} className="pp-ch-t">{ch.title}</h2>
          {ch.subtitle && <p className="pp-ch-s">{ch.subtitle}</p>}
        </div>
      ) : (
        <div className="pp-ch-k" data-reveal><h2 id={`${id}-h`} className="m-0 text-[11px] font-normal">{label}</h2></div>
      )}
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------- top + hero */
function TopBar({ page, nav }) {
  return (
    <nav aria-label="Project navigation" className="flex h-[60px] items-center justify-between border-b border-ink/10 px-2" data-hero>
      <a href="/" onClick={onPlainClick(nav.goBack)} aria-label="Back to Library" className="inline-flex h-11 w-11 items-center justify-center">
        <IconBack size={20} />
      </a>
      {page.volume && <span className="pp-mono text-[11px] tracking-[1.4px] pp-muted">VOL.{page.volumeLabel} / {page.total}</span>}
      {page.next ? (
        <a href={`/projects/${page.next.slug}`} onClick={onPlainClick(() => nav.goTo(page.next))} aria-label={`Next volume: ${page.next.title}`} className="inline-flex h-11 w-11 items-center justify-center">
          <IconNext size={20} />
        </a>
      ) : (
        <span className="h-11 w-11" aria-hidden="true" />
      )}
    </nav>
  );
}

function Hero({ page }) {
  const { theme } = page;
  const buttons = [
    page.links.demo && { href: page.links.demo, label: 'LIVE DEMO', cls: 'bg-terracotta text-[#1A1410]' },
    page.links.kaggle && { href: page.links.kaggle, label: 'KAGGLE', cls: 'bg-[#20BEFF] text-ink' },
    page.links.github && { href: page.links.github, label: 'GITHUB', cls: 'bg-ink text-cream' },
    page.links.api && { href: page.links.api, label: 'API DOCS', cls: 'border border-ink/40 bg-cream text-ink' },
  ].filter(Boolean);
  const meta = [
    ['Role', page.meta.role],
    ['Timeline', page.meta.timeline],
    ['Category', [page.category, page.year].filter(Boolean).join(' · ')],
    ['Deployed', page.meta.deployedOn],
  ].filter(([, v]) => v);
  const rows = Math.ceil(page.stats.length / 2);

  return (
    <header className="px-5 pt-11">
      <div
        data-hero
        aria-hidden="true"
        className="flex h-11 items-center gap-3 rounded-[4px_10px_10px_4px] px-3.5"
        style={{ background: `linear-gradient(90deg,rgba(0,0,0,.25) 0,rgba(0,0,0,0) 10%), ${page.spineColor}`, color: theme.text }}
      >
        {page.volume && <span className="pp-mono text-[10.5px] tracking-[1.4px]" style={{ color: theme.foil }}>VOL.{page.volumeLabel}</span>}
        {page.volume && <span className="h-[18px] w-px" style={{ background: FOIL_LINE(theme.foil, 50) }} />}
        <span className="min-w-0 flex-1 truncate text-[14px] font-bold">{page.title}</span>
        {page.tag && (
          <span className="rounded-full border px-2 py-[3px] text-[9px] font-bold tracking-[1.2px]" style={{ color: theme.foil, borderColor: theme.foil }}>{page.tag}</span>
        )}
      </div>

      <h1
        data-hero-title
        className="mt-8 font-extrabold leading-[.9] tracking-[-0.044em]"
        style={heroTitleVars(page.title, { laptop: false })}
      >
        {page.title}
      </h1>
      {page.tagline && <p className="mt-[18px] text-[19px] font-medium leading-[1.4] text-[#2A2622]" data-hero>{page.tagline}</p>}

      {buttons.length > 0 && (
        <div className="mt-7 grid grid-cols-2 gap-2.5" data-hero>
          {buttons.map((b, i) => (
            <a
              key={b.label}
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`pp-btn !min-h-[50px] !gap-2 !px-0 !tracking-[1.1px] ${b.cls} ${buttons.length % 2 && i === buttons.length - 1 ? 'col-span-2' : ''}`}
            >
              {b.label} <IconOut size={13} />
            </a>
          ))}
        </div>
      )}
      {page.demoNote && (
        <div className="mt-3.5 flex items-center gap-2 text-[12.5px] pp-soft" data-hero>
          <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#C9963C]" />
          {page.demoNote}
        </div>
      )}

      {meta.length > 0 && (
        <div className="mt-9 border-t border-ink/15" data-reveal>
          {meta.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-ink/10 py-[13px]">
              <span className="pp-lbl">{k}</span>
              <span className="text-right text-[14px] font-semibold">{v}</span>
            </div>
          ))}
        </div>
      )}

      {page.stats.length > 0 && (
        <div className="mt-7 grid grid-cols-2" data-reveal>
          {page.stats.map((s, i) => {
            const right = i % 2 === 1;
            const lastRow = Math.floor(i / 2) === rows - 1;
            return (
              <div key={s.label} className={`pp-fit py-[18px] ${right ? 'border-l border-ink/10 pl-4' : 'pr-3'} ${lastRow ? '' : 'border-b border-ink/10'}`}>
                <div data-countup className="whitespace-nowrap font-extrabold leading-none tracking-[-0.03em]" style={fitSize(s.value, 32)}>{s.value}</div>
                <div className="pp-lbl mt-1.5">{s.label}</div>
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
}

/* ---------------------------------------------------------------- chip strip */
function ChapterChips({ page }) {
  const items = [
    ...(page.hasOverview ? [{ id: 'overview', num: '', short: 'Overview' }] : []),
    ...page.chapters.map((c) => ({ id: c.id, num: c.num, short: c.short })),
  ];
  const [active, setActive] = useChapterSpy(items.map((i) => mid(i.id)));
  const bar = useRef(null);

  // keep the active chip visible inside the horizontal strip (never scrolls the page)
  useEffect(() => {
    const el = bar.current?.querySelector('[aria-current="true"]');
    if (el && bar.current) bar.current.scrollTo({ left: Math.max(0, el.offsetLeft - 20), behavior: 'smooth' });
  }, [active]);

  if (!page.chapters.length) return null;
  return (
    <div
      ref={bar}
      className="pp-chips sticky top-0 z-[5] mt-10 flex gap-2 overflow-x-auto border-y border-ink/10 bg-cream/95 px-5 py-2.5 backdrop-blur-[2px]"
      role="navigation"
      aria-label="Chapters"
    >
      {items.map((it) => (
        <a
          key={it.id}
          href={`#${mid(it.id)}`}
          aria-current={active === mid(it.id) ? 'true' : undefined}
          onClick={(e) => {
            e.preventDefault();
            setActive(mid(it.id));
            scrollToSection(mid(it.id));
          }}
        >
          {it.num && <span className="pp-n">{it.num}</span>}
          {it.short}
        </a>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ overview */
function Overview({ page }) {
  const { overview, stack } = page;
  if (!page.hasOverview) return null;
  const size = overview.lead.length <= 170 ? 23 : overview.lead.length <= 300 ? 19 : 17;
  const tools = stack.flatMap((g) => g.items);
  return (
    <Section id={mid('overview')} label="OVERVIEW" scrollMargin={29}>
      {overview.lead && (
        <p className="mt-3 font-semibold leading-[1.3] tracking-[-0.017em]" style={{ fontSize: size }} data-reveal>
          <Lead text={overview.lead} accent={overview.leadAccent} />
        </p>
      )}
      {overview.parts.length > 0 && (
        <div className="mt-6" data-reveal>
          {overview.parts.map((p) => (
            <div key={p.letter} className="pp-row">
              <div className="pp-row-n">{p.letter}</div>
              <div className="pp-row-b"><strong>{withStop(p.label)}</strong> {p.body}</div>
            </div>
          ))}
        </div>
      )}
      {tools.length > 0 && (
        <div data-reveal>
          <div className="pp-lbl mt-7">Stack</div>
          <p className="pp-mono mt-2.5 text-[12.5px] leading-[1.9] pp-body">{tools.join(' · ')}</p>
        </div>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ chapters */
function Architecture({ ch }) {
  const { flow, decisions, figures } = ch.data;
  return (
    <Section id={mid(ch.id)} ch={ch}>
      {flow.length > 0 && (
        <div className="mt-6" data-flow>
          {flow.map((n, i) => (
            <Fragment key={i}>
              {i > 0 && <div className="pp-down" aria-hidden="true" data-flow-node><IconDown size={18} /></div>}
              {n.parallel ? (
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${n.parallel.length > 3 ? 2 : n.parallel.length}, minmax(0, 1fr))` }} data-flow-node>
                  {n.parallel.map((p) => (
                    <div key={p.title} className="pp-vnode !flex-col !items-start !gap-0.5">
                      <span className="pp-vnode-t">{p.title}</span>
                      {p.sub && <span className="pp-vnode-s">{p.sub}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div data-flow-node>
                  <div
                    className="pp-vnode"
                    style={i === flow.length - 1 && flow.length > 1 ? { background: '#171717', borderColor: '#171717', color: '#F5F0EA' } : undefined}
                  >
                    <span className="pp-vnode-t">{n.title}</span>
                    {n.sub && <span className="pp-vnode-s" style={i === flow.length - 1 && flow.length > 1 ? { color: 'var(--pp-peach)' } : undefined}>{n.sub}</span>}
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}
      {decisions.length > 0 && (
        <div className="mt-7" data-reveal>
          {decisions.map((d, i) => (
            <div key={i} className="pp-row">
              <div className="pp-row-n">→</div>
              <div className="pp-row-b">{d.title && <strong>{d.title}</strong>} {d.why}</div>
            </div>
          ))}
        </div>
      )}
      {figures.length > 0 && <div className="mt-7"><FigureList figures={figures} chapter={ch} mono="text-[11.5px]" /></div>}
    </Section>
  );
}

function DataPipeline({ ch }) {
  const { steps, figure, footprint, footprintTitle, footprintNote, figures } = ch.data;
  const BAR = ['#171717', '#B5533C', '#D9834A'];
  return (
    <Section id={mid(ch.id)} ch={ch}>
      {steps.length > 0 && (
        <div className="relative mt-[26px] pl-[26px]" data-reveal>
          <div className="absolute bottom-2 left-1.5 top-2 w-px bg-ink/20" />
          {steps.map((s, i) => {
            const last = i === steps.length - 1;
            return (
              <div key={i} className={`relative ${last ? '' : 'pb-[22px]'}`}>
                <span
                  className="absolute -left-[26px] top-1 box-border h-[13px] w-[13px] rounded-full border-2 border-brick"
                  style={{ background: last ? '#B5533C' : '#F7F1ED' }}
                />
                {s.title && <div className="text-[17px] font-bold">{s.title}</div>}
                {s.body && <div className="mt-1 text-[15px] leading-[1.5] pp-body">{s.body}</div>}
              </div>
            );
          })}
        </div>
      )}
      {figure && (
        <figure className="m-0 mt-7" data-reveal>
          <FigureImage fig={figure} fallbackAlt={`${ch.title} figure 1`} />
          {figure.caption && <figcaption className="pp-mono mt-2.5 text-[11.5px] pp-muted">{figLabel(ch.num, 1)} — {figure.caption}</figcaption>}
        </figure>
      )}
      {footprint.length > 0 && (
        <div className="mt-6" data-reveal>
          <div className="pp-lbl mb-3">{footprintTitle}</div>
          <div className="flex flex-col gap-3.5">
            {footprint.map((f, i) => (
              <div key={f.label}>
                <div className="flex justify-between text-[13.5px]"><span>{f.label}</span><span className="pp-mono">{f.value}</span></div>
                {f.percent !== null && (
                  <div className="mt-1.5 h-1.5 rounded bg-ink/[.07]">
                    <div className="h-full rounded" style={{ width: `${f.percent}%`, background: BAR[i % BAR.length] }} />
                  </div>
                )}
              </div>
            ))}
          </div>
          {footprintNote && <p className="mt-3.5 text-[13px] leading-[1.5] pp-soft">{footprintNote}</p>}
        </div>
      )}
      {figures.length > 0 && <div className="mt-7"><FigureList figures={figures} chapter={ch} startAt={figure ? 2 : 1} mono="text-[11.5px]" /></div>}
    </Section>
  );
}

function MachineLearning({ ch }) {
  const { highlight, listTitle, list, finding, figures } = ch.data;
  return (
    <Section id={mid(ch.id)} ch={ch}>
      {highlight && (
        <div data-reveal>
          <div className="pp-fit mt-6 flex items-baseline gap-3.5">
            <span data-countup className="whitespace-nowrap font-extrabold leading-[.9] tracking-[-0.045em]" style={{ fontSize: highlight.value.length <= 3 ? 88 : Math.max(40, Math.round(264 / highlight.value.length)) }}>
              {highlight.value}
            </span>
            {highlight.label && <span className="text-[15px] leading-[1.4] pp-body">{highlight.label}</span>}
          </div>
          {highlight.chips.length > 0 && (
            <p className="pp-mono mt-3.5 text-[12px] leading-[1.8] pp-soft">{highlight.chips.join(' · ')}</p>
          )}
        </div>
      )}
      {list.length > 0 && (
        <div className="mt-7" data-reveal>
          {listTitle && <div className="pp-lbl mb-1.5">{listTitle}</div>}
          {list.map((j) => (
            <div key={j.title} className="flex justify-between gap-3 border-t border-ink/10 py-[13px]">
              <span className="text-[15.5px] font-semibold">{j.title}</span>
              {j.direction && <span className="pp-mono shrink-0 text-[12px] pp-muted">{j.direction}</span>}
            </div>
          ))}
        </div>
      )}
      {finding && (
        <div className="mt-7 rounded-2xl bg-brick px-[22px] py-6 text-[#FFF8EC]" data-reveal>
          <div className="pp-lbl !text-[rgba(255,248,236,.85)]">Honest finding</div>
          <p className="mt-2.5 text-[18px] font-semibold leading-[1.4]">{finding}</p>
        </div>
      )}
      {figures.length > 0 && <div className="mt-7"><FigureList figures={figures} chapter={ch} mono="text-[11.5px]" /></div>}
    </Section>
  );
}

function Platform({ ch }) {
  const { figure, notes, latencyTitle, latency, figures } = ch.data;
  return (
    <Section id={mid(ch.id)} ch={ch}>
      {figure && (
        <figure className="m-0 mt-6" data-reveal>
          <div className="overflow-hidden rounded-[14px] border border-ink/15 bg-[var(--pp-card)]">
            <img
              src={figure.mobileSrc || figure.src}
              alt={altOf(figure, `${ch.title} screenshot`)}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
          </div>
          {figure.caption && <figcaption className="pp-mono mt-2.5 text-[11.5px] pp-muted">{figLabel(ch.num, 1)} — {figure.caption}</figcaption>}
        </figure>
      )}
      {notes.length > 0 && (
        <div className="mt-5" data-reveal>
          {notes.map((n, i) => (
            <div key={i} className="pp-row">
              <div className="pp-row-n">{String(i + 1).padStart(2, '0')}</div>
              <div className="pp-row-b">{n.title && <strong>{withStop(n.title)}</strong>} {n.body}</div>
            </div>
          ))}
        </div>
      )}
      {latency.length > 0 && (
        <div className="mt-4" data-reveal>
          <div className="pp-lbl mb-2">{latencyTitle}</div>
          <div className="grid grid-cols-2 gap-2">
            {latency.map((l, i) => {
              const hl = latency.length > 1 && i === latency.length - 1;
              return (
                <div key={l.stage} className={`rounded-xl p-3.5 ${hl ? '' : 'border border-ink/15'}`} style={hl ? { background: '#171717' } : undefined}>
                  <div className={`pp-lbl ${hl ? 'pp-peach' : ''}`}>{l.stage}</div>
                  <div className="pp-mono mt-1.5 text-[18px]" style={{ color: hl ? '#CFC6BC' : undefined }}>{l.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {figures.length > 0 && <div className="mt-7"><FigureList figures={figures} chapter={ch} startAt={figure ? 2 : 1} mono="text-[11.5px]" /></div>}
    </Section>
  );
}

function Results({ ch }) {
  const { metrics, table, next, figures } = ch.data;
  return (
    <Section id={mid(ch.id)} ch={ch}>
      {metrics.length > 0 && (
        <div className="mt-5 border-t-2 border-ink" data-reveal>
          {metrics.map((m) => (
            <div key={m.label} className="flex items-baseline justify-between gap-3 border-b border-ink/10 py-4">
              <span className="pp-lbl !text-ink">{m.label}</span>
              <span data-countup className="whitespace-nowrap text-[30px] font-extrabold">{m.value}</span>
            </div>
          ))}
        </div>
      )}
      {table && (
        <div data-reveal>
          <div className="pp-lbl mb-2.5 mt-7">
            {[table.title, table.columns.slice(1).join(' / ')].filter(Boolean).join(' · ')}
          </div>
          {table.rows.map((row, ri) => {
            const last = ri === table.rows.length - 1;
            return (
              <div
                key={ri}
                className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl px-3.5 py-3.5"
                style={{ background: last ? 'rgba(181,83,60,.1)' : 'rgba(23,23,23,.04)' }}
              >
                <span className="text-[14.5px]" style={{ fontWeight: last ? 700 : 500 }}>{row[0]}</span>
                <span className="pp-mono whitespace-nowrap text-[12.5px] pp-muted">
                  {table.columns.slice(1).map((_, ci) => row[ci + 1] || '–').join(' · ')}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {next.length > 0 && (
        <div data-reveal>
          <div className="pp-lbl mt-7">What I&apos;d do next</div>
          <div className="mt-2">
            {next.map((t, i) => (
              <div key={i} className="pp-row">
                <div className="pp-row-n">{String(i + 1).padStart(2, '0')}</div>
                <div className="pp-row-b">{t}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {figures.length > 0 && <div className="mt-7"><FigureList figures={figures} chapter={ch} mono="text-[11.5px]" /></div>}
    </Section>
  );
}

const CHAPTER_VIEWS = { architecture: Architecture, dataPipeline: DataPipeline, machineLearning: MachineLearning, platform: Platform, results: Results };

/* ---------------------------------------------------------------- next volume */
function NextVolume({ page, nav }) {
  const { next } = page;
  return (
    <section aria-label="Next volume" className="px-5 pb-14 pt-[72px]" data-reveal>
      <div className="pp-lbl mb-4 text-center">End of Volume {page.volumeLabel}</div>
      {next && (
        <a
          href={`/projects/${next.slug}`}
          onClick={onPlainClick(() => nav.goTo(next))}
          className="group block rounded-[6px_18px_18px_6px] pb-[22px] pl-[30px] pr-[22px] pt-[26px]"
          style={{ background: `linear-gradient(90deg,rgba(0,0,0,.28) 0,rgba(0,0,0,0) 6%), ${next.spineColor}`, color: next.theme.text }}
        >
          <span className="pp-mono block text-[10.5px] uppercase tracking-[1.4px]" style={{ color: next.theme.foil }}>
            Next · Vol.{next.volumeLabel}{next.tag ? ` · ${next.tag}` : ''}
          </span>
          <span className="mt-3 block text-[30px] font-extrabold leading-[1.05] tracking-[-0.033em] [text-wrap:balance]">{next.title}</span>
          <span className="mt-5 flex items-center justify-between gap-3">
            <span className="pp-mono text-[11px]" style={{ opacity: 0.75 }}>{next.keyResult}</span>
            <span className="ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F6EEDD] text-ink">
              <span className="inline-flex transition-transform duration-300 group-active:translate-x-0.5"><IconRight size={18} /></span>
            </span>
          </span>
        </a>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------------- page */
export default function MobileLayout({ page }) {
  const root = useRef(null);
  const nav = useProjectNav();
  useProjectMotion(root, 'mobile');

  return (
    <main ref={root} className="pp pp-m dot-grid min-h-screen bg-cream text-ink">
      <div className="mx-auto w-full md:max-w-[640px]">
        <TopBar page={page} nav={nav} />
        <Hero page={page} />
        <ChapterChips page={page} />
        <Overview page={page} />
        {page.chapters.map((ch) => {
          const View = CHAPTER_VIEWS[ch.key];
          return <View key={ch.key} ch={ch} />;
        })}
        {page.volume && <NextVolume page={page} nav={nav} />}
      </div>
    </main>
  );
}
