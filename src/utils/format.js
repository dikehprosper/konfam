export const nairaFromKobo = (k, dp = 2) => `\u20a6${(Number(k || 0) / 100).toLocaleString("en-NG", { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
export const compactNaira = (k) => {
  const n = Number(k || 0) / 100;
  if (n >= 1e9) return `\u20a6${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `\u20a6${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `\u20a6${(n / 1e3).toFixed(1)}K`;
  return `\u20a6${n.toFixed(0)}`;
};
/** "57d", "5h", "12m", "Ended" from a real timestamp. */
export const timeLeft = (iso, now = Date.now()) => {
  const ms = new Date(iso).getTime() - now; if (!(ms > 0)) return "Ended";
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5), m = Math.floor(ms / 6e4);
  return d >= 1 ? `${d}d` : h >= 1 ? `${h}h` : `${m}m`;
};
/** "52d 12h 44m 28s" ticking countdown text. */
export const countdown = (iso, now = Date.now()) => {
  let s = Math.floor((new Date(iso).getTime() - now) / 1000); if (!(s > 0)) return "Ended";
  const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); s %= 60;
  return [d && `${d}d`, (d || h) && `${h}h`, `${m}m`, `${s}s`].filter(Boolean).join(" ");
};
export const fmtDate = (iso, withTime) => new Date(iso).toLocaleString("en-NG", { month: "short", day: "numeric", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) });
