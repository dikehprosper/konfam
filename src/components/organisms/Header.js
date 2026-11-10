import { useState } from "react";
import { useSelector } from "react-redux";
import { FiSearch, FiEye, FiEyeOff, FiPlus, FiSun, FiMoon, FiInfo } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import useApiData from "../../hooks/useApiData";
import AccountMenu from "./AccountMenu";
import LoginModal from "../molecules/modals/LoginModal";
import HowItWorksModal from "../molecules/modals/HowItWorksModal";
import { useModal } from "../../context/ModalProvider";
import NotificationBell from "./NotificationBell";
import DepositModal from "../molecules/modals/DepositModal";
import { compactNaira, nairaFromKobo } from "../../utils/format";

export default function Header() {
  const token = localStorage.getItem("Tkn");
  const user = useSelector((s) => s.client.userData);
  const { theme, setThemeMode } = useTheme();
  const [hidden, setHidden] = useState(localStorage.getItem("hideBal") === "1");
  const { openModal } = useModal(); const [menu, setMenu] = useState(false); const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const profile = useApiData("/account/profile", null, { skip: !token, refreshOn: "profile:refresh" });
  const w = useApiData("/wallet", null, { pollMs: 15000, skip: !token, refreshOn: "wallet:refresh" });
  const sm = useApiData("/summary", null, { pollMs: 15000, skip: !token, refreshOn: "wallet:refresh" });
  const val = (k) => (hidden ? "\u2022\u2022\u2022\u2022" : k == null ? "\u2014" : nairaFromKobo(k));
  const compactVal = (k) => (hidden ? "\u2022\u2022\u2022\u2022" : k == null ? "\u2014" : compactNaira(k));
  const toggleEye = () => { localStorage.setItem("hideBal", hidden ? "0" : "1"); setHidden(!hidden); };
  return (
    <header className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-x-1 gap-y-3 px-2.5 py-3 sm:flex-nowrap sm:gap-4 sm:px-4 sm:py-4">
      <a href="/" aria-label="Konfam home" className="display flex shrink-0 items-center gap-1 text-xl text-primary sm:gap-2 sm:text-3xl">
        <img src="/konfam-mark.svg" alt="" className="h-7 w-7 sm:h-9 sm:w-9" />
        <span>konfam</span>
      </a>
      <label className="order-last flex basis-full min-w-0 items-center gap-2 rounded-full bg-hairline px-4 py-2 text-sm text-muted sm:order-none sm:basis-auto sm:flex-1">
        <FiSearch /><input className="w-full bg-transparent outline-none" placeholder="Search markets" aria-label="Search markets" />
      </label>
      {!token ? (
        <>
          <div className="order-2 ml-auto flex items-center gap-1 sm:order-none sm:ml-0 sm:contents">
            <button onClick={() => openModal(<HowItWorksModal />, "max-w-[340px]")} className="hidden items-center gap-1 text-sm text-muted sm:flex"><FiInfo />How it works?</button>
            <button onClick={() => openModal(<LoginModal mode="login" />, "max-w-[640px]")} className="whitespace-nowrap rounded-full border border-line px-2 py-1.5 text-xs font-medium sm:px-4 sm:text-sm">Log in</button>
            <button onClick={() => openModal(<LoginModal mode="signup" />, "max-w-[640px]")} className="whitespace-nowrap rounded-full bg-primary px-2 py-1.5 text-xs font-medium text-white sm:px-4 sm:text-sm">Sign up</button>
            <div className="flex shrink-0 rounded-full bg-hairline p-1">
              <button aria-label="Light" onClick={() => setThemeMode("light")} className={`rounded-full p-1 sm:p-1.5 ${theme !== "dark" ? "bg-card" : ""}`}><FiSun /></button>
              <button aria-label="Dark" onClick={() => setThemeMode("dark")} className={`rounded-full p-1 sm:p-1.5 ${theme === "dark" ? "bg-card" : ""}`}><FiMoon /></button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1 text-[9px] leading-tight sm:flex-none sm:justify-start sm:gap-3 sm:text-[11px]">
            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
              <div><div className="text-muted">Portfolio</div><b className="whitespace-nowrap sm:hidden">{compactVal(sm.data?.portfolioValueKobo)}</b><b className="hidden whitespace-nowrap sm:block">{val(sm.data?.portfolioValueKobo)}</b></div>
              <div><div className="text-muted">Cash</div><b className="whitespace-nowrap sm:hidden">{compactVal(w.data?.cashKobo)}</b><b className="hidden whitespace-nowrap sm:block">{val(w.data?.cashKobo)}</b></div>
            </div>
            <div className="flex shrink-0 items-center gap-0 sm:gap-1">
              <button aria-label="Toggle balances" onClick={toggleEye} className="grid h-8 w-7 place-items-center rounded-full text-muted sm:w-8">{hidden ? <FiEyeOff /> : <FiEye />}</button>
              <button onClick={() => openModal(<DepositModal />, "max-w-[440px]")} className="flex h-8 shrink-0 items-center justify-center gap-0.5 rounded-full bg-primary px-2.5 text-[10px] font-medium text-white sm:gap-1 sm:px-3 sm:text-sm"><span>Deposit</span><FiPlus /></button>
              <NotificationBell />
              <div className="relative ml-1 shrink-0 sm:ml-1 md:ml-2"><button aria-label="Account" aria-expanded={menu} onClick={() => setMenu(!menu)} className="grid h-8 w-8 place-items-center rounded-full bg-teal-600 text-sm font-semibold text-white">{(profile.data?.firstName || profile.data?.name || profile.data?.email || profile.data?.phone || user?.firstName || "M")[0].toUpperCase()}</button>{menu && <AccountMenu portfolio={val(sm.data?.portfolioValueKobo)} cash={val(w.data?.cashKobo)} verified={profile.data?.kycStatus === "verified"} onClose={() => setMenu(false)} />}</div>
            </div>
          </div>
        </>
      )}
      {!token && (
        <div
          className={`fixed inset-0 z-[9998] flex items-end bg-black/40 transition-opacity duration-300 sm:hidden ${howItWorksOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden={!howItWorksOpen}
          onClick={() => setHowItWorksOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="How it works"
            className={`w-full overflow-hidden rounded-t-3xl border-t border-x border-line bg-popover pb-[env(safe-area-inset-bottom)] shadow-2xl transition-transform duration-300 ${howItWorksOpen ? "translate-y-0" : "translate-y-full"}`}
            onClick={(event) => event.stopPropagation()}
          >
            <HowItWorksModal onClose={() => setHowItWorksOpen(false)} />
          </div>
        </div>
      )}
      {!token && (
        <button
          onClick={() => setHowItWorksOpen(true)}
          className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2 border-t border-line bg-card px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] text-sm font-medium text-primary shadow-lg sm:hidden"
        >
          <FiInfo /> How it works?
        </button>
      )}
    </header>
  );
}
