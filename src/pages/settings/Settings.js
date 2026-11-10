import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiUser, FiShield, FiBell, FiChevronRight } from "react-icons/fi";
import Header from "../../components/organisms/Header";
import BvnModal from "../../components/molecules/modals/BvnModal";
import { Checklist, CodeBoxes, passwordOk } from "../../components/molecules/modals/LoginModal";
import { useModal } from "../../context/ModalProvider";
import { useToast } from "../../context/ToastProvider";
import useApiData from "../../hooks/useApiData";
import { api, refreshAll } from "../../utils/api";

const SECTIONS = [["personal", "Personal details", FiUser], ["security", "Security", FiShield], ["notifications", "Notification", FiBell]];
const btn = "rounded-full border border-line px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:text-primary";
const Shell = ({ children, title }) => <div className="rise w-full max-w-md rounded-2xl bg-popover p-5"><h3 className="display text-lg">{title}</h3>{children}</div>;
const Inp = (p) => <input {...p} className="mt-3 w-full rounded-xl border border-line bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary" />;

function Row({ label, value, action }) {
  return <div className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><div className="text-xs text-muted">{label}</div><div className="truncate text-sm font-medium">{value || <span className="text-subtle">Not provided</span>}</div></div>{action}</div>;
}
function EditField({ label, field, initial, type = "text", onDone }) {
  const { closeModal } = useModal(); const toast = useToast(); const [v, setV] = useState(initial || ""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const save = async (e) => { e.preventDefault(); setBusy(true); setErr(""); try { await api("patch", "/account/profile", { [field]: v }); refreshAll(); toast("Saved"); closeModal(); onDone?.(); } catch (x) { setErr(x.message); } finally { setBusy(false); } };
  return <Shell title={`Edit ${label.toLowerCase()}`}><form onSubmit={save}><Inp autoFocus aria-label={label} type={type} value={v} onChange={(e) => { setV(e.target.value); setErr(""); }} />{err && <p role="alert" className="mt-2 text-xs text-red-600">{err}</p>}
    <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={closeModal} className={btn}>Cancel</button><button disabled={busy || !v.trim()} className="rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-white disabled:opacity-40">{busy ? "Saving\u2026" : "Save"}</button></div></form></Shell>;
}
function AddPhone() {
  const { closeModal } = useModal(); const toast = useToast(); const [phone, setPhone] = useState(""); const [stage, setStage] = useState("phone"); const [code, setCode] = useState(""); const [demo, setDemo] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const run = async (fn) => { setBusy(true); setErr(""); try { await fn(); } catch (x) { setErr(x.message); } finally { setBusy(false); } };
  const send = () => run(async () => { const d = await api("post", "/auth/otp/send", { identifier: phone, purpose: "phone" }); setDemo(d.demoCode || ""); setStage("code"); });
  const verify = (c) => run(async () => { const v = await api("post", "/auth/otp/verify", { identifier: phone, purpose: "phone", code: c }); const norm = phone.replace(/\D/g, "").replace(/^(234|0)/, ""); await api("post", "/account/phone", { phone: `+234${norm}`, verificationToken: v.verificationToken }); refreshAll(); toast("Phone number added"); closeModal(); });
  return <Shell title="Add phone number">{stage === "phone" ? <><Inp autoFocus aria-label="Phone number" placeholder="0803 000 0000" inputMode="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setErr(""); }} />
    {err && <p role="alert" className="mt-2 text-xs text-red-600">{err}</p>}<div className="mt-5 flex justify-end gap-2"><button onClick={closeModal} className={btn}>Cancel</button><button disabled={busy || phone.length < 10} onClick={send} className="rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-white disabled:opacity-40">{busy ? "Sending\u2026" : "Send code"}</button></div></>
    : <div className="mt-3 space-y-3">{demo && <p className="rounded-lg bg-yesbg px-3 py-2 text-xs text-primary">Demo mode: your code is <b>{demo}</b></p>}<CodeBoxes value={code} onChange={setCode} onComplete={verify} disabled={busy} />{err && <p role="alert" className="text-xs text-red-600">{err}</p>}</div>}</Shell>;
}
function ChangePassword() {
  const { closeModal } = useModal(); const toast = useToast(); const [o, setO] = useState(""); const [n, setN] = useState(""); const [c, setC] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const ok = o && passwordOk(n) && n === c;
  const save = async (e) => { e.preventDefault(); setBusy(true); try { await api("post", "/account/password/change", { oldPassword: o, newPassword: n }); toast("Password changed"); closeModal(); } catch (x) { setErr(x.message); } finally { setBusy(false); } };
  return <Shell title="Change your password"><form onSubmit={save}><p className="mt-1 text-xs text-muted">You'll stay signed in here.</p>
    <Inp aria-label="Old password" placeholder="Old password" type="password" autoComplete="current-password" value={o} onChange={(e) => { setO(e.target.value); setErr(""); }} /><Inp aria-label="New password" placeholder="New password" type="password" autoComplete="new-password" value={n} onChange={(e) => setN(e.target.value)} />
    <Inp aria-label="Confirm password" placeholder="Confirm password" type="password" autoComplete="new-password" value={c} onChange={(e) => setC(e.target.value)} /><Checklist pw={n} confirm={c} />{err && <p role="alert" className="mt-2 text-xs text-red-600">{err}</p>}
    <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={closeModal} className={btn}>Cancel</button><button disabled={!ok || busy} className="rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-white disabled:opacity-40">{busy ? "Saving\u2026" : "Change password"}</button></div></form></Shell>;
}
function PinModal({ hasPin }) {
  const { closeModal } = useModal(); const toast = useToast(); const [cur, setCur] = useState(""); const [p, setP] = useState(""); const [c, setC] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const ok = /^\d{4}$/.test(p) && p === c && (!hasPin || /^\d{4}$/.test(cur));
  const save = async (e) => { e.preventDefault(); setBusy(true); try { await api("post", "/account/pin", { pin: p, confirmPin: c, currentPin: hasPin ? cur : undefined }); refreshAll(); toast(hasPin ? "PIN changed" : "PIN created"); closeModal(); } catch (x) { setErr(x.message); } finally { setBusy(false); } };
  const d = (set) => (e) => { set(e.target.value.replace(/\D/g, "").slice(0, 4)); setErr(""); };
  return <Shell title={hasPin ? "Change PIN" : "Create PIN"}><form onSubmit={save}><p className="mt-1 text-xs text-muted">Enter a 4-digit PIN.</p>
    {hasPin && <Inp aria-label="Current PIN" placeholder="Current PIN" type="password" inputMode="numeric" value={cur} onChange={d(setCur)} />}<Inp aria-label="PIN" placeholder="PIN" type="password" inputMode="numeric" value={p} onChange={d(setP)} /><Inp aria-label="Confirm PIN" placeholder="Confirm PIN" type="password" inputMode="numeric" value={c} onChange={d(setC)} />
    {err && <p role="alert" className="mt-2 text-xs text-red-600">{err}</p>}<div className="mt-5 flex justify-end gap-2"><button type="button" onClick={closeModal} className={btn}>Cancel</button><button disabled={!ok || busy} className="rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-white disabled:opacity-40">{busy ? "Saving\u2026" : hasPin ? "Change PIN" : "Create PIN"}</button></div></form></Shell>;
}
const VerifyCard = ({ onStart }) => <div className="rise mt-6 rounded-2xl border border-line bg-card p-4"><b className="text-sm">Verify your identity</b><p className="mt-1 text-xs text-muted">Verify your account to unlock all features, begin trading and start earning money. The verification process is free and only takes about 5 minutes.</p><button onClick={onStart} className={`${btn} mt-3`}>Start verification</button></div>;

function Notifications({ prefs }) {
  const toast = useToast(); const [p, setP] = useState(prefs);
  const L = { orderFills: "Order fills matching", resolutions: "Resolutions", tips: "Trading tips and suggestions", laws: "Local laws and regulations", accountUpdates: "Account updates" };
  const flip = async (g, k) => { const prev = p; const v = !p[g][k]; setP({ ...p, [g]: { ...p[g], [k]: v } }); try { await api("put", "/account/notification-preferences", { group: g, key: k, value: v }); } catch (e) { setP(prev); toast(e.message); } };
  return [["email", "EMAIL NOTIFICATIONS"], ["push", "PUSH NOTIFICATIONS"]].map(([g, t]) => <section key={g} className="mb-6"><h3 className="text-[11px] font-semibold tracking-widest text-muted">{t}</h3>
    {Object.keys(L).map((k) => <div key={k} className="flex items-center justify-between py-3"><span className="text-sm">{L[k]}</span>
      <button role="switch" aria-checked={p[g][k]} aria-label={`${t} ${L[k]}`} onClick={() => flip(g, k)} className={`relative h-6 w-11 rounded-full transition-colors ${p[g][k] ? "bg-primary" : "bg-line"}`}><span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${p[g][k] ? "translate-x-5" : ""}`} /></button></div>)}</section>);
}

export default function Settings() {
  const [sp, setSp] = useSearchParams(); const sec = SECTIONS.some(([k]) => k === sp.get("section")) ? sp.get("section") : "personal"; const { openModal } = useModal(); const toast = useToast();
  const pf = useApiData("/account/profile", null, { refreshOn: "profile:refresh" }); const p = pf.data; const verified = p?.kycStatus === "verified";
  const bvn = () => openModal(<BvnModal />, "max-w-[400px]"); const edit = (label, field, initial, type) => openModal(<EditField label={label} field={field} initial={initial} type={type} />, "max-w-[420px]");
  const Btn = ({ children, ...r }) => <button className={btn} {...r}>{children}</button>;
  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-[1000px] gap-6 px-4 pb-24 pt-4 md:grid-cols-[220px_1fr]">
        <aside><h1 className="display mb-3 text-2xl">Profile and Settings</h1>
          <nav className="flex gap-2 overflow-x-auto md:flex-col" aria-label="Settings sections">{SECTIONS.map(([k, l, I]) => <button key={k} onClick={() => setSp({ section: k })} aria-current={sec === k ? "page" : undefined} className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors ${sec === k ? "bg-yesbg font-semibold text-primary" : "text-muted hover:bg-hairline"}`}><I />{l}</button>)}</nav></aside>
        <section key={sec} className="rise min-w-0">
          {pf.isLoading && !p ? <div className="space-y-4">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skel h-12" />)}</div> : pf.error && !p ? <p className="py-16 text-center text-sm text-muted">Couldn't load your profile. <button onClick={pf.refetch} className="font-semibold text-primary">Retry</button></p> : <>
            {sec === "personal" && <><h2 className="display text-2xl">Personal details</h2>
              <div className="my-5 grid h-24 w-24 place-items-center rounded-full bg-teal-600 text-4xl font-semibold text-white">{(p.firstName || p.name || p.email || p.phone || "U")[0].toUpperCase()}</div>
              <div className="divide-y divide-line">
                <Row label="First name" value={p.firstName} action={<Btn onClick={() => edit("First name", "firstName", p.firstName)}>Edit</Btn>} />
                <Row label="Last name" value={p.lastName} action={<Btn onClick={() => edit("Last name", "lastName", p.lastName)}>Edit</Btn>} />
                <Row label="Email" value={p.email} /><Row label="Date of birth" value={p.dateOfBirth} action={!verified && <Btn onClick={() => edit("Date of birth", "dateOfBirth", p.dateOfBirth, "date")}>{p.dateOfBirth ? "Edit" : "Add"}</Btn>} />
                <Row label="Phone number" value={p.phone} action={<Btn onClick={() => openModal(<AddPhone />, "max-w-[420px]")}>{p.phone ? "Change" : "Add"}</Btn>} />
                <Row label="Username" value={p.username} action={<Btn onClick={() => edit("Username", "username", p.username)}>{p.username ? "Edit" : "Add"}</Btn>} />
                <button onClick={() => toast("Additional details are coming soon")} className="flex w-full items-center justify-between py-3 text-left"><span><span className="block text-sm font-medium">Additional details</span><span className="text-xs text-muted">View financial and trading details</span></span><FiChevronRight className="text-muted" /></button>
              </div>{!verified && <VerifyCard onStart={bvn} />}</>}
            {sec === "security" && <><h2 className="display text-2xl">Security</h2>
              <h3 className="mt-5 text-[11px] font-semibold tracking-widest text-muted">VERIFIED DETAILS</h3><Row label="Bank verification number (BVN)" value={p.bvnMasked} action={!verified && <Btn onClick={bvn}>Verify</Btn>} />
              <h3 className="mt-4 text-[11px] font-semibold tracking-widest text-muted">AUTHENTICATION</h3>
              <Row label="Change password" value={p.hasPassword ? "Use a strong password you don't use elsewhere" : "Sign in with Google. Set a password by resetting it."} action={p.hasPassword && <Btn onClick={() => openModal(<ChangePassword />, "max-w-[420px]")}>Change</Btn>} />
              <Row label="Transaction PIN" value={p.hasPin ? "PIN created" : "Not created"} action={<Btn onClick={() => openModal(<PinModal hasPin={p.hasPin} />, "max-w-[400px]")}>{p.hasPin ? "Change" : "Create"}</Btn>} />
              <h3 className="mt-4 text-[11px] font-semibold tracking-widest text-muted">ACCOUNT TERMINATION</h3>
              <Row label="Deactivate your account" value="Restrict your access to all activities on your account" action={<button onClick={() => toast("Account deactivation isn't available yet")} className="rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-600">Deactivate</button>} />
              <Row label="Close your account" value="Permanently removes your account. Unlike deactivating, this can't be undone." action={<button aria-label="Close your account" onClick={() => toast("Account closure isn't available yet")}><FiChevronRight className="text-muted" /></button>} /></>}
            {sec === "notifications" && <><h2 className="display mb-4 text-2xl">Notifications</h2><Notifications prefs={p.notificationPrefs} /></>}
          </>}
        </section>
      </main>
    </>
  );
}
