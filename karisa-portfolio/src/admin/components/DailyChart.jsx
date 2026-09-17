import React from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const day = (iso) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

/**
 * One bar per day. Ink on cloth: bars in indigo, the baseline in the heavy rule,
 * labels in caption ink. The same numbers are in a hidden table for screen readers.
 */
export default function DailyChart({ data, label }) {
  const total = data.reduce((n, d) => n + d.count, 0);
  const max = Math.max(...data.map((d) => d.count), 0);
  const peak = data.find((d) => d.count === max);
  const W = 720, H = 180, PAD_L = 28, PAD_B = 22, PAD_T = 8;
  const innerW = W - PAD_L - 8, innerH = H - PAD_B - PAD_T;
  const slot = innerW / data.length;
  const barW = Math.max(2, slot * 0.7);
  const y = (c) => PAD_T + innerH - (max ? (c / max) * innerH : 0);
  const tickEvery = data.length > 45 ? 14 : data.length > 14 ? 7 : 1;
  const summary = `${label}: ${total} total${max ? `, peak ${max} on ${day(peak.date)}` : ''}`;

  if (total === 0) {
    return <p className="border border-cloth-300 px-4 py-10 text-center text-sm text-mark-700">No submissions in this period.</p>;
  }

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="h-auto w-full">
        <title>{summary}</title>
        <line x1={PAD_L} x2={W - 8} y1={PAD_T + innerH} y2={PAD_T + innerH} stroke="#C6BEAB" strokeWidth="1" />
        <text x={PAD_L - 6} y={PAD_T + 4} textAnchor="end" fontSize="10" fill="#5B5F67" fontFamily="Archivo, system-ui, sans-serif">{max}</text>
        <text x={PAD_L - 6} y={PAD_T + innerH} textAnchor="end" fontSize="10" fill="#5B5F67" fontFamily="Archivo, system-ui, sans-serif">0</text>
        {data.map((d, i) => {
          const x = PAD_L + i * slot + (slot - barW) / 2;
          return (
            <g key={d.date}>
              <rect data-bar x={x} y={y(d.count)} width={barW} height={PAD_T + innerH - y(d.count)} fill="#243D8F">
                <title>{`${day(d.date)}: ${d.count}`}</title>
              </rect>
              {i % tickEvery === 0 && (
                <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#5B5F67" fontFamily="Archivo, system-ui, sans-serif">{day(d.date)}</text>
              )}
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead><tr><th scope="col">Day</th><th scope="col">Count</th></tr></thead>
        <tbody>{data.map((d) => <tr key={d.date}><td>{d.date}</td><td>{d.count}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}
