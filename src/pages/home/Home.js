import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSliders } from "react-icons/fi";
import Header from "../../components/organisms/Header";
import useApiData from "../../hooks/useApiData";
import { useLive } from "../../context/LiveContext";
import { topics, subtopics, markets as mockMarkets, featured as mockFeatured } from "../../mocks/markets";

const Skeleton = () => (
  <div className="mx-auto max-w-[1000px] space-y-6 px-4" aria-busy="true">
    <div className="skel h-5 w-full" /><div className="skel h-7 w-full" />
    <div className="skel h-10 w-64" />
    <div className="skel h-[330px] w-full rounded-3xl" />
    <div className="grid gap-3 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="skel h-36" />)}</div>
  </div>
);
const Chart = ({ s }) => {
  const pts = s.map((v, i) => `${(i / (s.length - 1)) * 100},${100 - v}`).join(" ");
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-44 w-full"><polyline points={pts} fill="none" stroke="var(--up)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" /></svg>;
};
function Hero({ items }) {
  const [i, setI] = useState(0); const [pause, setPause] = useState(false);
  useEffect(() => { if (pause) return; const t = setInterval(() => setI((x) => (x + 1) % items.length), 7000); return () => clearInterval(t); }, [pause, items.length]);
  const f = items[i];
  return (
    <section onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)} className="rise rounded-3xl bg-card p-6 shadow-sm">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="text-[11px] tracking-widest text-subtle">TOP MARKET &middot; {f.topic.toUpperCase()}</div>
          <h2 className="display mt-2 text-xl">{f.title}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <button className="rounded-full bg-yesbg py-2 font-semibold text-yesfg">YES</button>
            <button className="rounded-full bg-nobg py-2 font-semibold text-nofg">NO</button>
            <small className="text-muted">{`\u20a6${f.yes}.00`}</small><small className="text-muted">{`\u20a6${f.no}.00`}</small>
          </div>
          <div className="mt-4 flex justify-between text-xs text-muted"><span>Vol: {f.vol}</span><span>Ends in: {f.ends}</span></div>
        </div>
        <div>
          <div className="text-xs text-muted">Yes {f.yesPct}% &middot; No {100 - f.yesPct}%</div>
          <Chart s={f.series} />
          <p className="mt-2 text-sm text-muted">{f.news} <u>source: {f.source}</u></p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button aria-label="Previous" onClick={() => setI((i + items.length - 1) % items.length)} className="rounded-full border border-line p-1"><FiChevronLeft /></button>
        <div className="flex gap-1">{items.map((_, n) => <span key={n} className={`h-1.5 rounded-full transition-all ${n === i ? "w-5 bg-primary" : "w-1.5 bg-line"}`} />)}</div>
        <button aria-label="Next" onClick={() => setI((i + 1) % items.length)} className="rounded-full border border-line p-1"><FiChevronRight /></button>
      </div>
    </section>
  );
}
function Card({ m }) {
  const { prices } = useLive(); const p = prices[m.id] ?? m.prob; const done = m.status === "resolved";
  return (
    <a href={`/trade/${m.id}`} className="rise block rounded-2xl bg-card p-3 text-sm shadow-sm">
      <div className="flex justify-between gap-2"><span className="line-clamp-2 font-medium">{m.title}</span>{done ? <span className="h-fit rounded bg-green-100 px-1.5 text-[10px] text-green-700">Resolved</span> : <span className="font-semibold transition-colors">{p}%</span>}</div>
      {done ? <div className="mt-3 rounded-full border border-line py-2 text-center font-semibold">{m.result} {m.result === "YES" ? "\u2713" : "\u2717"}</div> :
        <div className="mt-3 grid grid-cols-2 gap-2 text-center font-semibold"><span className="rounded-full bg-yesbg py-2 text-yesfg">{`YES \u20a6${p}`}</span><span className="rounded-full bg-nobg py-2 text-nofg">{`NO \u20a6${100 - p}`}</span></div>}
      <div className="mt-2 flex justify-between text-[11px] text-muted"><span>Vol: {m.vol}</span><span>{done ? "Resolved" : `Ends in: ${m.ends}`}</span></div>
    </a>
  );
}
export default function Home() {
  const [topic, setTopic] = useState("Trending"); const [sub, setSub] = useState("All"); const [busy, setBusy] = useState(true);
  const list = useApiData("/markets", mockMarkets, { params: { topic, sub } });
  const feat = useApiData("/markets/featured", mockFeatured);
  useEffect(() => { setBusy(true); const t = setTimeout(() => setBusy(false), 700); return () => clearTimeout(t); }, [topic, sub]);
  const loading = busy || list.isLoading || feat.isLoading;
  const items = Array.isArray(list.data) ? list.data : list.data.items || mockMarkets;
  return (
    <>
      <Header />
      {loading ? <Skeleton /> : (
        <main className="mx-auto max-w-[1000px] space-y-5 px-4 pb-16">
          <nav className="flex gap-5 overflow-x-auto text-sm text-muted">{topics.map((t) => <button key={t} onClick={() => setTopic(t)} className={`whitespace-nowrap ${t === topic ? "font-semibold text-fg" : ""}`}>{t}</button>)}</nav>
          <div className="flex items-center gap-2 overflow-x-auto"><button aria-label="Filters" className="rounded-full bg-hairline p-2"><FiSliders /></button>
            {subtopics.map((s) => <button key={s} onClick={() => setSub(s)} className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${s === sub ? "border border-primary bg-yesbg text-primary" : "bg-hairline"}`}>{s}</button>)}</div>
          <h1 className="display text-4xl">The News, Reimagined.</h1>
          <Hero items={Array.isArray(feat.data) ? feat.data : mockFeatured} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((m) => <Card key={m.id} m={m} />)}</div>
        </main>
      )}
    </>
  );
}
