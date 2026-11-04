import { useState } from "react";
import { useSelector } from "react-redux";
import { FiSearch, FiEye, FiEyeOff, FiBell, FiPlus, FiSun, FiMoon, FiInfo } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import useApiData from "../../hooks/useApiData";
import AccountMenu from "./AccountMenu";
import LoginModal from "../molecules/modals/LoginModal";
import HowItWorksModal from "../molecules/modals/HowItWorksModal";
import { useModal } from "../../context/ModalProvider";
import { wallet as walletMock, summary as summaryMock } from "../../mocks/markets";
const naira = (n) => `\u20a6${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Header() {
  const token = localStorage.getItem("Tkn");
  const user = useSelector((s) => s.client.userData);
  const { theme, setThemeMode } = useTheme();
  const [hidden, setHidden] = useState(localStorage.getItem("hideBal") === "1");
  const { openModal } = useModal(); const [menu, setMenu] = useState(false);
  const w = useApiData("/wallet", walletMock, { pollMs: 15000, skip: !token });
  const sm = useApiData("/summary", summaryMock, { pollMs: 15000, skip: !token });
  const val = (n) => (hidden ? "\u2022\u2022\u2022\u2022" : naira(n));
  const toggleEye = () => { localStorage.setItem("hideBal", hidden ? "0" : "1"); setHidden(!hidden); };
  return (
    <header className="mx-auto flex max-w-[1000px] items-center gap-4 px-4 py-4">
      <a href="/" className="display text-3xl text-primary">sabi</a>
      <label className="flex flex-1 items-center gap-2 rounded-full bg-hairline px-4 py-2 text-sm text-muted">
        <FiSearch /><input className="w-full bg-transparent outline-none" placeholder="Search markets" aria-label="Search markets" />
      </label>
      {!token ? (
        <>
          <button onClick={() => openModal(<HowItWorksModal />, "max-w-[340px]")} className="hidden items-center gap-1 text-sm text-muted sm:flex"><FiInfo />How it works?</button>
          <button onClick={() => openModal(<LoginModal mode="login" />, "max-w-[640px]")} className="rounded-full border border-line px-4 py-1.5 text-sm font-medium">Log in</button>
          <button onClick={() => openModal(<LoginModal mode="signup" />, "max-w-[640px]")} className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white">Sign up</button>
          <div className="flex rounded-full bg-hairline p-1">
            <button aria-label="Light" onClick={() => setThemeMode("light")} className={`rounded-full p-1.5 ${theme !== "dark" ? "bg-card" : ""}`}><FiSun /></button>
            <button aria-label="Dark" onClick={() => setThemeMode("dark")} className={`rounded-full p-1.5 ${theme === "dark" ? "bg-card" : ""}`}><FiMoon /></button>
          </div>
        </>
      ) : (
        <>
          <div className="hidden gap-3 text-[11px] leading-tight sm:flex">
            <div><div className="text-muted">Portfolio</div><b>{val(sm.data.portfolioValue)}</b></div>
            <div><div className="text-muted">Cash</div><b>{val(w.data.cash)}</b></div>
          </div>
          <button aria-label="Toggle balances" onClick={toggleEye} className="text-muted">{hidden ? <FiEyeOff /> : <FiEye />}</button>
          <button className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-white">Deposit <FiPlus /></button>
          <button aria-label="Notifications" className="text-muted"><FiBell /></button>
          <div className="relative"><button aria-label="Account" aria-expanded={menu} onClick={() => setMenu(!menu)} className="grid h-8 w-8 place-items-center rounded-full bg-teal-600 text-sm font-semibold text-white">{(user?.firstName || user?.email || "M")[0].toUpperCase()}</button>{menu && <AccountMenu portfolio={val(sm.data.portfolioValue)} cash={val(w.data.cash)} verified={user?.kycStatus === "verified"} onClose={() => setMenu(false)} />}</div>
        </>
      )}
    </header>
  );
}
