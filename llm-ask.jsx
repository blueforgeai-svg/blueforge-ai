// LLM Ask widget — visitors ask about Blueforge AI services via choice of LLM persona
const { useState: useLM, useRef: useRefLM } = React;

const LM_PERSONAS = [
  { key: "claude",  name: "Claude",  hint: "Anthropic · thoughtful" },
  { key: "gpt",     name: "ChatGPT", hint: "OpenAI · versatile" },
  { key: "grok",    name: "Grok",    hint: "xAI · direct" },
  { key: "gemini",  name: "Gemini",  hint: "Google · concise" },
];

const LM_SUGGESTS = [
  "What does Blueforge AI actually deliver in an 8–12 week pilot?",
  "How do you compare AVEVA PI vs Canary vs TDengine for a mid-size plant?",
  "Can you build a golden batch model on top of an existing PI System?",
  "What's a realistic ROI for predictive maintenance on rotating equipment?",
];

const LM_SYS = `You are answering questions on the Blueforge AI website. Blueforge AI is an industrial data intelligence consultancy. Services: plant digitalization (AVEVA PI, Canary Historian, TDengine), Grafana dashboards, custom PI Vision symbols, AI/ML models (anomaly detection, predictive maintenance/RUL, soft sensors, computer vision QA, golden batch), and custom software development for industrial operations. Tone: confident, technical, honest, brief. Keep answers to 3-5 sentences. End with a soft nudge to reach out at info@blueforgeai.com when relevant. Adapt your voice to the requested persona but stay accurate.`;

function LLMAskSection() {
  const [persona, setPersona] = useLM("claude");
  const [q, setQ] = useLM("");
  const [a, setA] = useLM("");
  const [loading, setLoading] = useLM(false);
  const [err, setErr] = useLM("");

  const ask = async (question) => {
    const text = (question ?? q).trim();
    if (!text) return;
    setLoading(true); setErr(""); setA("");
    try {
      if (!(window.claude && typeof window.claude.complete === "function")) {
        // PRODUCTION: replace this branch with a fetch() to your own LLM proxy endpoint.
        // The endpoint should accept { persona, question } and forward to OpenAI / Anthropic / xAI / Google
        // with an API key kept server-side. While that backend is being set up, we fall back to
        // an honest message so the widget never appears broken.
        throw new Error("no-backend");
      }
      const personaName = LM_PERSONAS.find((p) => p.key === persona).name;
      const prompt = `${LM_SYS}\n\nRespond in the voice of ${personaName}.\n\nVisitor question: ${text}`;
      const result = await window.claude.complete(prompt);
      setA(result);
    } catch (e) {
      setErr(
        e && e.message === "no-backend"
          ? "Live model access isn't wired up on this domain yet. Copy your question and paste it into ChatGPT, Claude, Grok or Gemini — or just email info@blueforgeai.com and we'll answer ourselves."
          : "Couldn't reach the model. Try again or email info@blueforgeai.com directly."
      );
    }
    setLoading(false);
  };

  return (
    <section className="section" id="ask" data-screen-label="10b Ask">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">10b · Ask anything</div>
            <h2 style={{ marginTop: 14 }}>Talk to an LLM.<br /><span style={{ color: "var(--fg-mute)" }}>About us, our stack, your project.</span></h2>
          </div>
          <p className="lead">
            Pick your model, ask a question. We've briefed each one on what we do, how we work, and what we don't pretend to do. No sales chatbot — just a real answer.
          </p>
        </div>

        <div className="lm-wrap">
          <div className="lm-personas">
            {LM_PERSONAS.map((p) => (
              <button key={p.key} className={"lm-persona" + (persona === p.key ? " lm-persona--active" : "")} onClick={() => setPersona(p.key)}>
                <div className="lm-persona__name">{p.name}</div>
                <div className="lm-persona__hint">{p.hint}</div>
              </button>
            ))}
          </div>

          <div className="lm-input">
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Ask ${LM_PERSONAS.find((p) => p.key === persona).name} about Blueforge AI…`}
              rows={3}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask(); }}
            />
            <button className="btn btn--primary lm-send" disabled={loading || !q.trim()} onClick={() => ask()}>
              {loading ? "Thinking…" : "Ask"} <span className="arrow">→</span>
            </button>
          </div>

          <div className="lm-suggests">
            <div className="lm-suggests__lbl">Try:</div>
            {LM_SUGGESTS.map((s) => (
              <button key={s} className="lm-suggest" onClick={() => { setQ(s); ask(s); }}>{s}</button>
            ))}
          </div>

          {(a || loading || err) && (
            <div className="lm-answer">
              <div className="lm-answer__head">
                <span className="tag">{LM_PERSONAS.find((p) => p.key === persona).name}</span>
                <span className="live"><span className="dot" /> {loading ? "generating" : "response"}</span>
              </div>
              <div className="lm-answer__body">
                {err ? <span style={{ color: "var(--bad)" }}>{err}</span>
                  : loading ? <span style={{ color: "var(--fg-dim)" }}>…</span>
                  : a}
              </div>
              <div className="lm-answer__foot">
                Not a sales bot. Want a real human? <a href="#contact" style={{ color: "var(--accent-2)" }}>Connect with us →</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { LLMAskSection });
