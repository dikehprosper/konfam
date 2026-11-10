import { useState } from "react";
const L = 0, R = 930, T = 8, B = 188;
const fmt = (ts, range) => new Date(ts).toLocaleString("en-NG", ["1H", "6H", "1D"].includes(range) ? { hour: "numeric", minute: "2-digit" } : { month: "short", day: "numeric" });
/** Draws stored history points [{ timestamp, yesKobo, noKobo }] at their real timestamps. */
export default function HistoryChart({ points, range, flat }) {
  const [hi, setHi] = useState(null);
  if (!points || points.length < 2) return <div className="grid h-48 place-items-center text-sm text-muted">Not enough history for this range yet.</div>;
  const t0 = +new Date(points[0].timestamp), t1 = +new Date(points[points.length - 1].timestamp), span = Math.max(1, t1 - t0);
  const X = (p) => L + ((+new Date(p.timestamp) - t0) / span) * (R - L), Y = (pct) => B - (pct / 100) * (B - T);
  const yes = points.map((p) => ({ x: X(p), y: Y(p.yesKobo / 100) })), no = points.map((p) => ({ x: X(p), y: Y(p.noKobo / 100) }));
  const d = (a) => a.map((q, i) => `${i ? "L" : "M"} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ");
  const move = (e) => {
    const b = e.currentTarget.getBoundingClientRect(), x = ((e.clientX - b.left) / b.width) * 1000;
    let best = 0, bd = Infinity; yes.forEach((q, i) => { const dd = Math.abs(q.x - x); if (dd < bd) { bd = dd; best = i; } }); setHi(best);
  };
  const ticks = [0, 1, 2, 3].map((i) => t0 + (span * i) / 3);
  const h = hi !== null ? points[hi] : null;
  return (
    <svg viewBox="0 0 1000 224" preserveAspectRatio="none" className="h-52 w-full cursor-crosshair overflow-visible" role="img" aria-label="YES and NO probability history" onPointerMove={move} onPointerLeave={() => setHi(null)}>
      <defs>
        <linearGradient id="h-yes" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#58a64d" stopOpacity=".16" /><stop offset="100%" stopColor="#58a64d" stopOpacity="0" /></linearGradient>
        <linearGradient id="h-no" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff4438" stopOpacity=".16" /><stop offset="100%" stopColor="#ff4438" stopOpacity="0" /></linearGradient>
      </defs>
      {[0, 20, 40, 60, 80, 100].map((v) => <g key={v}><line x1={L} x2={R} y1={Y(v)} y2={Y(v)} stroke="var(--hairline-strong)" strokeOpacity=".3" /><text x="990" y={Y(v) + 4} textAnchor="end" fill="var(--muted)" fillOpacity=".55" fontSize="14">{v}%</text></g>)}
      <path d={`${d(no)} L ${R} ${B} L ${L} ${B} Z`} fill="url(#h-no)" /><path d={`${d(yes)} L ${R} ${B} L ${L} ${B} Z`} fill="url(#h-yes)" />
      <path d={d(no)} fill="none" stroke="#ff4438" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /><path d={d(yes)} fill="none" stroke="#58a64d" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      <circle cx={yes[yes.length - 1].x} cy={yes[yes.length - 1].y} r="5" fill="#58a64d" /><circle cx={no[no.length - 1].x} cy={no[no.length - 1].y} r="5" fill="#ff4438" />
      {h && <g>
        <line x1={yes[hi].x} x2={yes[hi].x} y1={T} y2={B} stroke="var(--primary)" strokeOpacity=".45" />
        <circle cx={yes[hi].x} cy={yes[hi].y} r="6" fill="#58a64d" stroke="var(--card)" strokeWidth="2" /><circle cx={no[hi].x} cy={no[hi].y} r="6" fill="#ff4438" stroke="var(--card)" strokeWidth="2" />
        <g transform={`translate(${Math.max(4, Math.min(R - 150, yes[hi].x - 75))},0)`}><rect width="150" height="20" rx="6" fill="var(--card)" stroke="var(--hairline-strong)" /><text x="75" y="14" textAnchor="middle" fill="var(--muted)" fontSize="11">{new Date(h.timestamp).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} &middot; YES {Math.round(h.yesKobo / 100)}% NO {Math.round(h.noKobo / 100)}%</text></g>
      </g>}
      {ticks.map((t, i) => <text key={i} x={L + (i / 3) * (R - L)} y="216" textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"} fill="var(--muted)" fillOpacity=".65" fontSize="14">{fmt(t, range)}</text>)}
    </svg>
  );
}
