import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { markets as mock } from "../mocks/markets";
const Ctx = createContext({ prices: {}, connected: false, online: true });
export const useLive = () => useContext(Ctx);
/** Live store: socket.io when REACT_APP_SOCKET_URL works; otherwise a capped random-walk ticker on placeholder data. */
export function LiveProvider({ children }) {
  const [prices, setPrices] = useState(() => Object.fromEntries(mock.map((m) => [m.id, m.prob])));
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    let s; const url = process.env.REACT_APP_SOCKET_URL;
    if (url) { s = io(url, { transports: ["polling", "websocket"], auth: { token: localStorage.getItem("Tkn") }, reconnectionDelayMax: 10000 });
      s.on("connect", () => setConnected(true)); s.on("disconnect", () => setConnected(false)); s.on("connect_error", () => setConnected(false));
      s.on("markets:update", (u) => setPrices((p) => ({ ...p, ...u }))); }
    const tick = process.env.REACT_APP_DEMO !== "true" ? null : setInterval(() => setPrices((p) => { if (s?.connected) return p; const n = { ...p };
      Object.keys(n).forEach((k) => { if (n[k] > 0 && n[k] < 100) n[k] = Math.min(98, Math.max(2, n[k] + (Math.random() > .5 ? 1 : -1))); }); return n; }), 3500);
    return () => { if (tick) clearInterval(tick); s?.close(); window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return <Ctx.Provider value={{ prices, connected, online }}>{children}</Ctx.Provider>;
}
