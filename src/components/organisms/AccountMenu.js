import { useState } from "react";
import { FiPlus, FiBookmark, FiActivity, FiRepeat, FiBriefcase } from "react-icons/fi";
import { useModal } from "../../context/ModalProvider";
import { useTheme } from "../../context/ThemeContext";
import SignOutModal from "../molecules/modals/SignOutModal";
/** Avatar popover: PORTFOLIO | CASH tabs, links, verify card, dark-mode switch, sign out. Cash tab = TODO (not in recording). */
export default function AccountMenu({ portfolio, cash, verified, onClose }) {
  const [tab, setTab] = useState("portfolio"); const { openModal } = useModal(); const { theme, setThemeMode } = useTheme();
  const links = [["Watchlist", "/watchlist", FiBookmark], ["Your activities", "/activities", FiActivity], ["Transactions history", "/cash", FiRepeat], ["Portfolio", "/portfolio", FiBriefcase]];
  return (
    <div role="menu" className="rise absolute right-0 top-12 z-50 w-72 origin-top-right rounded-2xl bg-popover p-2 text-sm shadow-xl">
      <div className="flex border-b border-hairline">{["portfolio", "cash"].map((t) => <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-xs tracking-wide ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted"}`}>{t.toUpperCase()}</button>)}</div>
      <div className="flex items-center justify-between px-2 py-3"><div><b>{tab === "portfolio" ? portfolio : cash}</b><div className="text-[11px] text-muted">{tab === "portfolio" ? "Funds" : "Available"}</div></div>
        <a href="/cash" className="flex items-center gap-1 rounded-full bg-yesbg px-3 py-1 text-xs font-medium text-primary">Deposit <FiPlus /></a></div>
      {links.map(([l, h, I]) => <a key={l} href={h} onClick={onClose} className="flex items-center gap-3 rounded-lg px-2 py-2 font-semibold hover:bg-hairline"><I className="text-muted" />{l}</a>)}
      {!verified && <button className="my-2 w-full rounded-xl border border-primary/30 bg-yesbg p-3 text-left"><b className="text-xs">Verify account</b><div className="text-[11px] text-muted">Verify your account to unlock all features &amp; start earning.</div></button>}
      <div className="rounded-xl bg-hairline p-1">
        <label className="flex items-center justify-between px-2 py-2">Dark mode<input type="checkbox" role="switch" checked={theme === "dark"} onChange={(e) => setThemeMode(e.target.checked ? "dark" : "light")} /></label>
        <a href="/settings" className="block px-2 py-2">Profile and Settings</a><a href="/help" className="block px-2 py-2">Help &amp; support</a>
        <button onClick={() => { onClose(); openModal(<SignOutModal />, "max-w-[320px]"); }} className="block w-full px-2 py-2 text-left">Sign out</button></div>
    </div>
  );
}
