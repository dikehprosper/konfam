import { useLive } from "../../context/LiveContext";
/** Slides down from the top when offline or the live socket is configured but disconnected. */
export default function ConnectionBanner() {
  const { connected, online } = useLive();
  const show = !online || (!!process.env.REACT_APP_SOCKET_URL && !connected);
  return (
    <div aria-live="polite" className="fixed left-0 right-0 top-0 z-[99999] flex justify-center pointer-events-none">
      <div className={`mt-3 rounded-xl bg-fg text-canvas px-4 py-2 text-sm shadow-lg transition-transform duration-300 ${show ? "translate-y-0" : "-translate-y-[200%]"}`}>
        {online ? "Not connected. Live data is paused." : "You're offline."}
      </div>
    </div>
  );
}
