import { FiBookmark } from "react-icons/fi";
import Header from "../../components/organisms/Header";
import { Card } from "../home/Home";
import useApiData from "../../hooks/useApiData";
import { useToast } from "../../context/ToastProvider";
import { api } from "../../utils/api";
import { toCard } from "../../utils/marketAdapters";

export default function Watchlist() {
  const toast = useToast(); const wl = useApiData("/watchlist", null, { refreshOn: "watch:refresh", pollMs: 15000 });
  const items = wl.data?.items || [];
  const remove = async (id) => { try { await api("delete", `/watchlist/${id}`); toast("Removed from favorites"); window.dispatchEvent(new Event("watch:refresh")); } catch (e) { toast(e.message); } };
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1280px] px-4 pb-24 pt-4">
        <h1 className="display text-3xl">Watchlists</h1>
        {wl.isLoading && !wl.data ? <p className="mt-16 text-center text-sm text-muted" role="status">Loading watchlist&hellip;</p>
          : wl.error && !wl.data ? <p className="mt-16 text-center text-sm text-muted">Couldn't load your watchlist. <button onClick={wl.refetch} className="font-semibold text-primary">Retry</button></p>
          : items.length ? <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">{items.map((m) => <div key={m.id} className="relative"><Card m={toCard(m)} /><button aria-label="Remove from watchlist" onClick={() => remove(m.id)} className="absolute bottom-3 right-3 rounded-full bg-card p-1.5 text-primary shadow"><FiBookmark className="fill-current" /></button></div>)}</div>
          : <div className="rise mx-auto mt-20 max-w-sm text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-yesbg text-primary"><FiBookmark className="h-6 w-6" /></div>
              <h2 className="mt-4 text-lg font-semibold">Your watchlist is empty</h2><p className="mt-1 text-sm text-muted">Save markets you're interested in to track price movements and updates in one place.</p>
              <a href="/" className="mt-5 inline-block rounded-full border border-line px-5 py-2 text-sm font-medium">Explore markets</a></div>}
      </main>
    </>
  );
}
