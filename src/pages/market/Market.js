import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiLink, FiBookmark, FiChevronDown, FiTrendingUp, FiAward } from "react-icons/fi";
import { api } from "../../utils/api";
import Header from "../../components/organisms/Header";
import HistoryChart from "../../components/organisms/HistoryChart";
import LoginModal from "../../components/molecules/modals/LoginModal";
import DepositModal from "../../components/molecules/modals/DepositModal";
import { useModal } from "../../context/ModalProvider";
import { useToast } from "../../context/ToastProvider";
import useApiData from "../../hooks/useApiData";
import { compactNaira, countdown, fmtDate, nairaFromKobo } from "../../utils/format";

const RANGES = ["1H", "6H", "1D", "7D", "1M", "All"];
const CHIPS = [1000, 10000, 15000];
const PAYOUT_KOBO = 10000;

const Skeleton = () => (
  <div className="mx-auto max-w-[1100px] space-y-5 px-4" aria-busy="true">
    <div className="skel h-8 w-40" /><div className="skel h-28 w-full" /><div className="grid gap-5 lg:grid-cols-[1fr_340px]"><div className="skel h-80" /><div className="skel h-80" /></div>
  </div>
);
const Fold = ({ title, children }) => (
  <details className="group rounded-xl border border-line bg-card">
    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">{title}<FiChevronDown className="transition-transform group-open:rotate-180" aria-hidden /></summary>
    <div className="rise px-4 pb-4 text-sm text-muted">{children}</div>
  </details>
);

function TradePanel({ m, token, onTrade }) {
  const { openModal } = useModal(); const toast = useToast();
  const [tab, setTab] = useState("buy"); const [side, setSide] = useState(null); const [amt, setAmt] = useState("");
  const [quoteState, setQuoteState] = useState({ quote: null, error: "", loading: false });
  const [busy, setBusy] = useState(false);
  const portfolio = useApiData("/trades/portfolio", null, { skip: !token, refreshOn: "wallet:refresh" });
  const wallet = useApiData("/wallet", null, { skip: !token, refreshOn: "wallet:refresh" });
  const resolved = m.status === "resolved", closed = m.status !== "active";
  const position = portfolio.data?.items?.find((p) => p.marketId === m.id && p.side === side && !p.settledAt);
  const availableContracts = position?.contracts || 0;
  const rawAmount = tab === "buy" ? Math.round(Number(amt) * 100) : Number.parseInt(amt, 10);

  useEffect(() => {
    setQuoteState({ quote: null, error: "", loading: false });
    if (!token || closed || !side || !Number.isSafeInteger(rawAmount) || rawAmount <= 0 ||
      (tab === "sell" && (!availableContracts || rawAmount > availableContracts))) return undefined;
    let active = true;
    const timer = setTimeout(async () => {
      setQuoteState({ quote: null, error: "", loading: true });
      try {
        const order = tab === "buy"
          ? { marketId: m.id, side, action: tab, amountKobo: rawAmount }
          : { marketId: m.id, side, action: tab, contracts: rawAmount };
        const response = await api("post", "/trades/quote", order);
        if (active) setQuoteState({ quote: response.data, error: "", loading: false });
      } catch (error) {
        if (active) setQuoteState({ quote: null, error: error.message, loading: false });
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [m.id, token, closed, side, tab, rawAmount, availableContracts]);

  const executeTrade = async () => {
    if (!quoteState.quote || !side) return;
    setBusy(true);
    try {
      const body = tab === "buy"
        ? { marketId: m.id, side, action: tab, amountKobo: rawAmount }
        : { marketId: m.id, side, action: tab, contracts: rawAmount };
      const idempotencyKey = window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `trade-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const response = await api("post", "/trades", body, { headers: { "Idempotency-Key": idempotencyKey } });
      const trade = response.data.trade;
      toast(`${tab === "buy" ? "Bought" : "Sold"} ${trade.contracts} ${trade.side.toUpperCase()} contracts`);
      setAmt("");
      setQuoteState({ quote: null, error: "", loading: false });
      window.dispatchEvent(new Event("wallet:refresh"));
      onTrade();
    } catch (error) {
      toast(error.message);
      setQuoteState({ quote: null, error: error.message, loading: false });
    } finally { setBusy(false); }
  };

  if (resolved) return (
    <aside className="rounded-2xl border border-line bg-card p-4 lg:sticky lg:top-4">
      <div className="flex gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-hairline text-primary"><FiTrendingUp /></div><p className="text-sm font-medium">{m.title}</p></div>
      <div className="mt-4 rounded-full border border-line py-2.5 text-center font-semibold">{m.resolutionOutcome.toUpperCase()} {m.resolutionOutcome === "yes" ? "\u2713" : "\u2717"}</div>
    </aside>
  );
  const canSubmit = !!token && !closed && !!quoteState.quote && !quoteState.loading && !busy;
  return (
    <aside className="rounded-2xl border border-line bg-card lg:sticky lg:top-4">
      <div className="flex items-center justify-between border-b border-line px-4">
        <div className="relative flex gap-5">{["buy", "sell"].map((t) => <button key={t} onClick={() => { setTab(t); setAmt(""); }} className={`py-3 text-xs font-semibold tracking-wide transition-colors ${tab === t ? "border-b-2 border-primary text-fg" : "text-muted"}`}>{t.toUpperCase()}</button>)}</div>
        <span className="text-xs text-muted">Demo Naira</span>
      </div>
      <div className="p-4">
        {(m.simulatedTraderCount || 0) > 0 && <p className="mb-3 rounded-lg bg-yesbg px-3 py-2 text-[11px] text-primary">{m.simulatedTraderCount} synthetic demo traders may trade this market; prices and volume are simulated.</p>}
        {token && <div className="mb-3 flex items-center justify-between rounded-xl bg-hairline px-3 py-2 text-xs">
          <span className="text-muted">Demo cash available</span>
          <b>{wallet.data ? nairaFromKobo(wallet.data.cashKobo) : wallet.error ? "Unavailable" : "Loading\u2026"}</b>
        </div>}
        <div className="flex gap-3"><div className="grid h-12 w-12 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-hairline text-primary"><FiTrendingUp /></div>
          <div className="min-w-0"><p className="line-clamp-3 text-sm font-medium">{m.title}</p><p className="mt-1 text-xs font-semibold text-primary">{side ? `${tab === "buy" ? "Buying" : "Selling"} ${side.toUpperCase()}` : "Select YES or NO"} &middot; {countdown(m.closesAt)}</p></div></div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[["yes", m.yesPriceKobo, "bg-yesbg text-yesfg"], ["no", m.noPriceKobo, "bg-nobg text-nofg"]].map(([k, p, c]) => (
            <button key={k} onClick={() => setSide(k)} className={`flex items-center justify-between rounded-full px-4 py-2.5 text-sm transition-all hover:-translate-y-0.5 ${side === k ? "bg-primary text-white" : c}`}><span>{k.toUpperCase()}</span><b>{"\u20a6"}{Math.round(p / 100)}</b></button>))}
        </div>
        <label className="mt-4 block"><span className="sr-only">{tab === "buy" ? "Spend limit in Naira" : "Number of contracts to sell"}</span>
          <input inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} placeholder={tab === "buy" ? "\u20a60" : "Contracts"} className="w-full rounded-xl border border-line bg-transparent px-4 py-3 text-center text-lg font-semibold outline-none focus:border-primary" /></label>
        {tab === "buy" ? (
          <>
            <div className="mt-2 flex flex-wrap justify-center gap-2">{CHIPS.map((c) => <button key={c} onClick={() => setAmt(String(Number(amt || 0) + c))} className="rounded-full border border-line px-3 py-1 text-[11px]">+{"\u20a6"}{c.toLocaleString()}</button>)}</div>
            <p className="mt-2 text-center text-[11px] text-subtle">Enter a spend limit. The server quotes contracts and fees. Minimum order: {nairaFromKobo(m.minOrderKobo)}.</p>
          </>
        ) : (
          <>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[11px]">
              <span className="text-muted">{position ? `${position.contracts} ${side?.toUpperCase() || ""} contracts available` : "No position to sell"}</span>
              {[["25%", 0.25], ["50%", 0.5], ["MAX", 1]].map(([label, fraction]) => <button key={label} disabled={!position} onClick={() => setAmt(String(Math.max(1, Math.floor(position.contracts * fraction))))} className="rounded-full border border-line px-3 py-1 disabled:opacity-40">{label}</button>)}
            </div>
            <p className="mt-2 text-center text-[11px] text-subtle">Sell contracts from your position at the current demo quote.</p>
          </>
        )}
        {quoteState.loading && <p className="mt-3 text-center text-xs text-muted">Calculating server quote\u2026</p>}
        {quoteState.error && <p role="alert" className="mt-3 rounded-lg bg-nobg px-3 py-2 text-xs text-nofg">{quoteState.error}</p>}
        {quoteState.quote && <div className="mt-3 space-y-1 rounded-xl bg-hairline p-3 text-xs">
          <div className="flex justify-between"><span>{tab === "buy" ? "Contracts to receive" : "Contracts to sell"}</span><b>{quoteState.quote.contracts} {side?.toUpperCase()}</b></div>
          <div className="flex justify-between"><span>Average price</span><b>{nairaFromKobo(quoteState.quote.averagePriceKobo)} / contract</b></div>
          <div className="flex justify-between"><span>Trade fee</span><b>{nairaFromKobo(quoteState.quote.feeKobo)}</b></div>
          <div className="flex justify-between border-t border-line pt-1"><span>{tab === "buy" ? "Total debit" : "Estimated proceeds"}</span><b>{nairaFromKobo(quoteState.quote.totalAmountKobo)}</b></div>
          {tab === "buy" && <div className="flex justify-between"><span>Potential payout if correct</span><b>{nairaFromKobo(quoteState.quote.potentialPayoutKobo)}</b></div>}
          <div className="flex justify-between text-muted"><span>Market price after order</span><b>{nairaFromKobo(side === "yes" ? quoteState.quote.marketPriceAfterKobo : PAYOUT_KOBO - quoteState.quote.marketPriceAfterKobo)}</b></div>
        </div>}
        <p className="mt-3 text-center text-[11px] text-subtle">Demo only. If your side loses, its contracts settle at {"\u20a60"}.</p>
        {!token ? (
          <button onClick={() => openModal(<LoginModal mode="signup" />, "max-w-[640px]")} className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white">Sign up to trade</button>
        ) : (
          <button disabled={!canSubmit} onClick={executeTrade} className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40">
            {busy ? "Placing order\u2026" : closed ? "Trading closed" : quoteState.loading ? "Getting quote\u2026" : quoteState.quote ? `${tab === "buy" ? "Buy" : "Sell"} ${quoteState.quote.contracts} contracts` : "Enter an amount"}
          </button>
        )}
        {token && !closed && <button onClick={() => openModal(<DepositModal />, "max-w-[440px]")} className="mt-2 w-full text-center text-xs font-semibold text-primary">Add demo funds</button>}
      </div>
    </aside>
  );
}

export default function Market() {
  const { id } = useParams(); const nav = useNavigate(); const toast = useToast(); const { openModal } = useModal();
  const [range, setRange] = useState("1D"); const [now, setNow] = useState(Date.now()); const token = localStorage.getItem("Tkn");
  const mkt = useApiData(`/markets/${id}`, null, { pollMs: 10000 });
  const hist = useApiData(`/markets/${id}/history`, null, { params: { range }, pollMs: 15000 });
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const m = mkt.data;
  const wl = useApiData("/watchlist", null, { skip: !token, refreshOn: "watch:refresh" }); const saved = !!wl.data?.ids?.includes(id);
  const toggleSave = async () => {
    if (!token) return openModal(<LoginModal mode="login" />, "max-w-[640px]");
    try { await api(saved ? "delete" : "post", `/watchlist/${id}`); toast(saved ? "Removed from favorites" : "Market added to favorites successfully"); window.dispatchEvent(new Event("watch:refresh")); } catch (e) { toast(e.message); }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(window.location.href); toast("Link copied"); } catch { toast("Couldn't copy the link"); } };
  if (mkt.isLoading && !m) return <><Header /><Skeleton /></>;
  if (!m) return (
    <><Header /><div className="rise mx-auto my-20 max-w-sm text-center"><h1 className="display text-2xl">{mkt.error?.response?.status === 404 ? "Market not found" : "We couldn't load this market"}</h1>
      <button onClick={mkt.error?.response?.status === 404 ? () => nav("/") : mkt.refetch} className="mt-4 rounded-full border border-line px-5 py-2 text-sm font-medium">{mkt.error?.response?.status === 404 ? "Back to markets" : "Retry"}</button></div></>
  );
  const resolved = m.status === "resolved";
  return (
    <>
      <Header />
      <div className="bg-hairline/60">
        <div className="mx-auto max-w-[1100px] px-4 pb-6 pt-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <nav aria-label="Breadcrumb"><a href="/" className="hover:text-primary">Home</a> &rsaquo; <a href={`/?topic=${encodeURIComponent(m.topic)}`} className="font-medium text-fg">{m.topic}</a></nav>
            <div className="flex"><button aria-label="Copy link" onClick={copy} className="rounded-full p-2 hover:bg-card"><FiLink /></button><button aria-label={saved ? "Remove from watchlist" : "Add to watchlist"} aria-pressed={saved} onClick={toggleSave} className="rounded-full p-2 text-primary hover:bg-card"><FiBookmark className={saved ? "fill-current" : ""} /></button></div>
          </div>
          <div className="rise mt-4 flex items-start gap-4"><div className="grid h-16 w-16 flex-shrink-0 place-items-center overflow-hidden rounded-full border-2 border-card bg-card text-primary sm:h-24 sm:w-24">{m.imageUrl ? <img src={m.imageUrl} alt="" className="h-full w-full object-cover" /> : <FiTrendingUp className="h-7 w-7" />}</div>
            <h1 className="display text-2xl leading-tight sm:text-4xl">{m.title}</h1></div>
          <div className="mt-5 flex flex-wrap gap-8 text-sm">
            <div><b className="block text-base">{compactNaira(m.volumeKobo)}</b><span className="text-xs text-muted">Trade volume</span></div>
            <div><b className="block text-base tabular-nums">{resolved || m.status === "closed" ? "Ended" : countdown(m.closesAt, now)}</b><span className="text-xs text-muted">{m.status === "active" ? `Ending on ${fmtDate(m.closesAt)}` : `Ended on ${fmtDate(m.closesAt)}`}</span></div>
          </div>
        </div>
      </div>
      <main className="mx-auto grid max-w-[1100px] gap-6 px-4 py-6 pb-28 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {resolved && <div className="rise flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm dark:bg-green-900/20"><span className="grid h-9 w-9 place-items-center rounded-full bg-green-600 text-white"><FiAward /></span><div><div className="text-xs text-muted">This market has been resolved</div><b>Resolved: {m.resolutionOutcome.toUpperCase()}</b></div></div>}
          <section>
            <div className="mb-2 flex items-center gap-4 text-xs text-muted"><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#58a64d]" />YES {m.probability}%</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#ff4438]" />NO {100 - m.probability}%</span></div>
            {hist.isLoading && !hist.data ? <div className="skel h-52 w-full" /> : hist.error && !hist.data ? <div className="grid h-52 place-items-center text-sm text-muted">Couldn't load history. <button onClick={hist.refetch} className="ml-2 font-semibold text-primary">Retry</button></div> : <div key={range} className="rise"><HistoryChart points={hist.data?.points} range={range} /></div>}
            <div className="mt-3 flex justify-end gap-1">{RANGES.map((r) => <button key={r} onClick={() => setRange(r)} aria-pressed={range === r} className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${range === r ? "border-primary text-primary" : "border-transparent text-muted hover:text-fg"}`}>{r}</button>)}</div>
          </section>
          <section aria-labelledby="rules" className="space-y-3">
            <h2 id="rules" className="display text-xl">Rules</h2>
            <p className="text-sm leading-relaxed text-muted">{m.description}</p>
            <dl className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-card p-4 text-sm">
              {[["Open date", fmtDate(m.opensAt, true)], ["Settlement date", fmtDate(m.settlesAt || m.closesAt, true)], ["Minimum per order", nairaFromKobo(m.minOrderKobo)], ["Source agency", m.sourceAgency || "\u2014"]].map(([k, v]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
            </dl>
            <Fold title="Timeline and payout updates">
              <ol className="space-y-2 border-l border-line pl-4"><li>Market opens &middot; {fmtDate(m.opensAt, true)}</li><li>Market closes &middot; {fmtDate(m.closesAt, true)}</li><li>Estimated payout &middot; about 3 days after resolution</li></ol>
              <p className="mt-3 text-xs text-subtle">Market ID: {m.code}</p>
            </Fold>
            <Fold title="Trading restrictions">
              <p>The following are prohibited from trading this contract:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5"><li>Employees of the resolution source</li><li>Anyone with non-public information about the outcome</li><li>Residents of jurisdictions where these markets are not permitted</li></ul>
            </Fold>
          </section>
        </div>
        <TradePanel m={m} token={token} onTrade={() => { mkt.refetch(); hist.refetch(); }} />
      </main>
    </>
  );
}
