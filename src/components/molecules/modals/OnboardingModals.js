import { useEffect } from "react";
import { useModal } from "../../../context/ModalProvider";
import { api } from "../../../utils/api";
import BvnModal from "./BvnModal";
import HowItWorksModal from "./HowItWorksModal";
const done = () => api("post", "/account/onboarding/complete").catch(() => {});

export function WelcomeCard() {
  const { openModal, closeModal } = useModal();
  return (
    <div className="rise w-full overflow-hidden rounded-2xl bg-canvas p-6" style={{ backgroundImage: "radial-gradient(120% 90% at 20% 0%, rgba(180,140,255,.35), transparent 60%)" }}>
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-bold text-white">K</div>
      <h2 className="display mt-6 text-3xl">Welcome to Konfam</h2><p className="mt-2 text-sm text-muted">Your account is ready. Take a quick look at how markets work, or jump straight in.</p>
      <div className="mt-6 flex justify-end gap-2"><button onClick={() => { done(); closeModal(); }} className="rounded-full border border-line px-5 py-2 text-sm">Skip</button>
        <button onClick={() => { done(); openModal(<HowItWorksModal />, "max-w-[340px]"); }} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">See how it works</button></div>
    </div>
  );
}
export function VerifyIdentityCard() {
  const { openModal } = useModal();
  return (
    <div className="rise w-full rounded-2xl p-6 text-white" style={{ background: "linear-gradient(160deg,#2a0050,#5a1a9a)" }}>
      <div className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-xl">&#128100;</div>
      <h2 className="display mt-5 text-2xl">Verify your identity</h2><p className="mt-2 text-sm text-white/80">Your account has been created. Verify with your BVN to unlock deposits and trading. It only takes a minute.</p>
      <div className="mt-6 flex flex-wrap gap-2"><button onClick={() => openModal(<BvnModal />, "max-w-[400px]")} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary">Start verification</button>
        <button onClick={() => openModal(<WelcomeCard />, "max-w-[420px]")} className="rounded-full border border-white/40 px-5 py-2 text-sm">I'll do it later</button></div>
    </div>
  );
}
/** Opens the onboarding cards once, right after a brand-new sign-up. */
export function OnboardingGate() {
  const { openModal } = useModal();
  useEffect(() => { if (localStorage.getItem("Tkn") && sessionStorage.getItem("konfam:onboard")) { sessionStorage.removeItem("konfam:onboard"); openModal(<VerifyIdentityCard />, "max-w-[420px]"); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
