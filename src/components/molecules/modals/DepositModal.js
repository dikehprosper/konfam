import { useMemo, useState } from "react";
import { FiArrowLeft, FiLock, FiCheckCircle } from "react-icons/fi";
import { axiosAuth } from "../../../Config/axios";
import { useModal } from "../../../context/ModalProvider";
import { useToast } from "../../../context/ToastProvider";
import useApiData from "../../../hooks/useApiData";
import { DEPOSIT_LIMITS } from "../../../constants/topics";
import { nairaFromKobo } from "../../../utils/format";

const CHIPS = [1000, 5000, 10000, 50000];
const MESSAGES = { BELOW_MINIMUM: null, ABOVE_MAXIMUM: null, KYC_REQUIRED: "Verify your identity before you can continue. Go to Settings \u2192 Identity Verification.", SIMULATION_DISABLED: "Deposits are not available right now." };
const newKey = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : `k-${Date.now()}-${Math.random().toString(36).slice(2)}`);

/** Deposit flow: amount -> choose how to pay -> success. Demo money only; the server enforces every rule. */
export default function DepositModal() {
  const { closeModal } = useModal(); const toast = useToast();
  const wallet = useApiData("/wallet", null); const providers = useApiData("/deposits/providers", null);
  const [step, setStep] = useState(1); const [raw, setRaw] = useState(""); const [method, setMethod] = useState("card"); const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(""); const [done, setDone] = useState(null); const key = useMemo(newKey, []); // same key on retry = no double credit
  const amountKobo = Math.round(Number(raw || 0) * 100);
  const invalid = !raw ? "" : !Number.isFinite(amountKobo) || amountKobo <= 0 ? "Enter a valid amount." : amountKobo < DEPOSIT_LIMITS.minKobo ? `Minimum deposit is ${nairaFromKobo(DEPOSIT_LIMITS.minKobo, 0)}.` : amountKobo > DEPOSIT_LIMITS.maxKobo ? `Maximum deposit is ${nairaFromKobo(DEPOSIT_LIMITS.maxKobo, 0)}.` : "";
  const ok = raw && !invalid;
  const setAmount = (v) => { setErr(""); setRaw(v.replace(/[^\d.]/g, "").replace(/(\.\d{0,2}).*/, "$1")); };
  const list = providers.data || [];

  const pay = async () => {
    setBusy(true); setErr("");
    try {
      const token = localStorage.getItem("Tkn");
      const r = await axiosAuth().post("/deposits", { amountKobo }, { headers: { Authorization: `Bearer ${token}`, "Idempotency-Key": key } });
      setDone(r.data.data); window.dispatchEvent(new Event("wallet:refresh"));
    } catch (e) {
      const d = e?.response?.data; const msg = (d && (MESSAGES[d.code] || d.message)) || "We couldn't complete the deposit. Please try again.";
      setErr(msg); if (d?.code === "KYC_REQUIRED") toast(msg);
    } finally { setBusy(false); }
  };

  if (done) return (
    <div className="rise w-full rounded-2xl bg-popover p-6 text-center">
      <FiCheckCircle className="mx-auto h-10 w-10 text-up" aria-hidden />
      <h3 className="display mt-3 text-xl">Deposit successful</h3>
      <p className="mt-1 text-sm text-muted">{nairaFromKobo(done.amountKobo)} was added to your demo wallet.</p>
      <p className="mt-1 text-xs text-subtle">Ref {done.reference} &middot; New cash balance {nairaFromKobo(done.wallet.cashKobo)}</p>
      <button onClick={closeModal} className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white">Done</button>
    </div>
  );
  return (
    <div className="w-full rounded-2xl bg-popover p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">{step === 2 && <button aria-label="Back" onClick={() => setStep(1)} className="rounded-full border border-line p-1.5"><FiArrowLeft /></button>}
          <h3 className="display text-lg">{step === 1 ? "Deposit to Konfam" : "Choose how to pay"}</h3></div>
        <button aria-label="Close" onClick={closeModal} className="text-xl text-muted">&times;</button>
      </div>
      <p className="mt-1 text-xs text-muted">{step === 1 ? `Cash balance ${wallet.data ? nairaFromKobo(wallet.data.cashKobo) : "\u2014"}` : `Depositing ${nairaFromKobo(amountKobo)}`}</p>
      <div className="mt-3 rounded-lg bg-yesbg px-3 py-2 text-xs text-primary">Demo mode: this adds practice money, not real funds.</div>
      {step === 1 ? (
        <>
          <label className="mt-4 block">
            <span className="sr-only">Amount in Naira</span>
            <div className={`flex items-center rounded-xl bg-hairline px-4 py-3 ${invalid ? "ring-1 ring-red-500" : "focus-within:ring-1 focus-within:ring-primary"}`}>
              <span className="mr-1 text-2xl font-semibold">&#8358;</span>
              <input inputMode="decimal" autoFocus value={raw} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full bg-transparent text-2xl font-semibold outline-none" />
            </div>
          </label>
          <p className={`mt-1.5 text-[11px] ${invalid ? "text-red-600" : "text-subtle"}`}>{invalid || `Minimum ${nairaFromKobo(DEPOSIT_LIMITS.minKobo, 0)} \u00b7 Maximum ${nairaFromKobo(DEPOSIT_LIMITS.maxKobo, 0)}`}</p>
          <div className="mt-3 flex flex-wrap gap-2">{CHIPS.map((c) => <button key={c} onClick={() => setAmount(String(c))} className={`rounded-full border px-3 py-1 text-xs transition-colors ${Number(raw) === c ? "border-primary bg-yesbg text-primary" : "border-line"}`}>&#8358;{c.toLocaleString()}</button>)}</div>
          <button disabled={!ok} onClick={() => setStep(2)} className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40">Continue</button>
        </>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[["card", "Card", "Visa, Mastercard, Verve"], ["bank_transfer", "Bank transfer", "From any Nigerian bank"]].map(([id, t, d]) => (
              <button key={id} onClick={() => setMethod(id)} className={`rounded-xl border p-3 text-left transition-colors ${method === id ? "border-primary bg-yesbg" : "border-line"}`}><b className="text-sm">{t}</b><div className="text-[11px] text-muted">{d}</div></button>))}
          </div>
          <div className="mt-4 text-xs text-muted">Pay with</div>
          <div className="mt-2 space-y-2">
            {providers.isLoading ? <div className="skel h-14" /> : providers.error ? (
              <div role="alert" className="rounded-lg bg-nobg px-3 py-2 text-xs text-nofg">
                <p>Couldn&apos;t load payment options. {providers.error?.response?.status === 401 ? "Please sign in again." : "Check your connection and try again."}</p>
                <button onClick={providers.refetch} className="mt-2 font-semibold underline">Retry</button>
              </div>
            ) : list.filter((p) => p.methods.includes(method) && p.enabled).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-primary bg-card p-3">
                <div><b className="text-sm">{p.name}</b>{p.recommended && <span className="ml-2 rounded bg-green-100 px-1.5 text-[10px] text-green-700">Recommended</span>}{p.simulated && <span className="ml-2 rounded bg-yesbg px-1.5 text-[10px] text-primary">Demo</span>}<div className="text-[11px] text-muted">Simulated payment, no real money moves</div></div>
                <span className="h-3 w-3 rounded-full bg-primary" aria-hidden />
              </div>))}
            {!providers.isLoading && !providers.error && !list.some((p) => p.methods.includes(method) && p.enabled) && <p className="text-xs text-red-600">No payment option is enabled right now. Please try again later.</p>}
          </div>
          {err && <p role="alert" className="mt-3 rounded-lg bg-nobg px-3 py-2 text-xs text-nofg">{err}</p>}
          <button disabled={busy || providers.isLoading || providers.error || !list.some((p) => p.methods.includes(method) && p.enabled)} onClick={pay} className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50">{busy ? "Processing\u2026" : `Pay ${nairaFromKobo(amountKobo)}`}</button>
          <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-subtle"><FiLock aria-hidden />Secured by licensed payment partners (demo)</p>
        </>
      )}
    </div>
  );
}
