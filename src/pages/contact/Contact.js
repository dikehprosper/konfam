import { useState } from "react";
import { FiMessageCircle, FiShield, FiUsers, FiCode, FiHelpCircle } from "react-icons/fi";
import Header from "../../components/organisms/Header";
import { api } from "../../utils/api";
const TOPICS = ["General enquiries", "Compliance & legal", "Partnerships & media", "API & development", "Account support"];
// TODO: replace the placeholder addresses with real ones.
const CARDS = [[FiMessageCircle, "General enquiries", "Questions about our markets, our products, or anything else", "hello@konfam.example"], [FiShield, "Compliance & legal", "Regulatory matters, legal requests, and trading prohibition reports", "compliance@konfam.example"], [FiUsers, "Partnerships & media", "Press, media embed, data partnerships, and institutional enquiries", "partners@konfam.example"], [FiCode, "API & development", "Technical questions about our API, data feeds, and integrations", "api@konfam.example"], [FiHelpCircle, "Account support", "Help with your account, trades, deposits, or withdrawals", "support@konfam.example"]];
export default function Contact() {
  const [f, setF] = useState({ fullName: "", email: "", topic: "", message: "" }); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [ref, setRef] = useState("");
  const ok = f.fullName.trim().length > 1 && /^\S+@\S+\.\S+$/.test(f.email) && f.topic && f.message.trim().length >= 10;
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr(""); };
  const send = async (e) => { e.preventDefault(); if (!ok || busy) return; setBusy(true); try { const d = await api("post", "/support/messages", f); setRef(d.reference); } catch (x) { setErr(x.message); } finally { setBusy(false); } };
  const inp = "w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[900px] px-4 pb-24 pt-8">
        <div className="rise text-center"><h1 className="display text-4xl">Contact us</h1><p className="mx-auto mt-3 max-w-lg text-sm text-muted">Whether you're a trader, a developer, a journalist, or a regulator, there are a few ways to get in touch. Check out all our options below.</p></div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{CARDS.map(([I, t, d, m], i) => <div key={t} className="rise" style={{ animationDelay: `${i * 60}ms` }}><span className="grid h-9 w-9 place-items-center rounded-lg bg-yesbg text-primary"><I /></span><h2 className="mt-3 font-semibold">{t}</h2><p className="mt-1 text-sm text-muted">{d}</p><a href={`mailto:${m}`} className="mt-2 inline-block text-sm underline">{m}</a></div>)}</div>
        <section className="mx-auto mt-16 max-w-md rounded-3xl bg-hairline/70 p-6" aria-labelledby="msg">
          <h2 id="msg" className="display text-center text-2xl">Send a message</h2><p className="mt-2 text-center text-xs text-muted">If you need help with your account or want to report a bug or a technical issue, you can send us a message directly.</p>
          {ref ? <div role="status" className="rise py-8 text-center"><h3 className="font-semibold">Message sent</h3><p className="mt-1 text-sm text-muted">We typically respond within one business day.</p><p className="mt-2 text-xs text-subtle">Reference {ref}</p></div> : (
            <form onSubmit={send} className="mt-5 space-y-3">
              <input aria-label="Full name" placeholder="Full name" autoComplete="name" value={f.fullName} onChange={set("fullName")} className={inp} />
              <input aria-label="Email address" placeholder="Email address" type="email" autoComplete="email" value={f.email} onChange={set("email")} className={inp} />
              <select aria-label="Topic" value={f.topic} onChange={set("topic")} className={inp}><option value="">Select a topic</option>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select>
              <textarea aria-label="Message" placeholder="Message" rows={4} value={f.message} onChange={set("message")} className={inp} />
              {err && <p role="alert" className="text-xs text-red-600">{err}</p>}
              <button disabled={!ok || busy} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40">{busy ? "Sending\u2026" : "Send a message"}</button>
              <p className="text-center text-[11px] text-subtle">We typically respond within one business day.</p>
            </form>)}
        </section>
      </main>
    </>
  );
}
