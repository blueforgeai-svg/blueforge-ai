// Symbols (PI Vision), AI/ML, Custom Software, Process, Cases, Contact, Footer
const { useState: useStS2 } = React;

function SymbolsSection({ motion }) {
  const symbols = [
    { name: "Vessel · Level", kind: "vessel" },
    { name: "Pump · Status", kind: "pump" },
    { name: "Valve · Flow", kind: "valve" },
    { name: "Motor · Vibration", kind: "motor" },
    { name: "Heat Exchanger", kind: "hx" },
    { name: "Mini Trend", kind: "trend" },
    { name: "Alarm Tile", kind: "alarm" },
    { name: "Batch Phase", kind: "batch" },
  ];
  return (
    <section className="section" id="symbols" data-screen-label="06 PI Vision Symbols">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">PI Vision · Custom symbols</div>
            <h2 style={{ marginTop: 14 }}>Operator graphics<br /><span style={{ color: "var(--fg-mute)" }}>that read like instinct.</span></h2>
          </div>
          <p className="lead">
            Stock symbols rarely match the way your operators actually think about an asset. We design and build a custom symbol library — bound to your AF model — so screens scan in two seconds, not twenty.
          </p>
        </div>
        <div className="symbol-grid">
          {symbols.map((s, i) => (
            <div key={s.name} className="symbol-tile">
              <SymbolGraphic kind={s.kind} motion={motion} i={i} />
              <div className="symbol-tile__label">{s.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SymbolGraphic({ kind, motion, i }) {
  const [t, setT] = useStS2(0);
  useAnimationFrame((time) => setT(time * 0.001 * motion));
  const blink = (Math.sin(t * 1.6 + i) + 1) / 2;
  const fill = i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#06b6d4" : "#a78bfa";
  switch (kind) {
    case "vessel": {
      const level = 0.4 + 0.3 * ((Math.sin(t * 0.5) + 1) / 2);
      return (
        <svg width="100" height="120" viewBox="0 0 100 120">
          <rect x="20" y="10" width="60" height="100" rx="4" fill="rgba(10,22,40,0.9)" stroke="rgba(226,232,240,0.4)" />
          <rect x="22" y={12 + (1 - level) * 96} width="56" height={level * 96} fill={fill} fillOpacity="0.3" />
          <rect x="22" y={12 + (1 - level) * 96} width="56" height="2" fill={fill} />
          <text x="50" y="65" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--fg)">{(level * 100).toFixed(0)}%</text>
          <text x="50" y="80" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--fg-dim)" letterSpacing="1">TK-101</text>
        </svg>
      );
    }
    case "pump":
      return (
        <svg width="110" height="100" viewBox="0 0 110 100">
          <circle cx="55" cy="50" r="32" fill="rgba(10,22,40,0.9)" stroke="rgba(226,232,240,0.4)" />
          <g transform="translate(55 50)">
            <g style={{ transformOrigin: "0 0", animation: `spin ${2 / motion}s linear infinite` }}>
              <path d="M -22 0 L 22 0 M 0 -22 L 0 22" stroke={fill} strokeWidth="3" strokeLinecap="round" />
              <circle r="6" fill={fill} />
            </g>
          </g>
          <text x="55" y="92" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill={fill} letterSpacing="1">RUN · {Math.round(1750 + blink * 20)}rpm</text>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </svg>
      );
    case "valve":
      return (
        <svg width="120" height="80" viewBox="0 0 120 80">
          <line x1="0" y1="40" x2="40" y2="40" stroke={fill} strokeWidth="3" />
          <line x1="80" y1="40" x2="120" y2="40" stroke={fill} strokeWidth="3" />
          <path d="M 40 25 L 80 55 L 80 25 L 40 55 Z" fill="rgba(10,22,40,0.9)" stroke={fill} strokeWidth="1.5" />
          <line x1="60" y1="20" x2="60" y2="5" stroke="rgba(226,232,240,0.5)" strokeWidth="2" />
          <circle cx="60" cy="5" r="3" fill={fill} />
          <text x="60" y="76" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-mute)">OPEN · 78%</text>
        </svg>
      );
    case "motor":
      return (
        <svg width="120" height="100" viewBox="0 0 120 100">
          <rect x="14" y="30" width="60" height="40" rx="3" fill="rgba(10,22,40,0.9)" stroke="rgba(226,232,240,0.4)" />
          <line x1="74" y1="50" x2="100" y2="50" stroke="rgba(226,232,240,0.4)" strokeWidth="3" />
          <circle cx="106" cy="50" r="6" fill="rgba(10,22,40,0.9)" stroke="rgba(226,232,240,0.4)" />
          <text x="44" y="55" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill={fill} letterSpacing="2">M</text>
          <g transform="translate(14 78)">
            {[...Array(12)].map((_, k) => {
              const h = 4 + Math.abs(Math.sin(t * 2 + k * 0.5 + i)) * 14;
              return <rect key={k} x={k * 5} y={-h} width="3" height={h} fill={fill} opacity="0.7" />;
            })}
          </g>
        </svg>
      );
    case "hx":
      return (
        <svg width="120" height="80" viewBox="0 0 120 80">
          <rect x="10" y="20" width="100" height="40" rx="3" fill="rgba(10,22,40,0.9)" stroke="rgba(226,232,240,0.4)" />
          <path d="M 15 30 Q 30 30 30 40 Q 30 50 45 50 Q 60 50 60 40 Q 60 30 75 30 Q 90 30 90 40 Q 90 50 105 50" fill="none" stroke={fill} strokeWidth="1.5" />
          <text x="60" y="74" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-mute)">ΔT 42°C</text>
        </svg>
      );
    case "trend":
      return (
        <div style={{ width: 130, height: 80 }}>
          <Sparkline width={130} height={70} color={fill} seed={i + 11} motion={motion} />
        </div>
      );
    case "alarm":
      return (
        <svg width="120" height="100" viewBox="0 0 120 100">
          <rect x="10" y="15" width="100" height="60" rx="3" fill="rgba(10,22,40,0.9)" stroke={fill} strokeOpacity={0.4 + blink * 0.5} />
          <circle cx="22" cy="32" r="4" fill={fill} opacity={0.3 + blink * 0.7} />
          <text x="34" y="35" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg)">VIB-07 HIGH</text>
          <text x="22" y="52" fontFamily="var(--font-mono)" fontSize="8" fill="var(--fg-dim)">P-204 · 2m</text>
          <text x="22" y="65" fontFamily="var(--font-mono)" fontSize="8" fill="var(--fg-mute)">ACK · SNOOZE</text>
        </svg>
      );
    case "batch":
      return (
        <svg width="140" height="80" viewBox="0 0 140 80">
          {["CHARGE","HEAT","REACT","COOL","DROP"].map((step, k) => (
            <g key={k} transform={`translate(${k * 28}, 20)`}>
              <rect width="24" height="20" rx="2" fill={k <= 2 ? fill : "rgba(255,255,255,0.06)"} fillOpacity={k === 2 ? 0.9 : k < 2 ? 0.5 : 1} stroke="rgba(255,255,255,0.1)" />
              <text x="12" y="13" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill={k <= 2 ? "#fff" : "var(--fg-dim)"}>{step}</text>
            </g>
          ))}
          <text x="70" y="62" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill={fill}>BATCH B-2206 · REACT</text>
        </svg>
      );
    default:
      return null;
  }
}

function AISection({ motion }) {
  return (
    <section className="section" id="ai" data-screen-label="07 AI / ML">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">AI / ML model creation</div>
            <h2 style={{ marginTop: 14 }}>Models that earn<br /><span className="gradient-text">their place on the line.</span></h2>
          </div>
          <p className="lead">
            We don't ship demos. Every model we deploy has a clear operator action behind it, a feedback loop into the historian, and a way to be turned off when the process changes. That's the difference between an ML pilot and a working soft sensor.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 32 }} className="ai-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { title: "Anomaly Detection", body: "Unsupervised models tuned per asset class. Catch bearing wear, sensor drift, and process upsets weeks before they're audible." },
              { title: "Soft Sensors", body: "Replace lab assays with virtual sensors. Real-time predictions for composition, density, viscosity — backed by automated retraining." },
              { title: "Forecasting", body: "Demand, throughput, and emissions forecasts wired into your scheduler. Confidence intervals included, not hidden." },
              { title: "Closed-loop optimization", body: "Bayesian and RL controllers tuned offline, deployed with hard guardrails. Auditable, reversible, and explainable." },
            ].map((m) => (
              <div key={m.title} className="card" style={{ padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <h4>{m.title}</h4>
                  <span className="chip"><span className="dot--ok" style={{ width: 6, height: 6, borderRadius: "50%" }} /> deployed</span>
                </div>
                <p style={{ margin: "10px 0 0", fontSize: 14 }}>{m.body}</p>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="tag">MODEL · LIVE</span>
              <span className="live"><span className="dot" /> retraining nightly</span>
            </div>
            <h3>RX-301 yield predictor</h3>
            <div style={{ height: 180 }}><AreaChart motion={motion} seed={9} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "16px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
              <Gauge value={0.91} label="Accuracy" unit="%" size={120} motion={motion} />
              <Gauge value={0.66} label="Coverage" unit="%" size={120} motion={motion} color="var(--accent-2)" />
            </div>
            <div className="snippet">
              <div><span className="com"># predict next-hour yield, write back to PI</span></div>
              <div><span className="kw">def</span> predict(<span>tags</span>):</div>
              <div>&nbsp;&nbsp;x = features.<span className="kw">load</span>(<span className="str">"rx-301"</span>)</div>
              <div>&nbsp;&nbsp;<span className="kw">return</span> model.predict(x).clip(0, 1)</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SoftwareSection({ motion }) {
  return (
    <section className="section" id="software" data-screen-label="08 Custom Software">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Custom software</div>
            <h2 style={{ marginTop: 14 }}>The glue layer<br /><span style={{ color: "var(--fg-mute)" }}>between systems and people.</span></h2>
          </div>
          <p className="lead">
            Most operational pain isn't in the historian — it's in the gap between systems. We build the APIs, internal apps and integrations that make your data fabric feel like one product.
          </p>
        </div>
        <div className="tile-grid">
          {[
            { tag: "INTEGRATIONS", title: "API gateways", body: "OPC UA bridges, REST/GraphQL APIs over PI, Canary, TDengine. RBAC, audit logs, SSO out of the box." },
            { tag: "INTERNAL TOOLS", title: "Operator apps", body: "Tablet-first apps for rounds, log books, deviation handling. Offline-capable, syncs to the historian." },
            { tag: "REPORTING", title: "Compliance reporting", body: "Regulatory exports (EPA, EU ETS, FDA 21 CFR Part 11) generated from the historian on a schedule." },
            { tag: "PORTALS", title: "Site & enterprise portals", body: "Multi-site rollups, KPI cascades, and benchmarking dashboards that survive an org chart change." },
          ].map((s) => (
            <div key={s.title} className="tile card" style={{ gridColumn: "span 6" }}>
              <span className="tag">{s.tag}</span>
              <h3 style={{ marginTop: 12, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection({ motion }) {
  const steps = [
    { num: "01", title: "Discover", body: "Two-week embed with your ops and IT teams. We map every data source, every owner, every pain.", deliverable: "Data-source register · stakeholder map · risk log" },
    { num: "02", title: "Architect", body: "Reference architecture that fits your existing OT/IT split. Historian choice, asset model, integration patterns.", deliverable: "Architecture doc · scoring matrix · pilot plan" },
    { num: "03", title: "Pilot", body: "One unit, one historian, one set of dashboards. End-to-end, production-grade, in 8–12 weeks.", deliverable: "Live pilot · operator training · success metrics" },
    { num: "04", title: "Scale", body: "Templated rollout to remaining units and sites. We hand over with documentation your team can actually maintain.", deliverable: "Rollout playbook · runbooks · trained engineers" },
    { num: "05", title: "Operate", body: "Optional managed-service tier — we keep the historian healthy, models retrained, and dashboards loved.", deliverable: "SLAs · on-call · quarterly business reviews" },
  ];
  return (
    <section className="section" id="process" data-screen-label="09 Process">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">How we work</div>
            <h2 style={{ marginTop: 14 }}>Five phases.<br /><span style={{ color: "var(--fg-mute)" }}>No mystery between them.</span></h2>
          </div>
          <p className="lead">
            Every engagement runs the same playbook. We're explicit about deliverables, hand-offs, and exit ramps — because operational technology is too important to be a black box.
          </p>
        </div>
        <div>
          {steps.map((s) => (
            <div key={s.num} className="process-step">
              <div className="process-num">{s.num}</div>
              <div>
                <div className="process-title">{s.title}</div>
                <p style={{ marginTop: 6 }}>{s.body}</p>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 11, color: "var(--fg-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Deliverable</div>
                <div className="mono" style={{ fontSize: 13, color: "var(--fg-mute)", lineHeight: 1.6 }}>{s.deliverable}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function ContactSection() {
  return (
    <section className="section" id="contact" data-screen-label="11 Contact">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }} className="contact-grid">
          <div>
            <div className="eyebrow">Connect with us</div>
            <h2 style={{ marginTop: 14 }}>Tell us about your plant.</h2>
            <p className="lead" style={{ marginTop: 18 }}>
              Drop us a line about your historian, your team, and what's keeping the control room up at night. Your message lands directly in our inbox at <span className="mono" style={{ color: "var(--accent-2)" }}>info@blueforgeai.com</span> — we reply within two business days with a scoped plan, or honest reasons we're not the right fit.
            </p>
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="mono" style={{ fontSize: 13, color: "var(--fg-mute)" }}>
                <span style={{ color: "var(--fg-dim)" }}>email&nbsp;&nbsp;</span>
                info@blueforgeai.com
              </div>
              <div className="mono" style={{ fontSize: 13, color: "var(--fg-mute)" }}>
                <span style={{ color: "var(--fg-dim)" }}>reply&nbsp;</span>
                within two business days
              </div>
              <div className="mono" style={{ fontSize: 13, color: "var(--fg-mute)" }}>
                <span style={{ color: "var(--fg-dim)" }}>scope&nbsp;</span>
                pilot to enterprise rollout
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

// To wire this form to an automated delivery service, replace FORM_ENDPOINT with a real URL.
// Drop-in options (no backend code needed):
//   Formspree  — https://formspree.io/f/YOUR_ID
//   Web3Forms  — https://api.web3forms.com/submit  (add hidden access_key input)
//   Netlify    — if hosted on Netlify, add `data-netlify="true"` to <form>
// Until then, the form opens the visitor's email client with the message pre-filled.
const FORM_ENDPOINT = ""; // e.g. "https://formspree.io/f/xxxxxxxx"

function ContactForm() {
  const [state, setState] = useStS2({ name: "", email: "", company: "", historian: "AVEVA PI", scope: [], message: "", website: "" /* honeypot */ });
  const [sent, setSent] = useStS2(false);
  const [sending, setSending] = useStS2(false);
  const [err, setErr] = useStS2("");
  const formLoadedAt = React.useRef(Date.now());
  const toggle = (k) => setState((s) => ({ ...s, scope: s.scope.includes(k) ? s.scope.filter((x) => x !== k) : [...s.scope, k] }));
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    // Anti-spam: honeypot must stay empty; submission < 2s = bot
    if (state.website) { setSent(true); return; }
    if (Date.now() - formLoadedAt.current < 2000) {
      setErr("Please take a moment to fill the form, then try again.");
      return;
    }
    if (FORM_ENDPOINT) {
      setSending(true);
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...state, scope: state.scope.join(", "), _subject: `New inquiry from ${state.name} · ${state.company}` }),
        });
        if (!res.ok) throw new Error("send-failed");
        setSent(true);
      } catch (_) {
        setErr("We couldn't deliver the message. Please email info@blueforgeai.com directly — we'll reply within two business days.");
      }
      setSending(false);
      return;
    }
    const body = `Name: ${state.name}\nWork email: ${state.email}\nCompany / site: ${state.company}\nPrimary historian: ${state.historian}\nScope of interest: ${state.scope.join(", ") || "—"}\n\nMessage:\n${state.message}`;
    const subject = `New inquiry from ${state.name || "website"}${state.company ? " · " + state.company : ""}`;
    window.location.href = `mailto:info@blueforgeai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  if (sent) return (
    <div className="card" style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, minHeight: 380 }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="28" height="28" viewBox="0 0 24 24"><path d="M5 12 L10 17 L20 7" fill="none" stroke="var(--ok)" strokeWidth="2" strokeLinecap="round" /></svg>
      </div>
      <h3>Message ready to send</h3>
      <p style={{ textAlign: "center", maxWidth: 340 }}>Your email client should have opened with the details pre-filled. If it didn't, write to us directly at <span className="mono" style={{ color: "var(--accent-2)" }}>info@blueforgeai.com</span>. We reply within two business days.</p>
    </div>
  );
  return (
    <form className="card" onSubmit={submit} style={{ padding: 28 }} noValidate>
      {/* Honeypot field - bots fill it, humans never see it */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>Website (leave blank)<input type="text" tabIndex={-1} autoComplete="off" value={state.website} onChange={(e) => setState({ ...state, website: e.target.value })} /></label>
      </div>
      <div className="form">
        <div className="field"><label>Name</label><input value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} required /></div>
        <div className="field"><label>Work email</label><input type="email" value={state.email} onChange={(e) => setState({ ...state, email: e.target.value })} required /></div>
        <div className="field field--full"><label>Company / site</label><input value={state.company} onChange={(e) => setState({ ...state, company: e.target.value })} /></div>
        <div className="field field--full">
          <label>Primary historian</label>
          <select value={state.historian} onChange={(e) => setState({ ...state, historian: e.target.value })}>
            <option>AVEVA PI</option><option>Canary Historian</option><option>TDengine</option><option>InfluxDB / Timescale</option><option>None yet</option>
          </select>
        </div>
        <div className="field field--full">
          <label>Scope of interest</label>
          <div className="chips">
            {["Digitalization","Dashboards","PI Vision symbols","AI / ML","Custom software"].map((k) => (
              <button type="button" key={k} className="chip" onClick={() => toggle(k)}
                style={{ borderColor: state.scope.includes(k) ? "var(--accent)" : "var(--line)", color: state.scope.includes(k) ? "var(--fg)" : "var(--fg-mute)", background: state.scope.includes(k) ? "rgba(59,130,246,0.12)" : "transparent" }}>
                {state.scope.includes(k) ? "✓ " : "+ "}{k}
              </button>
            ))}
          </div>
        </div>
        <div className="field field--full"><label>What's the situation?</label><textarea value={state.message} onChange={(e) => setState({ ...state, message: e.target.value })} placeholder="A few lines about your stack and what you'd like to change…" /></div>
        <div className="field field--full">
          <button type="submit" disabled={sending} className="btn btn--primary" style={{ width: "100%", justifyContent: "center", padding: "16px", opacity: sending ? 0.6 : 1 }}>
            {sending ? "Sending…" : "Send message"} <span className="arrow">→</span>
          </button>
          {err && <p role="alert" style={{ marginTop: 12, fontSize: 13, color: "var(--bad, #ef4444)" }}>{err}</p>}
        </div>
      </div>
    </form>
  );
}

function Footer() {
  return (
    <footer className="footer" data-screen-label="12 Footer">
      <div className="footer-grid">
        <div>
          <div className="logo" style={{ marginBottom: 12 }}>
            <div className="logo-mark">
              <svg viewBox="0 0 40 40" role="img" aria-labelledby="footLogoTitle"><title id="footLogoTitle">Blueforge AI</title>
                <defs>
                  <linearGradient id="footG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <path d="M 9 6 L 9 34" stroke="url(#footG)" strokeWidth="3" strokeLinecap="round" />
                <path d="M 9 6 L 21 6 Q 30 6 30 13 Q 30 20 21 20 L 9 20" fill="none" stroke="url(#footG)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                <path d="M 9 20 L 22 20 Q 32 20 32 27 Q 32 34 22 34 L 9 34" fill="none" stroke="url(#footG)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                <circle cx="33" cy="7" r="2.5" fill="#06b6d4" />
              </svg>
            </div>
            <span>BLUEFORGE<span style={{ color: "var(--accent-2)", marginLeft: 4 }}>AI</span></span>
          </div>
          <p style={{ fontSize: 12, color: "var(--fg-dim)", maxWidth: 360, lineHeight: 1.6 }}>
            Industrial data intelligence for plants that take their operations seriously.
          </p>
        </div>
        <div>
          <h5>Services</h5>
          <ul><li><a href="#services">Plant digitalization</a></li><li><a href="#dashboards">Grafana</a></li><li><a href="#symbols">PI Vision</a></li><li><a href="#ai">AI / ML</a></li><li><a href="#software">Custom software</a></li></ul>
        </div>
        <div>
          <h5>Company</h5>
          <ul><li><a href="#process">Process</a></li><li><a href="#cases">Case studies</a></li><li><a href="#contact">Contact</a></li><li><a href="#">Careers</a></li></ul>
        </div>
        <div>
          <h5>Contact</h5>
          <ul>
            <li><a href="mailto:info@blueforgeai.com">info@blueforgeai.com</a></li>
            <li><a href="#contact">Project inquiry</a></li>
            <li><a href="#ask">Ask an LLM</a></li>
          </ul>
        </div>
      </div>
      <div style={{ maxWidth: "var(--maxw)", margin: "40px auto 0", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 20, color: "var(--fg-dim)", flexWrap: "wrap", gap: 12 }}>
        <span>© 2026 Blueforge AI · All rights reserved</span>
        <span style={{ display: "flex", gap: 20 }}>
          <a href="/privacy.html" style={{ color: "var(--fg-mute)", textDecoration: "none" }}>Privacy</a>
          <a href="mailto:info@blueforgeai.com" style={{ color: "var(--fg-mute)", textDecoration: "none" }}>info@blueforgeai.com</a>
        </span>
      </div>
    </footer>
  );
}

Object.assign(window, { SymbolsSection, AISection, SoftwareSection, ProcessSection, ContactSection, Footer });
