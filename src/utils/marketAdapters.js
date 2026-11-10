import { compactNaira, timeLeft } from "./format";
/** Maps backend market DTOs to the shapes the existing Home cards/hero already render. */
export const toCard = (m) => ({
  id: m.id, title: m.title, prob: m.probability, yes: Math.round(m.yesPriceKobo / 100), no: Math.round(m.noPriceKobo / 100),
  vol: compactNaira(m.volumeKobo), ends: timeLeft(m.closesAt), status: m.status, closesAt: m.closesAt,
  simulatedTraderCount: m.simulatedTraderCount || 0,
  result: m.resolutionOutcome ? m.resolutionOutcome.toUpperCase() : undefined, image: m.imageUrl || null,
});
export const toHero = (m, points = []) => ({
  id: m.id, topic: m.topic, title: m.title, yes: Math.round(m.yesPriceKobo / 100), no: Math.round(m.noPriceKobo / 100),
  vol: compactNaira(m.volumeKobo), ends: timeLeft(m.closesAt), yesPct: m.probability, news: m.newsSummary || "No related news yet.",
  source: m.sourceAgency || "Source", sourceUrl: "#",
  series: points.length > 1 ? points.map((p) => Math.round(p.yesKobo / 100)) : [m.probability, m.probability],
});
