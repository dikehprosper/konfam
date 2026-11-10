import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSliders, FiTrendingUp } from "react-icons/fi";
import Header from "../../components/organisms/Header";
import useApiData from "../../hooks/useApiData";
import { useLive } from "../../context/LiveContext";
import { topics, subtopicsFor } from "../../constants/topics";
import { toCard, toHero } from "../../utils/marketAdapters";
import { useLocation } from "react-router-dom";
import { useModal } from "../../context/ModalProvider";
import LoginModal from "../../components/molecules/modals/LoginModal";
import { axiosAuth } from "../../Config/axios";
import Footer from "../../components/organisms/footer";

const Skeleton = () => (
  <div className="mx-auto max-w-[1280px] space-y-5 px-4 pb-28 sm:pb-16" aria-busy="true" aria-label="Loading markets">
    <div className="flex h-8 items-center gap-5 overflow-hidden">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <div key={i} className={`skel h-4 shrink-0 ${i === 0 ? "w-20" : "w-28"}`} />)}
    </div>
    <div className="flex h-9 items-center gap-2 overflow-hidden">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skel h-7 w-20 shrink-0 rounded-full" />)}
    </div>
    <div className="skel mt-10 h-10 w-72" />
    <div className="skel h-[420px] w-full rounded-3xl sm:h-[330px]" />
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skel h-48 rounded-2xl" />)}
    </div>
  </div>
);
const Chart = ({ s, current }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const left = 0; const right = 930; const top = 8; const bottom = 188;
  const values = s.map((value, index) => (index === s.length - 1 ? current : value));
  const makePoints = (series) => series.map((value, index) => ({
    x: left + (index / (values.length - 1)) * right,
    y: bottom - (value / 100) * (bottom - top),
  }));
  const makePath = (points) => {
    return points.reduce((path, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const previous = points[index - 1];
      const beforePrevious = points[index - 2] || previous;
      const next = points[index + 1] || point;
      const control1X = previous.x + (point.x - beforePrevious.x) / 6;
      const control1Y = previous.y + (point.y - beforePrevious.y) / 6;
      const control2X = point.x - (next.x - previous.x) / 6;
      const control2Y = point.y - (next.y - previous.y) / 6;
      return `${path} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${point.x} ${point.y}`;
    }, "");
  };
  const yesPoints = makePoints(values);
  const noPoints = makePoints(values.map((value) => 100 - value));
  const yesPath = makePath(yesPoints);
  const noPath = makePath(noPoints);
  const selectedIndex = hoverIndex ?? 0;
  const selectedX = yesPoints[selectedIndex].x;
  const selectedYes = Math.round(values[selectedIndex]);
  const selectedNo = 100 - selectedYes;
  const selectedYesY = yesPoints[selectedIndex].y;
  const selectedNoY = noPoints[selectedIndex].y;
  const currentDate = new Date();
  const monthLabels = [3, 2, 1, 0].map((monthsAgo) => (
    new Date(currentDate.getFullYear(), currentDate.getMonth() - monthsAgo, 1)
      .toLocaleString("en", { month: "short" })
  ));
  const timelineStart = new Date(currentDate);
  timelineStart.setMonth(timelineStart.getMonth() - 3);
  const selectedDate = new Date(
    timelineStart.getTime() + (selectedIndex / (values.length - 1)) * (currentDate.getTime() - timelineStart.getTime())
  );
  const dateLabel = selectedDate.toLocaleString("en", { month: "short", day: "numeric", year: "numeric" });
  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * (1000 / right)));
    const nearestIndex = Math.round(progress * (values.length - 1));
    setHoverIndex((index) => (index === nearestIndex ? index : nearestIndex));
  };
  return (
    <svg
      viewBox="0 0 1000 224"
      preserveAspectRatio="none"
      className="h-44 w-full cursor-pointer overflow-visible md:h-48"
      role="img"
      aria-label="YES and NO probabilities from the previous month to today; hover to inspect values"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHoverIndex(null)}
    >
        <defs>
          <linearGradient id="no-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff4438" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ff4438" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="yes-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#58a64d" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#58a64d" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 20, 40, 60, 80, 100].map((value) => {
          const y = bottom - (value / 100) * (bottom - top);
          return (
            <g key={value}>
              <line x1={left} y1={y} x2={right} y2={y} stroke="var(--hairline-strong)" strokeOpacity="0.3" />
              <text x="990" y={y + 4} textAnchor="end" fill="var(--muted)" fillOpacity="0.55" fontSize="14">{value}%</text>
            </g>
          );
        })}
      <path d={`${noPath} L ${right} ${bottom} L ${left} ${bottom} Z`} fill="url(#no-area)" />
      <path d={`${yesPath} L ${right} ${bottom} L ${left} ${bottom} Z`} fill="url(#yes-area)" />
      <line x1={left} y1={top} x2={left} y2={bottom} stroke="var(--hairline-strong)" strokeOpacity="0.45" />
      <line x1={right} y1={top} x2={right} y2={bottom} stroke="var(--hairline-strong)" strokeOpacity="0.45" />
      <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="var(--hairline-strong)" strokeOpacity="0.45" />
      <path d={noPath} fill="none" stroke="#ff4438" strokeWidth="2.5" vectorEffect="non-scaling-stroke" pathLength="1" className="chart-line" />
      <path d={yesPath} fill="none" stroke="#58a64d" strokeWidth="2.5" vectorEffect="non-scaling-stroke" pathLength="1" className="chart-line chart-line-delayed" />
      <circle cx={noPoints[noPoints.length - 1].x} cy={noPoints[noPoints.length - 1].y} r="5" fill="#ff4438" />
      <circle cx={yesPoints[yesPoints.length - 1].x} cy={yesPoints[yesPoints.length - 1].y} r="5" fill="#58a64d" />
      {hoverIndex !== null && (
        <>
          <line x1={selectedX} y1={top} x2={selectedX} y2={bottom} stroke="var(--primary)" strokeOpacity="0.45" strokeWidth="1" />
          <g transform={`translate(${Math.max(4, Math.min(right - 104, selectedX - 52))},0)`}>
            <rect width="104" height="19" rx="6" fill="var(--card)" stroke="var(--hairline-strong)" strokeOpacity="0.55" />
            <text x="52" y="13" textAnchor="middle" fill="var(--muted)" fillOpacity="0.75" fontSize="11">{dateLabel}</text>
          </g>
          <circle className="chart-hover-point" cx={noPoints[selectedIndex].x} cy={selectedNoY} r="6" fill="#ff4438" stroke="var(--card)" strokeWidth="2" />
          <circle className="chart-hover-point" cx={yesPoints[selectedIndex].x} cy={selectedYesY} r="6" fill="#58a64d" stroke="var(--card)" strokeWidth="2" />
          <g transform={`translate(${Math.max(4, selectedX - 94)},${selectedNoY - 14})`}>
            <rect width="86" height="26" rx="7" fill="var(--card)" stroke="#ff4438" strokeWidth="1.5" />
            <text x="43" y="18" textAnchor="middle" fill="#ff4438" fontSize="14" fontWeight="600">NO {selectedNo}%</text>
          </g>
          <g transform={`translate(${Math.max(4, selectedX - 94)},${selectedYesY - 14})`}>
            <rect width="86" height="26" rx="7" fill="var(--card)" stroke="#58a64d" strokeWidth="1.5" />
            <text x="43" y="18" textAnchor="middle" fill="#58a64d" fontSize="14" fontWeight="600">YES {selectedYes}%</text>
          </g>
        </>
      )}
      {monthLabels.map((label, index) => (
        <text key={`${label}-${index}`} x={left + (index / (monthLabels.length - 1)) * right} y="216" textAnchor={index === 0 ? "start" : index === monthLabels.length - 1 ? "end" : "middle"} fill="var(--muted)" fillOpacity="0.65" fontSize="14">
          {label}
        </text>
      ))}
    </svg>
  );
};
function Hero({ items }) {
  const [i, setI] = useState(0); const [pause, setPause] = useState(false);
  const [phase, setPhase] = useState("idle"); const [nextIndex, setNextIndex] = useState(0); const [direction, setDirection] = useState(1);
  const f = items[i];
  const goToSlide = (target, slideDirection) => {
    if (phase !== "idle" || target === i) return;
    setNextIndex(target);
    setDirection(slideDirection);
    setPhase("out");
  };
  useEffect(() => {
    if (pause || phase !== "idle" || items.length < 2) return undefined;
    const timer = setTimeout(() => {
      setNextIndex((i + 1) % items.length);
      setDirection(1);
      setPhase("out");
    }, 7000);
    return () => clearTimeout(timer);
  }, [pause, phase, i, items.length]);
  useEffect(() => {
    if (phase === "out") {
      const timer = setTimeout(() => setPhase("gap"), 350);
      return () => clearTimeout(timer);
    }
    if (phase === "gap") {
      const timer = setTimeout(() => {
        setI(nextIndex);
        setPhase("in");
      }, 100);
      return () => clearTimeout(timer);
    }
    if (phase === "in") {
      const timer = setTimeout(() => setPhase("idle"), 350);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [phase, nextIndex]);
  return (
    <section onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)} className="rise mb-4 rounded-3xl bg-card p-4 shadow-sm sm:p-6">
      <div className="overflow-hidden">
        <div key={f.id} className={`w-full ${phase === "out" ? (direction > 0 ? "hero-slide-out-left" : "hero-slide-out-right") : phase === "gap" ? "hero-slide-hidden" : phase === "in" ? (direction > 0 ? "hero-slide-in-right" : "hero-slide-in-left") : ""}`}>
              <div className="grid items-stretch gap-6 sm:gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div className="flex flex-col">
                  <div className="text-[11px] tracking-widest text-subtle">TOP MARKET &middot; {f.topic.toUpperCase()}</div>
                  <div className="mt-3 flex items-start gap-3">
                    <div className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-2xl bg-hairline text-primary">
                      <FiTrendingUp aria-hidden="true" className="h-8 w-8" />
                    </div>
                    <h2 className="display text-lg sm:text-xl">{f.title}</h2>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2 text-center sm:mt-6 sm:gap-3">
                    <button className="min-h-[46px] rounded-full bg-yesbg py-2.5 font-semibold text-yesfg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.98]">YES</button>
                    <button className="min-h-[46px] rounded-full bg-nobg py-2.5 font-semibold text-nofg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.98]">NO</button>
                    <small className="text-muted">{`\u20a6${f.yes}.00`}</small><small className="text-muted">{`\u20a6${f.no}.00`}</small>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-muted"><span>Vol: {f.vol}</span><span>Ends in: {f.ends}</span></div>
                  <div className="mt-auto flex items-center gap-3 pt-5">
                    <button aria-label="Previous" disabled={phase !== "idle"} onClick={() => goToSlide((i + items.length - 1) % items.length, -1)} className="rounded-full border border-line p-1 disabled:opacity-50"><FiChevronLeft /></button>
                    <div className="flex gap-1">{items.map((_, n) => <button key={n} aria-label={`Go to slide ${n + 1}`} disabled={phase !== "idle"} onClick={() => goToSlide(n, n > i ? 1 : -1)} className={`h-1.5 rounded-full transition-all disabled:cursor-default ${n === i ? "w-5 bg-primary" : "w-1.5 bg-line"}`} />)}</div>
                    <button aria-label="Next" disabled={phase !== "idle"} onClick={() => goToSlide((i + 1) % items.length, 1)} className="rounded-full border border-line p-1 disabled:opacity-50"><FiChevronRight /></button>
                  </div>
                </div>
                <div className="flex min-h-full flex-col">
                  <div className="mb-3 flex items-center justify-end gap-4 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#58a64d]" />YES {f.yesPct}%</span>
                    <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#ff4438]" />NO {100 - f.yesPct}%</span>
                  </div>
                  <Chart s={f.series} current={f.yesPct} />
                  <div className="mt-auto pt-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-fg">
                      <span>Top news</span><span aria-hidden="true" className="opacity-40">&middot;</span><span className="opacity-50">{f.topic}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted opacity-70">{f.news}</p>
                    <p className="mt-1 text-xs text-subtle">
                      Source:{" "}
                      <a
                        href={f.sourceUrl}
                        target={f.sourceUrl.startsWith("http") ? "_blank" : undefined}
                        rel={f.sourceUrl.startsWith("http") ? "noreferrer" : undefined}
                        className="underline underline-offset-2 hover:text-primary"
                      >
                        {f.source}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
        </div>
      </div>
    </section>
  );
}
export function Card({ m }) {
  const { prices } = useLive(); const p = prices[m.id] ?? m.prob; const done = m.status === "resolved";
  return (
    <a href={`/trade/${m.id}`} className="prediction-card rise block rounded-2xl border bg-transparent p-3 text-sm shadow-sm hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-hairline text-primary">
          {m.image ? <img src={m.image} alt="" className="h-full w-full object-cover" /> : <FiTrendingUp aria-hidden="true" className="h-5 w-5" />}
        </div>
        <div className="flex min-w-0 flex-1 justify-between gap-2">
          <span className="line-clamp-2 font-medium">{m.title}</span>
          {done ? <span className="h-fit rounded bg-green-100 px-1.5 text-[10px] text-green-700">Resolved</span> : <span className="font-semibold transition-colors">{p}%</span>}
        </div>
      </div>
      {done ? <div className="mt-3 rounded-full border border-line py-2 text-center font-semibold transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm">{m.result} {m.result === "YES" ? "\u2713" : "\u2717"}</div> :
        <div className="mt-5 grid grid-cols-2 gap-2 text-center font-semibold"><span className="rounded-full bg-yesbg py-2 text-yesfg transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98]">{`YES \u20a6${p}`}</span><span className="rounded-full bg-nobg py-2 text-nofg transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98]">{`NO \u20a6${100 - p}`}</span></div>}
      <div className="mt-2 flex justify-between text-[11px] text-muted"><span>Vol: {m.vol}</span><span>{done ? "Resolved" : `Ends in: ${m.ends}`}</span></div>
    </a>
  );
}
const ErrorState = ({ onRetry }) => (
  <div className="rise mx-auto my-16 max-w-sm text-center">
    <h2 className="display text-xl">We couldn't load markets</h2>
    <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
    <button onClick={onRetry} className="mt-4 rounded-full border border-line px-5 py-2 text-sm font-medium">Retry</button>
  </div>
);
const EmptyState = ({ onClear }) => (
  <div className="rise col-span-full py-12 text-center">
    <h2 className="text-base font-semibold">No markets match these filters</h2>
    <p className="mt-1 text-sm text-muted">Try a different topic or subtopic.</p>
    <button onClick={onClear} className="mt-4 rounded-full border border-line px-5 py-2 text-sm font-medium">Clear filters</button>
  </div>
);
export default function Home() {
  const loc = useLocation(); const { openModal } = useModal();
  useEffect(() => { if (loc.state?.login) { openModal(<LoginModal mode="login" />, "max-w-[640px]"); window.history.replaceState({}, ""); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [topic, setTopic] = useState("Trending"); const [sub, setSub] = useState("All"); const [busy, setBusy] = useState(true);
  const activeSubtopics = subtopicsFor(topic);
  const [filterRowOverflows, setFilterRowOverflows] = useState(false);
  const [extra, setExtra] = useState({ items: [], page: 1, next: null }); const [more, setMore] = useState(false);
  const list = useApiData("/markets", null, { params: { topic, sub, page: 1, limit: 12 }, pollMs: 10000 });
  const feat = useApiData("/markets/featured", null, { pollMs: 30000 });
  const [heroSeries, setHeroSeries] = useState({});
  const filterRowRef = useRef(null);
  useEffect(() => { setBusy(true); setExtra({ items: [], page: 1, next: null }); const t = setTimeout(() => setBusy(false), 700); return () => clearTimeout(t); }, [topic, sub]);
  // Stored price history for each featured market (real points, not generated from the current price)
  useEffect(() => {
    (feat.data || []).forEach((m) => {
      if (heroSeries[m.id]) return;
      axiosAuth().get(`/markets/${m.id}/history`, { params: { range: "1M" } })
        .then((r) => setHeroSeries((h) => ({ ...h, [m.id]: r.data.data.points })))
        .catch(() => {});
    });
    // eslint-disable-next-line
  }, [feat.data]);
  const loadMore = async () => {
    const nextPage = extra.page > 1 ? extra.next : list.data?.nextPage; if (!nextPage || more) return;
    setMore(true);
    try {
      const r = await axiosAuth().get("/markets", { params: { topic, sub, page: nextPage, limit: 12 } });
      const d = r.data.data; setExtra((e) => ({ items: [...e.items, ...d.items], page: nextPage, next: d.nextPage }));
    } finally { setMore(false); }
  };
  const loading = busy || (list.isLoading && !list.data);
  useEffect(() => {
    const row = filterRowRef.current;
    if (!row) return undefined;
    const updateOverflow = () => setFilterRowOverflows(row.scrollWidth > row.clientWidth + 1);
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(row);
    return () => observer.disconnect();
  }, [activeSubtopics, loading]);
  const baseItems = list.data?.items || []; const seen = new Set(baseItems.map((m) => m.id));
  const cards = [...baseItems, ...extra.items.filter((m) => !seen.has(m.id))].map(toCard);
  const heroes = (feat.data || []).map((m) => toHero(m, heroSeries[m.id] || []));
  const hasMore = extra.page > 1 ? !!extra.next : !!list.data?.nextPage;
  const scrollFilters = (direction) => { if (filterRowRef.current) filterRowRef.current.scrollBy({ left: direction * 220, behavior: "smooth" }); };
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        {loading ? <Skeleton /> : (
          <main className="mx-auto max-w-[1280px] space-y-5 px-4 pb-28 sm:pb-16">
          <nav className="mt-3 flex min-w-0 items-center gap-3 py-1 text-sm text-muted sm:gap-4" aria-label="Market topics">
            <button onClick={() => { setTopic("Trending"); setSub("All"); }} aria-current={topic === "Trending" ? "page" : undefined} className={`shrink-0 whitespace-nowrap transition-colors hover:text-primary focus-visible:outline-none ${topic === "Trending" ? "font-semibold text-fg" : ""}`}>Trending</button>
            <span aria-hidden="true" className="shrink-0 self-center leading-none">.</span>
            <div className="scrollbar-none flex min-w-0 flex-1 gap-4 overflow-x-auto sm:gap-5">
              {topics.filter((t) => t !== "Trending").map((t) => <button key={t} onClick={() => { setTopic(t); setSub("All"); }} aria-current={t === topic ? "page" : undefined} className={`shrink-0 whitespace-nowrap transition-colors hover:text-primary focus-visible:outline-none ${t === topic ? "font-semibold text-fg" : ""}`}>{t}</button>)}
            </div>
          </nav>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <button aria-label="Filters" className="rounded-full bg-hairline p-2"><FiSliders /></button>
            {filterRowOverflows && <button aria-label="Scroll left" onClick={() => scrollFilters(-1)} className="rounded-full border border-line p-2 text-muted"><FiChevronLeft /></button>}
            <div ref={filterRowRef} className="scrollbar-none flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth py-1">
              {activeSubtopics.map((s) => <button key={s} onClick={() => setSub(s)} aria-pressed={s === sub} className={`subtopic-chip whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors duration-200 ${s === sub ? "border-primary bg-yesbg text-primary" : "border-transparent bg-hairline text-fg"}`}>{s}</button>)}
            </div>
            {filterRowOverflows && <button aria-label="Scroll right" onClick={() => scrollFilters(1)} className="rounded-full border border-line p-2 text-muted"><FiChevronRight /></button>}
          </div>
          <h1 className="display mt-10 text-3xl sm:text-4xl">The News, Reimagined.</h1>
          {(list.data?.items?.[0]?.simulatedTraderCount || 0) > 0 && (
            <p className="rounded-lg bg-yesbg px-3 py-2 text-xs text-primary">
              Demo simulation: {list.data.items[0].simulatedTraderCount} synthetic traders influence demo-market prices and volume. No real users are represented.
            </p>
          )}
          {list.error && !list.data ? <ErrorState onRetry={() => { list.refetch(); feat.refetch(); }} /> : (
            <>
              {heroes.length > 0 && <Hero items={heroes} />}
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {cards.length ? cards.map((m) => <Card key={m.id} m={m} />) : <EmptyState onClear={() => { setTopic("Trending"); setSub("All"); }} />}
              </div>
              {hasMore && <div className="flex justify-center pt-2"><button disabled={more} onClick={loadMore} className="rounded-full border border-line px-6 py-2 text-sm font-medium disabled:opacity-50">{more ? "Loading\u2026" : "Show more"}</button></div>}
            </>
          )}
          </main>
        )}
      </div>
      <Footer />
    </div>
  );
}
