import { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import useApiData from "../../hooks/useApiData";
import { api } from "../../utils/api";
const TABS = [["unread", "Unread"], ["read", "Read"], ["updates", "Updates"]];
const ago = (iso) => { const s = (Date.now() - new Date(iso)) / 1000; return s < 60 ? "now" : s < 3600 ? `${Math.floor(s / 60)}m` : s < 86400 ? `${Math.floor(s / 3600)}h` : `${Math.floor(s / 86400)}d`; };
export default function NotificationBell() {
  const [open, setOpen] = useState(false); const [tab, setTab] = useState("unread"); const box = useRef(null);
  const list = useApiData("/notifications", null, { params: { status: open ? tab : "unread", limit: open ? 10 : 1 }, pollMs: 20000, refreshOn: "notif:refresh" });
  const unread = list.data?.unread || 0;
  useEffect(() => { const h = (e) => { if (open && box.current && !box.current.contains(e.target)) setOpen(false); }; const k = (e) => e.key === "Escape" && setOpen(false); document.addEventListener("mousedown", h); document.addEventListener("keydown", k); return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); }; }, [open]);
  const read = async (n) => { if (!n.read && n.kind === "personal") { await api("post", `/notifications/${n.id}/read`).catch(() => {}); window.dispatchEvent(new Event("notif:refresh")); } };
  const all = async () => { await api("post", "/notifications/read-all").catch(() => {}); window.dispatchEvent(new Event("notif:refresh")); };
  const items = open ? list.data?.items || [] : [];
  return (
    <div ref={box} className="relative flex shrink-0">
      <button aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={open} onClick={() => setOpen(!open)} className="relative grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-hairline hover:text-fg"><FiBell className="h-[18px] w-[18px]" />{unread > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-card">{unread > 9 ? "9+" : unread}</span>}</button>
      {open && (
        <div role="dialog" aria-label="Notifications" className="rise absolute right-0 top-10 z-50 w-80 max-w-[calc(100vw-1rem)] origin-top-right rounded-2xl border border-line bg-popover p-2 text-sm shadow-xl">
          <div className="flex items-center justify-between px-2"><div className="flex gap-4">{TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`py-2 text-xs font-semibold transition-colors ${tab === k ? "border-b-2 border-primary text-primary" : "text-muted"}`}>{l}</button>)}</div>
            {tab === "unread" && unread > 0 && <button onClick={all} className="text-[11px] font-semibold text-primary">Mark all read</button>}</div>
          <div className="max-h-80 overflow-y-auto py-1">
            {list.isLoading && !list.data ? [0, 1, 2].map((i) => <div key={i} className="skel m-2 h-12" />) : items.length ? items.map((n) => (
              <button key={n.id} onClick={() => read(n)} className="rise flex w-full gap-2 rounded-lg px-2 py-2 text-left hover:bg-hairline"><span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${n.read || n.kind === "update" ? "bg-transparent" : "bg-primary"}`} />
                <span className="min-w-0 flex-1"><b className="block truncate text-[13px]">{n.title}</b><span className="line-clamp-2 text-xs text-muted">{n.body}</span></span><span className="text-[10px] text-subtle">{ago(n.createdAt)}</span></button>))
              : <div className="rise px-4 py-10 text-center text-xs text-muted">{tab === "unread" ? "You're all caught up." : tab === "read" ? "No read notifications yet." : "No updates right now."}</div>}
          </div>
        </div>)}
    </div>
  );
}
