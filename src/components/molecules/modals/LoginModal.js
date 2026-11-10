import { useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff, FiArrowLeft, FiCheck, FiCircle } from "react-icons/fi";
import useGoogleAuth from "../../../pages/auth/GoogleAuth";
import { useModal } from "../../../context/ModalProvider";
import { useToast } from "../../../context/ToastProvider";
import { api } from "../../../utils/api";

export const RULES = [[/.{8,}/, "8 characters minimum"], [/[a-z]/, "One lowercase letter"], [/[A-Z]/, "One uppercase letter"], [/\d/, "One number"], [/[^A-Za-z0-9]/, "One special character"]];
export const passwordOk = (pw) => RULES.every(([r]) => r.test(pw));
export const Checklist = ({ pw, confirm }) => (
  <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
    {[...RULES.map(([r, t]) => [r.test(pw), t]), ...(confirm !== undefined ? [[!!pw && pw === confirm, "Passwords match"]] : [])].map(([ok, t]) => (
      <li key={t} className={`flex items-center gap-1.5 transition-colors ${ok ? "text-up" : "text-subtle"}`}>{ok ? <FiCheck aria-hidden /> : <FiCircle aria-hidden />}{t}</li>))}
  </ul>
);
export function CodeBoxes({ value, onChange, onComplete, disabled }) {
  const refs = useRef([]); const digits = value.padEnd(6, " ").split("").slice(0, 6);
  const set = (i, ch) => { const d = value.padEnd(6, " ").split(""); d[i] = ch || " "; const v = d.join("").replace(/ +$/, ""); onChange(v.replace(/ /g, "")); if (ch && i < 5) refs.current[i + 1]?.focus(); if (v.replace(/ /g, "").length === 6) onComplete?.(v.replace(/ /g, "")); };
  const paste = (e) => { const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6); if (!t) return; e.preventDefault(); onChange(t); refs.current[Math.min(t.length, 5)]?.focus(); if (t.length === 6) onComplete?.(t); };
  return (
    <div className="flex gap-2" onPaste={paste}>
      {digits.map((d, i) => <input key={i} ref={(el) => (refs.current[i] = el)} disabled={disabled} inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={1} aria-label={`Digit ${i + 1}`} value={d.trim()}
        onChange={(e) => set(i, e.target.value.replace(/\D/g, "").slice(-1))} onKeyDown={(e) => { if (e.key === "Backspace" && !digits[i].trim() && i > 0) refs.current[i - 1]?.focus(); }}
        className="h-11 w-full min-w-0 rounded-lg border border-line bg-card text-center text-lg font-semibold outline-none transition-shadow focus:border-primary focus:shadow-[0_0_0_3px_var(--hairline-strong)]" />)}
    </div>
  );
}
const Field = ({ label, ...p }) => <label className="block"><span className="sr-only">{label}</span><input aria-label={label} placeholder={label} {...p} className="w-full border-b border-line bg-transparent py-2 text-sm outline-none transition-colors focus:border-primary" /></label>;
const Err = ({ children }) => (children ? <p role="alert" className="rise rounded-lg bg-nobg px-3 py-2 text-xs text-nofg">{children}</p> : null);

/** One modal, many steps. mode: "login" | "signup". All rules are enforced again by the server. */
export default function LoginModal({ mode = "login" }) {
  const { closeModal } = useModal(); const toast = useToast();
  const [step, setStep] = useState(mode === "signup" ? "signupChoose" : "login"); const [loginStage, setLoginStage] = useState("identify");
  const [identifier, setIdentifier] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState(""); const [show, setShow] = useState(false);
  const [code, setCode] = useState(""); const [newPw, setNewPw] = useState(""); const [confirm, setConfirm] = useState(""); const [vt, setVt] = useState("");
  const [purpose, setPurpose] = useState("signup"); const [demoCode, setDemoCode] = useState(""); const [wait, setWait] = useState(0); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const { googleLogin } = useGoogleAuth(() => window.location.reload(), (m) => setErr(m));
  useEffect(() => { if (wait <= 0) return undefined; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t); }, [wait]);

  const go = (s) => { setErr(""); setStep(s); };
  const run = async (fn) => { setBusy(true); setErr(""); try { await fn(); } catch (e) { setErr(e.message); if (e.data?.retryAfterSeconds) setWait(e.data.retryAfterSeconds); } finally { setBusy(false); } };
  const sendCode = (p, next) => run(async () => { const d = await api("post", "/auth/otp/send", { identifier, purpose: p }); setPurpose(p); setDemoCode(d.demoCode || ""); setCode(""); setWait(30); setStep(next); });
  const verifyCode = (c) => run(async () => {
    const d = await api("post", "/auth/otp/verify", { identifier, purpose, code: c });
    if (purpose === "reset") { setVt(d.verificationToken); setStep("newPassword"); return; }
    const s = await api("post", "/auth/signup", { identifier, password, name: name.trim() || undefined, verificationToken: d.verificationToken });
    localStorage.setItem("Tkn", s.accessToken); sessionStorage.setItem("konfam:onboard", "1"); window.location.reload();
  });
  const identify = () => run(async () => { await api("post", "/auth/identify", { identifier }); setLoginStage("password"); });
  const signin = () => run(async () => { const d = await api("post", "/auth/signin", { identifier, password }); localStorage.setItem("Tkn", d.accessToken); window.location.reload(); });
  const reset = () => run(async () => { await api("post", "/auth/password/reset", { identifier, verificationToken: vt, newPassword: newPw }); toast("Password updated. You can log in now."); setPassword(""); setLoginStage("password"); setStep("login"); });

  const heads = { login: ["Welcome back!", "Login to your account"], forgot: ["Don't worry!", "Resetting password is very easy"], forgotCode: ["Check your messages", "Enter the 6-digit code we sent"], newPassword: ["Almost there", "Choose a strong new password"],
    signupChoose: ["Welcome to Konfam!", "Great time to create your account"], signupDetails: ["Your details", "Tell us a little about you"], signupCode: ["Verify it's you", "Enter the 6-digit code we sent"] };
  const [h1, h2] = heads[step]; const signup = step.startsWith("signup");
  const stage = step === "signupChoose" || step === "signupDetails" ? 0 : 1;
  const google = (label) => <button onClick={() => googleLogin()} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-xs transition-colors hover:border-primary"><FcGoogle />{label} with Google</button>;
  const primary = "rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50";
  const back = (to) => <button type="button" aria-label="Back" onClick={() => go(to)} className="mr-2 rounded-full border border-line p-2"><FiArrowLeft /></button>;
  const identOk = identifier.trim().length > 4;

  return (
    <div className="relative grid w-full max-w-[640px] items-stretch gap-y-6 bg-canvas px-5 py-10 sm:grid-cols-2 sm:items-end sm:gap-x-10 sm:px-8 sm:py-[47px]">
      <button aria-label="Close" onClick={closeModal} className="absolute right-4 top-3 text-xl text-muted">&times;</button>
      <div key={step} className="rise flex flex-col justify-center sm:justify-end"><h2 className="display text-3xl font-semibold">{h1}</h2><p className="display text-2xl text-muted">{h2}</p></div>
      <div key={`${step}-${loginStage}`} className="rise flex h-full flex-col justify-center space-y-3 sm:justify-end">
        {step === "login" && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (busy) return; loginStage === "identify" ? identOk && identify() : password && signin(); }}>
            {loginStage === "identify" && <>{google("Log in")}<div className="text-center text-xs text-subtle">or</div></>}
            <Field label="Email or phone number" autoComplete="username" value={identifier} onChange={(e) => { setIdentifier(e.target.value); setErr(""); }} disabled={loginStage === "password"} />
            {loginStage === "password" && <>
              <div className="relative"><Field label="Password" type={show ? "text" : "password"} autoComplete="current-password" autoFocus value={password} onChange={(e) => { setPassword(e.target.value); setErr(""); }} />
                <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} className="absolute right-0 top-2 text-muted">{show ? <FiEyeOff /> : <FiEye />}</button></div>
              <button type="button" onClick={() => go("forgot")} className="text-xs font-semibold text-primary">Forgot your password?</button></>}
            <Err>{err}</Err>
            <div className="flex items-center justify-between">
              <button type="submit" disabled={busy || (loginStage === "identify" ? !identOk : !password)} className={primary}>{busy ? "Please wait\u2026" : loginStage === "identify" ? "Continue" : "Log in"}</button>
              <span className="text-xs text-muted">New to Konfam? <button type="button" onClick={() => { setErr(""); setStep("signupChoose"); }} className="font-semibold text-primary">Sign up</button></span>
            </div>
          </form>)}
        {step === "forgot" && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); identOk && !busy && sendCode("reset", "forgotCode"); }}>
            <p className="text-xs text-muted">Enter your email or phone number. We'll send a verification code to reset your password.</p>
            <Field label="Email or phone number" autoComplete="username" value={identifier} onChange={(e) => { setIdentifier(e.target.value); setErr(""); }} /><Err>{err}</Err>
            <div className="flex items-center">{back("login")}<button type="submit" disabled={busy || !identOk} className={primary}>{busy ? "Sending\u2026" : "Send code"}</button></div>
            <p className="text-[10px] text-subtle">Use the email or number linked to your account.</p>
          </form>)}
        {(step === "forgotCode" || step === "signupCode") && (
          <div className="space-y-3">
            <p className="text-xs text-muted">Code sent to <b>{identifier}</b></p>
            {demoCode && <p className="rounded-lg bg-yesbg px-3 py-2 text-xs text-primary">Demo mode: your code is <b className="tracking-widest">{demoCode}</b></p>}
            <CodeBoxes value={code} onChange={(v) => { setCode(v); setErr(""); }} onComplete={verifyCode} disabled={busy} /><Err>{err}</Err>
            <div className="flex items-center">{back(step === "forgotCode" ? "forgot" : "signupDetails")}<button disabled={busy || code.length < 6} onClick={() => verifyCode(code)} className={primary}>{busy ? "Verifying\u2026" : "Verify"}</button></div>
            <button disabled={wait > 0 || busy} onClick={() => sendCode(purpose, step)} className="text-xs font-semibold text-primary disabled:text-subtle">{wait > 0 ? `Resend code in ${wait}s` : "Resend code"}</button>
          </div>)}
        {step === "newPassword" && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (passwordOk(newPw) && newPw === confirm && !busy) reset(); }}>
            <Field label="New password" type={show ? "text" : "password"} autoComplete="new-password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
            <Field label="Confirm password" type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <Checklist pw={newPw} confirm={confirm} /><Err>{err}</Err>
            <button type="submit" disabled={busy || !passwordOk(newPw) || newPw !== confirm} className={`${primary} w-full`}>{busy ? "Saving\u2026" : "Reset password"}</button>
          </form>)}
        {step === "signupChoose" && <>
          {google("Sign up")}
          <button onClick={() => { setIdentifier(""); go("signupDetails"); }} className="min-h-11 w-full rounded-full border border-line bg-card px-3 py-2 text-xs transition-colors hover:border-primary">Sign up with Email</button>
          <button onClick={() => { setIdentifier(""); go("signupDetails"); }} className="min-h-11 w-full rounded-full border border-line bg-card px-3 py-2 text-xs transition-colors hover:border-primary">Sign up with Phone</button>
          <Err>{err}</Err>
          <p className="text-center text-xs text-muted">Already a member? <button onClick={() => { setErr(""); setStep("login"); setLoginStage("identify"); }} className="font-semibold text-primary">Sign in</button></p></>}
        {step === "signupDetails" && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (identOk && passwordOk(password) && !busy) sendCode("signup", "signupCode"); }}>
            <Field label="Full name (optional)" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            <Field label="Email or phone number" autoComplete="username" value={identifier} onChange={(e) => { setIdentifier(e.target.value); setErr(""); }} />
            <div className="relative"><Field label="Create a password" type={show ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} className="absolute right-0 top-2 text-muted">{show ? <FiEyeOff /> : <FiEye />}</button></div>
            <Checklist pw={password} /><Err>{err}</Err>
            <div className="flex items-center">{back("signupChoose")}<button type="submit" disabled={busy || !identOk || !passwordOk(password)} className={primary}>{busy ? "Sending\u2026" : "Continue"}</button></div>
          </form>)}
        {(step === "login" || signup) && <p className="text-[10px] text-subtle">By signing in, you acknowledge and agree to our Terms of Service and Privacy Policy.</p>}
        {signup && <ol className="flex items-start justify-between pt-1 text-[10px] text-subtle" aria-label="Sign-up progress">{["Account details", "Verification", "Identity verification"].map((t, i) => <li key={t} className={`flex-1 text-center ${i <= stage ? "font-semibold text-primary" : ""}`}><span className={`mx-auto mb-1 block h-1.5 w-1.5 rounded-full ${i <= stage ? "bg-primary" : "bg-line"}`} />{t}</li>)}</ol>}
      </div>
    </div>
  );
}
