import { motion } from 'framer-motion';

const draw = (duration, delay, play, instant) =>
  instant
    ? { initial: { pathLength: 1 }, animate: { pathLength: 1 }, transition: { duration: 0 } }
    : {
        initial: { pathLength: 0 },
        animate: play ? { pathLength: 1 } : { pathLength: 0 },
        transition: { duration, delay, ease: 'easeInOut' },
      };

/**
 * Hand-drawn cursive "Siddharth" signature. The strokes draw themselves in via
 * pathLength (stroke-dasharray/offset under the hood in Framer Motion) — but
 * only once `play` is true, so the draw-on plays as the footer is revealed
 * rather than firing invisibly on page load. `instant` renders it fully drawn
 * (returning visitors / reduced motion).
 */
export default function Signature({ className, play = true, instant = false }) {
  return (
    <svg
      viewBox="0 0 560 220"
      fill="none"
      className={className}
      aria-label="Siddharth signature"
    >
      {/* Main flowing stroke */}
      <motion.path
        d="M 118 74
           C 96 38 44 46 50 84
           C 55 116 118 104 110 146
           C 104 178 52 184 40 156
           C 60 190 90 168 108 152
           C 118 142 124 132 126 122
           C 124 136 122 148 128 154
           C 136 160 148 146 152 124
           C 156 96 158 64 156 52
           C 152 84 154 128 162 150
           C 168 160 180 154 186 142
           C 190 132 192 126 194 118
           C 190 134 190 150 200 156
           C 210 160 220 146 224 122
           C 228 94 230 62 228 50
           C 224 84 226 130 234 152
           C 240 162 252 156 258 142
           C 262 132 266 124 268 118
           C 262 132 260 148 268 154
           C 276 158 286 146 290 132
           C 294 122 298 116 300 112
           C 298 124 298 140 304 148
           C 310 154 320 146 326 134
           C 330 120 334 90 336 64
           C 336 90 336 130 342 148
           C 348 158 360 152 366 138
           C 372 120 380 84 376 60
           C 372 44 360 48 362 66
           C 364 92 372 128 380 148
           C 386 158 396 152 402 138
           C 408 124 412 118 416 114
           C 412 128 412 146 422 152
           C 434 156 448 144 460 128
           C 480 106 500 96 520 92"
        stroke="var(--terracotta)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(1.9, 0.1, play, instant)}
      />
      {/* t crossbar */}
      <motion.path
        d="M 312 84 C 330 78 352 76 372 78"
        stroke="var(--terracotta)"
        strokeWidth="5"
        strokeLinecap="round"
        {...draw(0.25, 2.0, play, instant)}
      />
      {/* i dot */}
      <motion.path
        d="M 131 95 C 132 94 134 95 133 97"
        stroke="var(--terracotta)"
        strokeWidth="6"
        strokeLinecap="round"
        {...draw(0.12, 2.25, play, instant)}
      />
    </svg>
  );
}
