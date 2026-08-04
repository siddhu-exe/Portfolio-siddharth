import { motion } from 'framer-motion';

// Deterministic per-book variety so the shelf reads like real, mismatched books.
const HEIGHTS = [172, 204, 186, 214];
const WIDTHS = [44, 54, 48, 58];

export default function BookSpine({ project, onOpen, onHover, lean = 0, delay = 0 }) {
  const h = HEIGHTS[project.id % HEIGHTS.length];
  const w = WIDTHS[(project.id * 3) % WIDTHS.length];

  return (
    <motion.button
      className="book-spine relative flex shrink-0 items-center justify-center rounded-t-md rounded-b-[3px]"
      style={{
        backgroundColor: project.color,
        height: `clamp(150px, 30vw, ${h}px)`,
        width: `clamp(38px, 8vw, ${w}px)`,
        transformOrigin: 'bottom center',
        boxShadow: '7px 4px 16px rgba(0,0,0,0.28)',
      }}
      initial={{ y: 80, opacity: 0, rotate: 0 }}
      whileInView={{ y: 0, opacity: 1, rotate: lean }}
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{ scale: 1.07, y: -12, rotate: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={() => {
        onHover(false);
        onOpen(project);
      }}
      aria-label={`Open ${project.title}`}
    >
      {/* spine curvature: dark edges, subtle highlight down the middle */}
      <span className="pointer-events-none absolute inset-0 rounded-t-md rounded-b-[3px] bg-gradient-to-r from-black/30 via-white/10 to-black/25" />
      {/* head and tail bands */}
      <span className="absolute inset-x-1 top-2 h-[3px] rounded-full bg-black/25" />
      <span className="absolute inset-x-1 top-[14px] h-[2px] rounded-full bg-black/15" />
      <span className="absolute inset-x-1 bottom-3 h-[3px] rounded-full bg-black/25" />
      {/* publisher mark */}
      <span className="absolute bottom-6 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-ink/40" />

      <span className="book-title relative max-h-[88%] overflow-hidden text-ellipsis whitespace-nowrap text-[9px] font-semibold tracking-wide text-ink/85 md:text-[11px]">
        {project.title}
      </span>
    </motion.button>
  );
}
