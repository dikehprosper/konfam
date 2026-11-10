import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { useModal } from "../../../context/ModalProvider";
import { useToast } from "../../../context/ToastProvider";
import { api, refreshAll } from "../../../utils/api";
/** Enter BVN -> Verifying... -> You're verified. Server decides; errors show inline and as a toast. */
export default function BvnModal() {
  const { closeModal } = useModal(); const toast = useToast();
  const [bvn, setBvn] = useState(""); const [state, setState] = useState("input"); const [err, setErr] = useState("");
  const ok = /^\d{11}$/.test(bvn);
  const submit = async (e) => {
    e.preventDefault(); if (!ok || state === "verifying") return; setState("verifying"); setErr("");
    try { await api("post", "/kyc/bvn", { bvn }); setState("success"); refreshAll(); toast("Identity verified successfully."); }
    catch (x) { setErr(x.message); setState("input"); toast(x.message); }
  };
  if (state === "success") return (
    <div className="rise w-full rounded-2xl bg-popover p-6 text-center"><FiCheckCircle className="mx-auto h-10 w-10 text-up" aria-hidden />
      <h3 className="display mt-3 text-xl">You're verified</h3><p className="mt-1 text-sm text-muted">Your identity is confirmed. Deposits and trading are now unlocked.</p>
      <button onClick={closeModal} className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white">Done</button></div>
  );
  return (
    <form onSubmit={submit} className="w-full rounded-2xl bg-popover p-5">
      <div className="flex items-center justify-between"><h3 className="display text-lg">Enter your BVN</h3><button type="button" aria-label="Close" onClick={closeModal} className="text-xl text-muted">&times;</button></div>
      <p className="mt-1 text-xs text-muted">Enter your 11-digit Bank Verification Number to verify your identity.</p>
      {err && <p role="alert" className="rise mt-3 rounded-lg bg-nobg px-3 py-2 text-xs text-nofg">{err}</p>}
      <label className="mt-4 block rounded-xl border border-line px-3 pb-2 pt-1 focus-within:border-primary"><span className="text-[10px] text-subtle">BVN</span>
        <input autoFocus inputMode="numeric" autoComplete="off" maxLength={11} value={bvn} onChange={(e) => { setBvn(e.target.value.replace(/\D/g, "")); setErr(""); }} className="block w-full bg-transparent text-base tracking-widest outline-none" /></label>
      <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={closeModal} className="rounded-full border border-line px-5 py-2 text-sm">Cancel</button>
        <button type="submit" disabled={!ok || state === "verifying"} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-40">{state === "verifying" ? "Verifying\u2026" : "Verify"}</button></div>
    </form>
  );
}
