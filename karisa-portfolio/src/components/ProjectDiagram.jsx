import React from 'react';

/**
 * Phase 3 — Proof Systems (docs/roadmapupdated.md task 3).
 *
 * The modal used to describe each project's architecture as a monospace list of
 * sentences ("Frontend: React 18 with Vite", "Backend: Supabase (PostgreSQL + …)").
 * That's an inventory, not a mechanism — it names the parts without showing what the
 * decision actually turned on.
 *
 * Each diagram below draws the one thing its case study argues:
 *   Raslipwani — where the three optimisations sit in the request path, before vs after.
 *   Neema      — why hiding a button is not access control: both the UI and a hand-rolled
 *                request land on the same RLS policy.
 *
 * Hand-authored inline SVG: no library, no runtime, scales with the container, and
 * `currentColor` keeps it on-theme. The single indigo is reserved for the mark each
 * figure is about.
 */

/* These mirror the tailwind.config.js Kanga Sheet ramp. They are duplicated as literals
   because SVG presentation attributes cannot read Tailwind classes — keep them in sync
   by hand. Every value that carries text clears WCAG AA on the cloth-50 box ground. */
const INK = '#5B5F67'; // mark-500 — graphical strokes
const EDGE = '#C6BEAB'; // cloth-400 — box edges
const TEXT = '#14171C'; // mark-900
const MUTED = '#5B5F67'; // mark-500 — carries real text, so AA applies (5.5:1 on cloth)
const SIGNAL = '#243D8F'; // pindo — the one accent, reserved for what each figure is about

const Box = ({ x, y, w = 124, h = 52, label, sub, accent = false }) => (
  <>
    <rect x={x} y={y} width={w} height={h} fill={accent ? 'rgba(36,61,143,0.07)' : '#FAF8F3'} stroke={accent ? SIGNAL : EDGE} strokeWidth="1" />
    <text x={x + w / 2} y={sub ? y + 23 : y + h / 2 + 4} textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">
      {label}
    </text>
    {sub && (
      <text x={x + w / 2} y={y + 39} textAnchor="middle" fill={accent ? SIGNAL : MUTED} fontSize="10">
        {sub}
      </text>
    )}
  </>
);

const Arrow = ({ x1, x2, y, label, accent = false }) => (
  <>
    <line x1={x1} y1={y} x2={x2 - 7} y2={y} stroke={accent ? SIGNAL : INK} strokeWidth="1.5" markerEnd={accent ? 'url(#ah-signal)' : 'url(#ah)'} />
    {label && (
      <text x={(x1 + x2) / 2} y={y - 9} textAnchor="middle" fill={accent ? SIGNAL : MUTED} fontSize="10">
        {label}
      </text>
    )}
  </>
);

const Defs = () => (
  <defs>
    <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill={INK} />
    </marker>
    <marker id="ah-signal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill={SIGNAL} />
    </marker>
  </defs>
);

const RaslipwaniDiagram = () => (
  <figure className="m-0">
    <svg
      viewBox="0 0 760 300"
      role="img"
      aria-label="Before: the browser requested every listing and booking on page load, straight through the API to Postgres, taking about 3 seconds. After: a React Query cache holds results for 5 minutes, the API returns 20 rows per page, and search is debounced by 500 milliseconds, taking about 1.2 seconds."
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      <Defs />

      {/* BEFORE */}
      <text x="16" y="28" fill={MUTED} fontSize="10" letterSpacing="1.4">
        BEFORE — ~3s TO FIRST PAINT
      </text>
      <Box x={16} y={44} label="Browser" sub="list view" />
      <Arrow x1={140} x2={380} y={70} label="every listing + booking" />
      <Box x={380} y={44} label="PostgREST" />
      <Arrow x1={504} x2={580} y={70} label="SELECT *" />
      <Box x={580} y={44} w={150} label="PostgreSQL" sub="~400 listings" />

      <line x1="16" y1="128" x2="730" y2="128" stroke={EDGE} strokeWidth="1" />

      {/* AFTER */}
      <text x="16" y="164" fill={SIGNAL} fontSize="10" letterSpacing="1.4">
        AFTER — ~1.2s
      </text>
      <Box x={16} y={180} label="Browser" sub="debounced 500ms" accent />
      <Arrow x1={140} x2={196} y={206} accent />
      <Box x={196} y={180} w={128} label="React Query" sub="5 min stale" accent />
      <Arrow x1={324} x2={380} y={206} accent />
      <Box x={380} y={180} label="PostgREST" />
      <Arrow x1={504} x2={580} y={206} label="LIMIT 20" accent />
      <Box x={580} y={180} w={150} label="PostgreSQL" sub="indexed" />

      <text x="16" y="264" fill={MUTED} fontSize="11">
        The cache absorbs the return trip; pagination shrinks each request; the debounce
      </text>
      <text x="16" y="281" fill={MUTED} fontSize="11">
        stops one firing per keystroke. Remove any one and the 3s comes back.
      </text>
    </svg>
    <figcaption className="mt-3 text-xs text-mark-500">
      Where the three optimisations sit in the request path.
    </figcaption>
  </figure>
);

const NeemaDiagram = () => (
  <figure className="m-0">
    <svg
      viewBox="0 0 760 300"
      role="img"
      aria-label="Two callers reach the database: the admin interface, which hides controls a role may not use, and a hand-written request that skips the interface entirely. Both join the same path into PostgREST, and every row they touch is checked by the same row-level security policy before any table is read. Hiding a button in the interface is cosmetic; the policy is the gate."
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      <Defs />

      <Box x={16} y={36} w={150} label="Admin UI" sub="hides controls" />
      <Box x={16} y={176} w={150} label="curl / devtools" sub="skips the UI" />

      {/* Both callers join one path */}
      <path d="M166 62 H250 V130" fill="none" stroke={INK} strokeWidth="1.5" />
      <path d="M166 202 H250 V130" fill="none" stroke={INK} strokeWidth="1.5" />
      <circle cx="250" cy="130" r="3" fill={INK} />
      <text x="208" y="52" textAnchor="middle" fill={MUTED} fontSize="10">
        signed in
      </text>
      <text x="208" y="192" textAnchor="middle" fill={MUTED} fontSize="10">
        same token
      </text>

      <Arrow x1={250} x2={310} y={130} />
      <Box x={310} y={104} w={130} label="PostgREST" sub="one API" />

      <Arrow x1={440} x2={520} y={130} label="every row" accent />
      <Box x={520} y={104} w={150} label="RLS policy" sub="5 role tiers" accent />

      <line x1="595" y1="156" x2="595" y2="203" stroke={SIGNAL} strokeWidth="1.5" markerEnd="url(#ah-signal)" />
      <Box x={520} y={210} w={150} label="Tables" sub="programmes, stories…" />

      <text x="16" y="262" fill={MUTED} fontSize="11">
        A volunteer with gallery access cannot reach site settings by opening devtools —
      </text>
      <text x="16" y="279" fill={MUTED} fontSize="11">
        the check runs in the database, below both paths.
      </text>
    </svg>
    <figcaption className="mt-3 text-xs text-mark-500">
      Why hiding a button is not access control.
    </figcaption>
  </figure>
);

const DIAGRAMS = { 1: RaslipwaniDiagram, 2: NeemaDiagram };

const ProjectDiagram = ({ projectId }) => {
  const Diagram = DIAGRAMS[projectId];
  return Diagram ? <Diagram /> : null;
};

export default ProjectDiagram;
