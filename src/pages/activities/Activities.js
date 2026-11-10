import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiActivity, FiChevronDown } from "react-icons/fi";
import Header from "../../components/organisms/Header";
import useApiData from "../../hooks/useApiData";
import { api } from "../../utils/api";
import { fmtDate, nairaFromKobo } from "../../utils/format";

const TABS = ["all", "order", "trade", "settlement", "deposit", "withdrawal"];
const RANGES = [["today", "Today"], ["last_week", "Last week"], ["this_month", "This month"], ["all", "All time"], ["custom", "Custom"]];
const EMPTY = { all: "After you place orders, make trades, or receive payouts, your activity will appear here.", order: "Orders you place will appear here.", trade: "Your trades will appear here.", settlement: "Payouts from resolved markets will appear here.", deposit: "Your deposits will appear here.", withdrawal: "Your withdrawals will appear here." };
const Rows = () => [0, 1, 2, 3, 4].map((i) => <div key={i} className="flex items-center gap-3 py-3"><div className="skel h-10 w-10 rounded-full" /><div className="flex-1 space-y-2"><div className="skel h-3 w-2/5" /><div className="skel h-3 w-1/4" /></div></div>);

export default function Activities() {
  const [sp, setSp] = useSearchParams(); const tab = TABS.includes(sp.get("tab")) ? sp.get("tab") : "all"; const range = RANGES.some(([k]) => k === sp.get("range")) ? sp.get("range") : "all";
  const from = sp.get("from") || "", to = sp.get("to") || ""; const [menu, setMenu] = useState(false); const [more, setMore] = useState({ items: [], page: 1, next: null, busy: false });
  const params = { type: tab, range, from: range === "custom" ? from : undefined, to: range === "custom" ? to : undefined, page: 1, limit: 15 };
  const q = useApiData("/activities", null, { params, refreshOn: "wallet:refresh" });
  useEffect(() => { setMore({ items: [], page: 1, next: null, busy: false }); }, [tab, range, from, to]);
  const set = (o) => { const n = new URLSearchParams(sp); Object.entries(o).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); setSp(n, { replace: true }); };
  const base = q.data?.items || [], next = more.page > 1 ? more.next : q.data?.nextPage;
  const items = [...base, ...more.items.filter((m) => !base.some((b) => b.id === m.id))];
  const load = async () => { if (!next || more.busy) return; setMore((m) => ({ ...m, busy: true })); try { const d = (await api("get", "/activities", null, { params: { ...params, page: next } })).data; setMore((m) => ({ items: [...m.items, ...d.items], page: next, next: d.nextPage, busy: false })); } catch { setMore((m) => ({ ...m, busy: false })); } };
  const label = RANGES.find(([k]) => k === range)[1];
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[900px] px-4 pb-24 pt-4">
        <div className="flex items-center justify-between"><h1 className="display text-3xl">Your activities</h1>
          <div className="relative"><button onClick={() => setMenu(!menu)} aria-expanded={menu} className="flex items-center gap-1 rounded-full bg-hairline px-3 py-1.5 text-xs">Date &middot; <b>{label}</b><FiChevronDown /></button>
            {menu && <div className="rise absolute right-0 top-9 z-20 w-40 rounded-xl bg-popover p-1 shadow-xl">{RANGES.map(([k, l]) => <button key={k} onClick={() => { set({ range: k === "all" ? "" : k }); if (k !== "custom") { set({ from: "", to: "" }); setMenu(false); } }} className={`block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-hairline ${range === k ? "font-semibold text-primary" : ""}`}>{l}</button>)}</div>}</div></div>
        {range === "custom" && <div className="mt-3 flex flex-wrap gap-2 text-xs"><label>From <input type="date" value={from} max={to || undefined} onChange={(e) => set({ from: e.target.value })} className="ml-1 rounded-lg border border-line bg-transparent px-2 py-1" /></label><label>To <input type="date" value={to} min={from || undefined} onChange={(e) => set({ to: e.target.value })} className="ml-1 rounded-lg border border-line bg-transparent px-2 py-1" /></label></div>}
        <div role="tablist" className="mt-5 flex gap-6 overflow-x-auto border-b border-line">{TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => set({ tab: t === "all" ? "" : t })} className={`whitespace-nowrap py-2 text-xs font-semibold tracking-wide transition-colors ${tab === t ? "border-b-2 border-primary text-fg" : "text-muted hover:text-fg"}`}>{t.toUpperCase()}</button>)}</div>
        <div key={`${tab}-${range}`} className="mt-2 divide-y divide-line">
          {q.isLoading && !q.data ? <Rows /> : q.error && !q.data ? <p className="py-14 text-center text-sm text-muted">Couldn't load activity. <button onClick={q.refetch} className="font-semibold text-primary">Retry</button></p>
            : items.length ? items.map((a, i) => <div key={a.id} className="rise flex items-center gap-3 py-3 text-sm" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-yesbg text-primary"><FiActivity /></span><div className="min-w-0 flex-1"><b className="block truncate">{a.title}</b><span className="text-xs text-muted">{fmtDate(a.createdAt, true)} &middot; {a.status}</span></div>
                {a.amountKobo != null && <b className="tabular-nums">{nairaFromKobo(a.amountKobo)}</b>}</div>)
            : <div className="rise py-16 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-yesbg text-primary"><FiActivity /></div><h2 className="mt-3 font-semibold">{tab === "all" && range === "all" ? "No activities yet" : "No activity matches these filters"}</h2>
                <p className="mt-1 text-sm text-muted">{tab === "all" && range === "all" ? EMPTY.all : "Try a different date range or activity type."}</p></div>}
        </div>
        {next && <div className="flex justify-center pt-4"><button disabled={more.busy} onClick={load} className="rounded-full border border-line px-6 py-2 text-sm font-medium disabled:opacity-50">{more.busy ? "Loading\u2026" : "Show more"}</button></div>}
      </main>
    </>
  );
}
