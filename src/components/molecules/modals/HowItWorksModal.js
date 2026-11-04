import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useModal } from "../../../context/ModalProvider";
const steps = [
  { t: "Explore Markets", b: "Browse markets on real-world events, from inflation to elections to music. Each market reflects the public's live estimate of what will happen. Buy YES if you think it will. Buy NO if you don't." },
  { t: "Take a position", b: "Decide how much you want to trade and place your order. Once filled, your position appears in your portfolio. As prices change, your position value may rise or fall, and you can sell anytime before the market closes." },
  { t: "Earn if you're right", b: "When the event resolves, the correct outcome settles at the full payout amount. If your prediction is right, the payout is added to your cash balance, allowing you to withdraw or trade again." }];
export default function HowItWorksModal() {
  const [i, setI] = useState(0); const { closeModal } = useModal(); const s = steps[i]; const last = i === steps.length - 1;
  return (
    <div className="relative w-[340px] bg-popover">
      <button aria-label="Close" onClick={closeModal} className="absolute right-3 top-2 z-10 text-muted">&times;</button>
      <div className="h-36 bg-yesbg" aria-hidden /> {/* TODO illustration per step */}
      <div className="p-5"><h3 key={i} className="rise font-semibold">{s.t}</h3><p key={s.t} className="rise mt-2 text-xs leading-relaxed text-muted">{s.b}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1">{steps.map((_, n) => <span key={n} className={`h-1.5 w-1.5 rounded-full ${n === i ? "bg-primary" : "bg-line"}`} />)}</div>
          <div className="flex gap-2">{i > 0 && <button aria-label="Back" onClick={() => setI(i - 1)} className="rounded-full border border-line p-2"><FiArrowLeft /></button>}
            <button onClick={() => (last ? closeModal() : setI(i + 1))} className="rounded-full bg-primary px-4 py-2 text-xs text-white">{last ? "Start trading" : "Continue"}</button></div></div></div>
    </div>
  );
}
