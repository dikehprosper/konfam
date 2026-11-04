import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import useGoogleAuth from "../../../pages/auth/GoogleAuth";
import { useModal } from "../../../context/ModalProvider";
import { useToast } from "../../../context/ToastProvider";
/** "Welcome back!" modal: Google, Apple, email/phone + Continue. mode: "login" | "signup". */
export default function LoginModal({ mode = "login" }) {
  const [m, setM] = useState(mode); const [id, setId] = useState(""); const { closeModal } = useModal(); const toast = useToast();
  const { googleLogin } = useGoogleAuth(() => window.location.reload(), toast);
  const login = m === "login";
  return (
    <div className="relative grid w-full max-w-[640px] gap-6 bg-canvas p-8 sm:grid-cols-2">
      <button aria-label="Close" onClick={closeModal} className="absolute right-4 top-3 text-muted">&times;</button>
      <div className="self-end"><h2 className="display text-3xl font-semibold">{login ? "Welcome back!" : "Create your account"}</h2><p className="display text-2xl text-muted">{login ? "Log in to your account" : "Start trading on Sabi"}</p></div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => googleLogin()} className="flex items-center justify-center gap-2 rounded-full border border-line bg-card py-2 text-xs"><FcGoogle />{login ? "Log in" : "Sign up"} with Google</button>
          <button onClick={() => toast("Apple sign-in coming soon")} className="flex items-center justify-center gap-2 rounded-full border border-line bg-card py-2 text-xs"><FaApple />{login ? "Log in" : "Sign up"} with Apple</button>
        </div>
        <div className="text-center text-xs text-subtle">or</div>
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Email or phone number" aria-label="Email or phone number" className="w-full border-b border-line bg-transparent py-2 text-sm outline-none" />
        <div className="flex items-center justify-between">
          <button disabled={!id.trim()} onClick={() => toast("Check your inbox/phone for a code")} className="rounded-full bg-primary px-5 py-2 text-sm text-white disabled:opacity-50">Continue</button>
          <span className="text-xs text-muted">{login ? "New to Sabi?" : "Have an account?"} <button onClick={() => setM(login ? "signup" : "login")} className="font-semibold text-primary">{login ? "Sign up" : "Log in"}</button></span>
        </div>
        <p className="text-[10px] text-subtle">By signing in, you acknowledge and agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
}
