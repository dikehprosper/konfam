import { FiBriefcase, FiRefreshCw, FiTrendingUp } from "react-icons/fi";
import Header from "../../components/organisms/Header";
import useApiData from "../../hooks/useApiData";
import { api } from "../../utils/api";
import { useToast } from "../../context/ToastProvider";
import { fmtDate, nairaFromKobo } from "../../utils/format";

const money = (value) => value == null ? "—" : nairaFromKobo(value);
const pnlClass = (value) => value > 0 ? "text-up" : value < 0 ? "text-nofg" : "text-muted";

export default function Portfolio() {
  const toast = useToast();
  const portfolio = useApiData("/trades/portfolio", null, { refreshOn: "wallet:refresh", pollMs: 15000 });
  const trades = useApiData("/trades", null, { refreshOn: "wallet:refresh" });
  const data = portfolio.data;
  const positions = data?.items || [];
  const unsettled = positions.filter((position) => position.canSettle);

  const settle = async () => {
    try {
      const response = await api("post", "/trades/settle", {});
      const count = response.data.settled.length;
      toast(count ? `${count} position${count === 1 ? "" : "s"} settled` : "No positions are ready to settle");
      window.dispatchEvent(new Event("wallet:refresh"));
    } catch (error) {
      toast(error.message);
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1000px] space-y-7 px-4 pb-24 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="display text-3xl">Your portfolio</h1><p className="mt-1 text-sm text-muted">Positions and simulated trading performance.</p></div>
          <span className="rounded-full bg-yesbg px-3 py-1 text-xs font-semibold text-primary">DEMO MODE</span>
        </div>
        {portfolio.error && !data && <div role="alert" className="rounded-xl bg-nobg p-4 text-sm text-nofg">Couldn't load your portfolio. <button onClick={portfolio.refetch} className="font-semibold underline">Retry</button></div>}
        <section className="grid gap-3 sm:grid-cols-3">
          {[["Portfolio value", data?.portfolioValueKobo], ["Cash available", data?.cashKobo], ["Open profit / loss", data?.openPnlKobo]].map(([label, amount]) => (
            <div key={label} className="rounded-2xl bg-card p-4 shadow-sm"><div className="text-xs text-muted">{label}</div><b className={`display mt-1 block text-2xl ${label === "Open profit / loss" ? pnlClass(amount) : ""}`}>{portfolio.isLoading && !data ? "—" : money(amount)}</b></div>
          ))}
        </section>
        <p className="text-xs text-subtle">Portfolio value uses current contract prices. Estimated sale proceeds can differ because of market impact and demo trading fees; they are not withdrawable funds.</p>
        {unsettled.length > 0 && <button onClick={settle} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"><FiRefreshCw />Settle {unsettled.length} position{unsettled.length === 1 ? "" : "s"}</button>}
        <section>
          <h2 className="display text-2xl">Positions</h2>
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card px-4">
            {portfolio.isLoading && !data ? <div className="py-8 text-sm text-muted">Loading positions…</div>
              : positions.length ? positions.map((position) => (
                <article key={position.id} className="flex flex-wrap items-center gap-4 py-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-yesbg text-primary"><FiBriefcase /></span>
                  <div className="min-w-[220px] flex-1">
                    <a href={`/trade/${position.marketId}`} className="font-semibold hover:text-primary">{position.marketTitle}</a>
                    <p className="mt-1 text-xs text-muted">{position.side.toUpperCase()} · {position.contracts} contracts · Avg. entry {money(position.averageEntryPriceKobo)}</p>
                    <p className="mt-1 text-[11px] text-subtle">{position.settledAt ? `Settled ${fmtDate(position.settledAt, true)}` : `Closes ${fmtDate(position.closesAt, true)}`}</p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-xs text-muted">{position.settledAt ? "Settlement" : position.canSell ? "Current contract value" : position.marketStatus === "closed" ? "Last mark (not sellable)" : "Settlement value"}</div>
                    <b>{money(position.settledAt ? position.settledAmountKobo : position.currentValueKobo)}</b>
                    {position.canSell && <div className="mt-1 text-[11px] text-muted">Estimated sell: {money(position.estimatedValueKobo)}</div>}
                    {position.unrealizedPnlKobo != null && <div className={`text-xs ${pnlClass(position.unrealizedPnlKobo)}`}>P/L {money(position.unrealizedPnlKobo)}</div>}
                  </div>
                  {position.canSell && <a href={`/trade/${position.marketId}`} className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold">Sell</a>}
                  {position.canSettle && <span className="rounded-full bg-yesbg px-3 py-1 text-xs font-semibold text-primary">Ready to settle</span>}
                </article>
              )) : <div className="py-12 text-center"><FiTrendingUp className="mx-auto h-8 w-8 text-muted" /><h3 className="mt-3 font-semibold">No positions yet</h3><p className="mt-1 text-sm text-muted">Choose a market, buy YES or NO, and your demo position will appear here.</p><a href="/" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">Explore markets</a></div>}
          </div>
        </section>
        <section>
          <h2 className="display text-2xl">Recent trades</h2>
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card px-4">
            {trades.isLoading && !trades.data ? <div className="py-8 text-sm text-muted">Loading trades…</div>
              : trades.error && !trades.data ? <div className="py-8 text-sm text-muted">Couldn't load trades. <button onClick={trades.refetch} className="font-semibold text-primary">Retry</button></div>
                : trades.data?.items?.length ? trades.data.items.map((trade) => (
                  <div key={trade.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${trade.action === "buy" ? "bg-yesbg text-yesfg" : "bg-nobg text-nofg"}`}>{trade.action.toUpperCase()} {trade.side.toUpperCase()}</span>
                    <div className="min-w-[180px] flex-1"><b className="block truncate">{trade.marketTitle}</b><span className="text-xs text-muted">{trade.contracts} contracts · {fmtDate(trade.createdAt, true)}</span></div>
                    <div className="text-right"><b>{money(trade.totalAmountKobo)}</b><div className="text-[11px] text-muted">Fee {money(trade.feeKobo)}</div></div>
                  </div>
                )) : <p className="py-10 text-center text-sm text-muted">Your demo trades will show here.</p>}
          </div>
        </section>
      </main>
    </>
  );
}
