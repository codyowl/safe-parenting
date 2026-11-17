"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { CoachReply } from "@/lib/coach";

type Message = { id: string; role: "user"; content: string } |
  { id: string; role: "assistant"; content: string; reply: CoachReply };

const copy = {
  en: {
    eyebrow: "A LITTLE SUPPORT FOR PARENTS",
    heading: <>Big feelings.<br />Small steps.</>,
    intro: "Parenting doesn’t come with all the answers. Let’s find one manageable next step, together.",
    first: "Share what’s happening", firstDetail: "A few sentences are enough. English or Urdu is welcome.",
    second: "Find a small next step", secondDetail: "Get a short, practical plan you can try.",
    third: "Keep the conversation going", thirdDetail: "Check in and tell us how it went.",
    safetyTitle: "Some moments need human support.",
    safety: "In immediate danger, contact local emergency services now. This coach cannot provide crisis care, medical advice, or legal advice.",
    chatTitle: "Your space to talk", chatSubtitle: "One concern. A few small steps.", newChat: "New conversation",
    emptyTitle: "What’s on your mind?", emptyDetail: "Start wherever you are. You don’t need the perfect words.",
    examples: [
      { label: "Screen-time struggles", text: "My eight-year-old gets upset when screen time ends. How can I make evenings calmer?", icon: "☀" },
      { label: "Bedtime battles", text: "My six-year-old keeps asking for more stories at bedtime. How can we make a calmer routine?", icon: "☾" },
      { label: "Homework hesitation", text: "My child puts off starting homework every afternoon. What could we try?", icon: "✎" },
    ],
    inputLabel: "Tell us what’s happening", placeholder: "For example, my child gets upset when it’s time to…",
    send: "Find a next step", thinking: "Thinking through your concern…", parent: "You", coach: "Little Steps",
    plan: "YOUR SMALL-STEP PLAN", urgent: "HUMAN SUPPORT IS NEEDED", boundary: "THE RIGHT KIND OF SUPPORT",
    followUp: "Let’s check in", immediateFollowUp: "Right now", error: "We couldn’t get a reply. Please try again.",
    full: "This conversation has reached its limit. Start a new conversation to continue.",
    privacy: "Demo: use fictional examples. Messages go to Google Gemini and may be used to improve its products on the free tier.",
    memory: "No account needed. History clears when you refresh or start a new conversation.",
    inputHint: "English or اردو · Ctrl / ⌘ + Enter to send", clearHint: "Clear this conversation", footer: "A little guidance. A little breathing room.",
  },
  ur: {
    eyebrow: "والدین کے لیے تھوڑی سی مدد",
    heading: <>بڑے احساسات۔<br />چھوٹے قدم۔</>,
    intro: "والدین کے پاس ہر سوال کا جواب ہونا ضروری نہیں۔ آئیے مل کر ایک آسان اگلا قدم تلاش کریں۔",
    first: "بتائیں کیا ہو رہا ہے", firstDetail: "چند جملے کافی ہیں۔ انگریزی یا اردو میں لکھیں۔",
    second: "ایک چھوٹا قدم تلاش کریں", secondDetail: "ایک مختصر، عملی منصوبہ حاصل کریں۔",
    third: "بات جاری رکھیں", thirdDetail: "واپس آ کر بتائیں کہ کیسا رہا۔",
    safetyTitle: "کچھ حالات میں انسانی مدد ضروری ہے۔",
    safety: "فوری خطرے میں مقامی ایمرجنسی سروس سے ابھی رابطہ کریں۔ یہ کوچ ہنگامی مدد، طبی یا قانونی مشورہ نہیں دے سکتا۔",
    chatTitle: "آپ کی بات سننے کی جگہ", chatSubtitle: "ایک مسئلہ، چند چھوٹے قدم۔", newChat: "نئی گفتگو",
    emptyTitle: "آپ کے ذہن میں کیا ہے؟", emptyDetail: "جہاں سے چاہیں شروع کریں۔ بہترین الفاظ تلاش کرنا ضروری نہیں۔",
    examples: [
      { label: "اسکرین ٹائم", text: "میرا آٹھ سالہ بچہ اسکرین ٹائم ختم ہونے پر ناراض ہو جاتا ہے۔ شام کا وقت پُرسکون کیسے بنا سکتے ہیں؟", icon: "☀" },
      { label: "سونے کا وقت", text: "میرا چھ سالہ بچہ سونے کے وقت مزید کہانیاں مانگتا ہے۔ ہم ایک پُرسکون معمول کیسے بنائیں؟", icon: "☾" },
      { label: "ہوم ورک", text: "میرا بچہ ہر روز ہوم ورک شروع کرنے میں دیر کرتا ہے۔ ہم کیا آزما سکتے ہیں؟", icon: "✎" },
    ],
    inputLabel: "بتائیں کیا ہو رہا ہے", placeholder: "مثلاً، میرا بچہ اس وقت ناراض ہو جاتا ہے جب…",
    send: "اگلا قدم تلاش کریں", thinking: "آپ کی بات پر غور ہو رہا ہے…", parent: "آپ", coach: "لٹل اسٹیپس",
    plan: "آپ کا مختصر منصوبہ", urgent: "انسانی مدد ضروری ہے", boundary: "مناسب مدد",
    followUp: "دوبارہ بات کرتے ہیں", immediateFollowUp: "ابھی", error: "جواب حاصل نہیں ہو سکا۔ براہ کرم دوبارہ کوشش کریں۔",
    full: "یہ گفتگو اپنی حد تک پہنچ گئی ہے۔ جاری رکھنے کے لیے نئی گفتگو شروع کریں۔",
    privacy: "ڈیمو: فرضی مثالیں استعمال کریں۔ پیغامات Google Gemini کو بھیجے جاتے ہیں اور مفت درجے میں مصنوعات کی بہتری کے لیے استعمال ہو سکتے ہیں۔",
    memory: "اکاؤنٹ کی ضرورت نہیں۔ صفحہ ریفریش کرنے یا نئی گفتگو شروع کرنے سے تاریخ مٹ جاتی ہے۔",
    inputHint: "English یا اردو · بھیجنے کے لیے Ctrl / ⌘ + Enter", clearHint: "یہ گفتگو صاف کریں", footer: "تھوڑی رہنمائی۔ سکون کا ایک لمحہ۔",
  },
};

function Leaf({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 27V15M16 20C7 20 5 13 6 7c8 0 11 5 10 13ZM16 15C16 7 21 4 28 4c0 8-4 12-12 11Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CoachCard({ reply }: { reply: CoachReply }) {
  const t = copy[reply.language];
  const crisis = ["emergency", "abuse", "self_harm"].includes(reply.category);
  return <section className={`coach-card ${crisis ? "crisis-card" : ""}`} dir={reply.language === "ur" ? "rtl" : "ltr"} lang={reply.language}>
    <p className="response-label">{crisis ? t.urgent : reply.category === "everyday" ? t.plan : t.boundary}</p>
    <p className="acknowledgment">{reply.acknowledgment}</p>
    <ol className="plan-steps">{reply.steps.map((step, index) => <li key={index}><span className="step-number" aria-hidden="true">{index + 1}</span><span>{step}</span></li>)}</ol>
    <div className="follow-up"><span>{crisis ? t.immediateFollowUp : t.followUp}</span><p>{reply.followUp}</p></div>
  </section>;
}

export default function Home() {
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const t = copy[language];
  const full = messages.length >= 20;

  useEffect(() => {
    if (messages.length || busy) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || busy || full) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content };
    const history = [...messages, userMessage];
    setBusy(true);
    setPending(content);
    setError("");
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: AbortSignal.timeout(45_000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : t.error);
      if (!data.reply) throw new Error(t.error);
      const reply: CoachReply = data.reply;
      // Keep the complete displayed reply in context for the next follow-up.
      setMessages([...history, { id: crypto.randomUUID(), role: "assistant", content: JSON.stringify(reply), reply }]);
      setDraft("");
    } catch (caught) {
      setError(caught instanceof Error && caught.name !== "TimeoutError" && caught.name !== "TypeError" ? caught.message : t.error);
    } finally {
      setBusy(false);
      setPending("");
    }
  }

  function reset() {
    setMessages([]);
    setDraft("");
    setError("");
    inputRef.current?.focus();
  }

  return <div className="site-shell" lang={language} dir={language === "ur" ? "rtl" : "ltr"}>
    <header className="site-header">
      <a className="brand" href="/" aria-label="Little Steps home" dir="ltr"><span className="brand-mark"><Leaf /></span><span>little steps<span className="brand-dot">.</span></span></a>
      <div className="language-switch" role="group" aria-label="Interface language"><button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button><button type="button" aria-pressed={language === "ur"} onClick={() => setLanguage("ur")} lang="ur">اردو</button></div>
    </header>

    <main className="main-layout">
      <aside className="intro-panel">
        <p className="eyebrow"><span />{t.eyebrow}</p>
        <h1>{t.heading}</h1>
        <p className="intro-copy">{t.intro}</p>
        <div className="how-it-works">{[[t.first, t.firstDetail], [t.second, t.secondDetail], [t.third, t.thirdDetail]].map(([title, detail], index) => <div className="how-step" key={index}><span className="how-number">0{index + 1}</span><div><h2>{title}</h2><p>{detail}</p></div></div>)}</div>
        <div className="safety-note"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 8 3v6c0 4-5 8-8 9-3-1-8-5-8-9V6l8-3Z" stroke="currentColor" strokeWidth="1.5" /><path d="M12 8v5m0 3v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg><div><h2>{t.safetyTitle}</h2><p>{t.safety}</p></div></div>
      </aside>

      <section className="conversation" aria-label={t.chatTitle}>
        <div className="conversation-header"><div><h2>{t.chatTitle}</h2><p>{t.chatSubtitle}</p></div><button className="reset-button" type="button" title={t.clearHint} disabled={busy || (!messages.length && !draft)} onClick={reset}><span aria-hidden="true">＋</span>{t.newChat}</button></div>
        <div className="conversation-scroll" role="log" aria-live="polite" aria-relevant="additions" aria-label={t.chatTitle}>
          {!messages.length && !busy && <div className="empty-state"><div className="empty-mark"><Leaf /></div><h2>{t.emptyTitle}</h2><p>{t.emptyDetail}</p><div className="example-list">{t.examples.map((example) => <button key={example.label} type="button" onClick={() => { setDraft(example.text); setError(""); inputRef.current?.focus(); }}><span className="example-icon" aria-hidden="true">{example.icon}</span><span>{example.label}</span><span className="example-arrow" aria-hidden="true">↗</span></button>)}</div><p className="empty-footnote">{t.memory}</p></div>}
          {messages.map((message) => <div className={`message message-${message.role}`} key={message.id}><p className="message-author">{message.role === "user" ? t.parent : t.coach}</p>{message.role === "user" ? <p className="user-bubble" dir="auto">{message.content}</p> : <CoachCard reply={message.reply} />}</div>)}
          {busy && <><div className="message message-user"><p className="message-author">{t.parent}</p><p className="user-bubble" dir="auto">{pending}</p></div><div className="thinking" role="status"><span className="thinking-dot" />{t.thinking}</div></>}
          <div ref={bottomRef} />
        </div>

        <form className="composer" onSubmit={send}>
          {error && <p className="error-message" role="alert">{error}</p>}
          {full && <p className="limit-message" role="status">{t.full}</p>}
          <label htmlFor="concern">{t.inputLabel}</label>
          <div className="input-wrap"><textarea id="concern" ref={inputRef} dir="auto" rows={3} maxLength={3000} value={draft} disabled={busy || full} placeholder={t.placeholder} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><div className="composer-bottom"><span className="input-hint">{t.inputHint}</span><span className="character-count" aria-label={`${draft.length} / 3000`}>{draft.length}/3000</span><button className="send-button" type="submit" disabled={!draft.trim() || busy || full}>{t.send}<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div></div>
          <p className="privacy-note">{t.privacy}</p>
        </form>
      </section>
    </main>
    <footer className="site-footer"><span>little steps</span><p>{t.footer}</p><span className="prototype-label">{language === "ur" ? "والدین کے لیے کوچ · ڈیمو" : "PARENT COACH · DEMO"}</span></footer>
  </div>;
}
