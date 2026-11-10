import { useEffect, useState } from "react";
import { FiEye, FiEyeOff, FiPlus, FiArrowUpRight, FiClock } from "react-icons/fi";
import Header from "../../components/organisms/Header";
import DepositModal from "../../components/molecules/modals/DepositModal";
import { useModal } from "../../context/ModalProvider";
import { useToast } from "../../context/ToastProvider";
import useApiData from "../../hooks/useApiData";
import { fmtDate, nairaFromKobo } from "../../utils/format";

const TABS = [["", "ALL"], ["deposit", "DEPOSITS"], ["trade", "TRADES"], ["withdrawal", "WITHDRAWALS"], ["payout", "PAYOUTS"]];
const Rows = () => [0, 1, 2, 3].map((i) => <div key={i} className="flex items-center gap-3 py-3"><div className="skel h-9 w-9 rounded-full" /><div className="flex-1 space-y-2"><div className="skel h-3 w-1/3" /><div className="skel h-3 w-1/4" /></div><div className="skel h-4 w-20" /></div>);

export default function Cash() {
  const { openModal } = useModal(); const toast = useToast();
  const [hide, setHide] = useState(false); const [type, setType] = useState(""); const [q, setQ] = useState(""); const [dq, setDq] = useState(""); const [page, setPage] = useState(1);
  const wallet = useApiData("/wallet", null, { refreshOn: "wallet:refresh", pollMs: 15000 });
  useEffect(() => { const t = setTimeout(() => { setDq(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  const tx = useApiData("/transactions", null, { params: { type, q: dq, page, limit: 10 }, refreshOn: "wallet:refresh" });
  const val = (k) => (hide ? "\u2022\u2022\u2022\u2022" : k == null ? "\u2014" : nairaFromKobo(k));
  const w = wallet.data, items = tx.data?.items || [];
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[900px] space-y-8 px-4 pb-24 pt-4">
        <section className="rise rounded-2xl bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted">Cash<button aria-label="Toggle visibility" onClick={() => setHide(!hide)}>{hide ? <FiEyeOff /> : <FiEye />}</button></div>
          {wallet.isLoading && !w ? <div className="skel mt-2 h-10 w-48" /> : <div className="display mt-1 text-4xl tabular-nums">{val(w?.cashKobo)}</div>}
          <p className="text-xs text-muted">Available to trade or withdraw</p>
          {wallet.error && !w && <p className="mt-2 text-xs text-red-600">Couldn't load your balance. <button onClick={wallet.refetch} className="font-semibold underline">Retry</button></p>}
          <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl bg-hairline p-3 text-xs"><div><div className="text-muted">Total balance</div><b className="text-sm">{val(w?.totalBalanceKobo)}</b></div><div><div className="text-muted">On hold</div><b className="text-sm">{val(w?.onHoldKobo)}</b></div></div>
          {w?.mode === "demo" && <p className="mt-3 text-[11px] text-subtle">Demo mode: balances are practice money, not real funds.</p>}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={() => openModal(<DepositModal />, "max-w-[440px]")} className="flex items-center justify-center gap-1.5 rounded-full bg-primary py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"><FiPlus />Deposit</button>
            <button onClick={() => toast("Withdrawals aren't available yet")} className="flex items-center justify-center gap-1.5 rounded-full border border-line py-3 text-sm font-semibold"><FiArrowUpRight />Withdraw</button>
          </div>
        </section>
        <section>
          <h2 className="display text-2xl">Transaction history</h2>
          <div role="tablist" className="mt-4 flex gap-6 overflow-x-auto border-b border-line">{TABS.map(([v, l]) => <button key={l} role="tab" aria-selected={type === v} onClick={() => { setType(v); setPage(1); }} className={`whitespace-nowrap py-2 text-xs font-semibold tracking-wide transition-colors ${type === v ? "border-b-2 border-primary text-primary" : "text-muted"}`}>{l}</button>)}</div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reference" aria-label="Search reference" className="mt-4 w-full rounded-full border border-line bg-transparent px-4 py-2 text-sm outline-none focus:border-primary" />
          <div className="mt-2 divide-y divide-line">
            {tx.isLoading && !tx.data ? <Rows /> : tx.error && !tx.data ? <p className="py-10 text-center text-sm text-muted">Couldn't load transactions. <button onClick={tx.refetch} className="font-semibold text-primary">Retry</button></p> :
              items.length ? items.map((t) => (
                <div key={t.id} className="rise flex items-center gap-3 py-3 text-sm">
                  <span className={`grid h-9 w-9 place-items-center rounded-full ${t.direction === "credit" ? "bg-green-100 text-green-700" : "bg-nobg text-nofg"}`}>{t.direction === "credit" ? <FiPlus /> : <FiArrowUpRight />}</span>
                  <div className="min-w-0 flex-1"><b className="block truncate">{t.description || t.type}</b><span className="text-xs text-muted">{fmtDate(t.createdAt, true)} &middot; {t.reference}</span></div>
                  <b className={`tabular-nums ${t.direction === "credit" ? "text-up" : ""}`}>{t.direction === "credit" ? "+" : "-"}{nairaFromKobo(t.amountKobo)}</b>
                </div>)) : (
                <div className="rise py-14 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-yesbg text-primary"><FiClock /></div>
                  <h3 className="mt-3 font-semibold">{dq || type ? "No matching transactions" : "No transaction activity"}</h3><p className="mt-1 text-sm text-muted">{dq || type ? "Try a different filter or search." : "After you make a deposit or withdraw, your transactions will be displayed here."}</p></div>)}
          </div>
          {tx.data && (page > 1 || tx.data.nextPage) && <div className="flex justify-between pt-4 text-sm"><button disabled={page < 2} onClick={() => setPage(page - 1)} className="rounded-full border border-line px-4 py-1.5 disabled:opacity-40">Previous</button><button disabled={!tx.data.nextPage} onClick={() => setPage(page + 1)} className="rounded-full border border-line px-4 py-1.5 disabled:opacity-40">Next</button></div>}
        </section>
      </main>
    </>
  );
}
