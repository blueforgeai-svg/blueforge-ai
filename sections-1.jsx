// Top-level sections: hero, services, plant-digi, grafana, pi-vision, ai/ml, custom-sw, process, cases, contact, footer
const { useEffect: useEffSec, useState: useStSec, useRef: useRefSec } = React;

function Nav() {
  return (
    <nav className="nav" data-screen-label="00 Nav" aria-label="Primary">
      <div className="logo">
        <div className="logo-mark">
          <svg viewBox="0 0 40 40" role="img" aria-labelledby="navLogoTitle">
            <title id="navLogoTitle">Blueforge AI</title>
            <defs>
              <linearGradient id="logoG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <path d="M 9 6 L 9 34" stroke="url(#logoG)" strokeWidth="3" strokeLinecap="round" />
            <path d="M 9 6 L 21 6 Q 30 6 30 13 Q 30 20 21 20 L 9 20" fill="none" stroke="url(#logoG)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M 9 20 L 22 20 Q 32 20 32 27 Q 32 34 22 34 L 9 34" fill="none" stroke="url(#logoG)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx="33" cy="7" r="2.5" fill="#06b6d4" />
          </svg>
        </div>
        <span>BLUEFORGE<span style={{ color: "var(--accent-2)", marginLeft: 4 }}>AI</span></span>
      </div>
      <div className="nav-links">
        <a href="#services">Services</a>
        <a href="#journey">Journey</a>
        <a href="#dashboards">Dashboards</a>
        <a href="#ai">AI / ML</a>
        <a href="#process">Process</a>
        <a href="#contact">Contact</a>
      </div>
      <a href="#contact" className="btn btn--primary" style={{ padding: "10px 16px" }}>
        Connect with us <span className="arrow">→</span>
      </a>
    </nav>
  );
}

function Hero({ motion }) {
  return (
    <section className="hero" id="hero" data-screen-label="01 Hero">
      <div className="bg-grid" />
      <div className="bg-vignette" />
      <div className="hero__bg">
        <PlantSchematic motion={motion} />
      </div>
      <div className="hero__inner">
        <div>
          <div className="eyebrow">Industrial Data Intelligence</div>
          <h1 style={{ marginTop: 20 }}>
            Your plant is talking.<br />
            <span className="gradient-text">We make it impossible to ignore.</span>
          </h1>
          <p className="lead" style={{ marginTop: 26 }}>
            Historians, dashboards, custom symbols, AI/ML — the operational data layer that turns telemetry into decisions, not noise. Built on AVEVA PI, Canary and TDengine. Deployed in 8 weeks.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <a href="#contact" className="btn btn--primary">Start your pilot <span className="arrow">→</span></a>
            <a href="#journey" className="btn">See how it flows</a>
          </div>
        </div>

      </div>
    </section>
  );
}

function LogoMarquee() {
  const items = ["AVEVA PI", "CANARY HISTORIAN", "TDENGINE", "GRAFANA", "PI VISION", "OPC UA", "MQTT", "INFLUXDB", "TIMESCALEDB", "MODBUS"];
  const doubled = [...items, ...items];
  return (
    <section className="section section--sm" style={{ padding: "40px var(--gutter)" }} data-screen-label="01b Logo Strip">
      <div className="container">
        <div className="mono" style={{ fontSize: 11, color: "var(--fg-dim)", letterSpacing: "0.2em", marginBottom: 18 }}>
          STACK · INTEGRATIONS · ECOSYSTEMS
        </div>
        <div className="marquee">
          <div className="marquee__track">
            {doubled.map((x, i) => (
              <div key={i} className="logo-strip__item">
                <span style={{ width: 6, height: 6, background: "var(--accent-2)", borderRadius: "50%", boxShadow: "0 0 6px var(--accent-2)" }} />
                {x}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Services({ motion }) {
  const services = [
    { tag: "DIGITALIZATION", title: "Plant digitalization", body: "End-to-end programs to instrument, model and integrate your asset base.", icon: "tank" },
    { tag: "HISTORIANS", title: "AVEVA PI · Canary · TDengine", body: "Architect, deploy and tune the historian that fits your scale and budget.", icon: "stack" },
    { tag: "DASHBOARDS", title: "Grafana dashboards", body: "Operational panels for the floor, the control room, and the C-suite.", icon: "chart" },
    { tag: "VISUALIZATION", title: "PI Vision custom symbols", body: "Bespoke operator graphics that match the way your engineers think.", icon: "symbol" },
    { tag: "SOFTWARE", title: "Custom software", body: "APIs, micro-frontends, internal tools — built around your operational stack.", icon: "code" },
    { tag: "AI / ML", title: "AI & ML models", body: "Anomaly detection, soft sensors, forecast and yield optimization.", icon: "brain" },
  ];
  return (
    <section className="section" id="services" data-screen-label="02 Services">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">What we do</div>
            <h2 style={{ marginTop: 14 }}>Six disciplines.<br /><span style={{ color: "var(--fg-mute)" }}>One data fabric.</span></h2>
          </div>
          <p className="lead">
            We sit between your control systems and your decision-makers. Whether you need a single dashboard or an enterprise-wide rollout, every engagement plugs into the same operational backbone.
          </p>
        </div>
        <div className="tile-grid">
          {services.map((s, i) => (
            <div key={s.title} className={"tile card " + (i === 0 || i === 5 ? "tile--lg" : i === 1 || i === 4 ? "tile--sm" : "")}>
              <span className="plus" style={{ top: 8, left: 8 }} />
              <span className="plus" style={{ top: 8, right: 8 }} />
              <span className="plus" style={{ bottom: 8, left: 8 }} />
              <span className="plus" style={{ bottom: 8, right: 8 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 18 }}>
                <span className="tag">{s.tag}</span>
                <ServiceIcon kind={s.icon} />
              </div>
              <h3 style={{ marginBottom: 10 }}>{s.title}</h3>
              <p style={{ margin: 0 }}>{s.body}</p>
              <div style={{ marginTop: 22, paddingTop: 14, borderTop: "1px dashed var(--line)" }}>
                <Sparkline width={300} height={50} seed={i + 1} motion={motion} color={i % 2 ? "var(--accent-2)" : "var(--accent)"} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceIcon({ kind }) {
  const stroke = "var(--accent-2)";
  switch (kind) {
    case "tank":
      return <svg width="28" height="28" viewBox="0 0 28 28"><rect x="6" y="4" width="16" height="20" rx="2" fill="none" stroke={stroke} /><line x1="6" y1="14" x2="22" y2="14" stroke={stroke} /></svg>;
    case "stack":
      return <svg width="28" height="28" viewBox="0 0 28 28"><ellipse cx="14" cy="6" rx="9" ry="3" fill="none" stroke={stroke} /><path d="M5 6 v6 a9 3 0 0 0 18 0 v-6" fill="none" stroke={stroke} /><path d="M5 12 v6 a9 3 0 0 0 18 0 v-6" fill="none" stroke={stroke} /></svg>;
    case "chart":
      return <svg width="28" height="28" viewBox="0 0 28 28"><path d="M4 20 L10 12 L15 17 L24 6" fill="none" stroke={stroke} strokeWidth="1.5" /><circle cx="24" cy="6" r="2" fill={stroke} /></svg>;
    case "symbol":
      return <svg width="28" height="28" viewBox="0 0 28 28"><rect x="4" y="4" width="20" height="20" fill="none" stroke={stroke} /><circle cx="14" cy="14" r="5" fill="none" stroke={stroke} /><line x1="4" y1="14" x2="9" y2="14" stroke={stroke} /><line x1="19" y1="14" x2="24" y2="14" stroke={stroke} /></svg>;
    case "code":
      return <svg width="28" height="28" viewBox="0 0 28 28"><path d="M10 8 L4 14 L10 20 M18 8 L24 14 L18 20" fill="none" stroke={stroke} strokeWidth="1.5" /></svg>;
    case "brain":
      return <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="8" cy="8" r="2" fill={stroke} /><circle cx="20" cy="8" r="2" fill={stroke} /><circle cx="14" cy="14" r="2" fill={stroke} /><circle cx="8" cy="20" r="2" fill={stroke} /><circle cx="20" cy="20" r="2" fill={stroke} /><path d="M8 8 L14 14 L20 8 M8 20 L14 14 L20 20" stroke={stroke} fill="none" /></svg>;
    default:
      return null;
  }
}

function HistorianSection({ motion }) {
  return (
    <section className="section" id="historians" data-screen-label="04 Historians">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Plant digitalization</div>
            <h2 style={{ marginTop: 14 }}>Three historians.<br /><span style={{ color: "var(--fg-mute)" }}>One operating model.</span></h2>
          </div>
          <p className="lead">
            The historian choice is rarely just about storage — it's about asset modelling, contextualization, retention, cost, and how your team reasons about events. We've shipped production rollouts in all three.
          </p>
        </div>
        <div className="tile-grid">
          {[
            {
              tag: "AVEVA PI", title: "Enterprise PI System",
              body: "AF templates, event frames, asset analytics. We migrate from legacy tag-only PI to a fully contextualized asset model your engineers can reason about.",
              metrics: [["Tags managed", "8.4M"], ["AF templates", "240"], ["Event frames / day", "180K"]],
              color: "var(--accent)",
            },
            {
              tag: "CANARY", title: "Canary Historian",
              body: "Lean, file-based, blazing fast. Right-sized for mid-tier plants that need PI-class performance without the PI footprint.",
              metrics: [["Compression", "30:1"], ["Cold-query p95", "120ms"], ["Sites", "14"]],
              color: "var(--accent-2)",
            },
            {
              tag: "TDENGINE", title: "TDengine Cluster",
              body: "Cloud-native, open-source-friendly, scales horizontally. Our default when retention and analytics workload outweigh OT integration depth.",
              metrics: [["Ingest peak", "2.1M pts/s"], ["Retention", "10y"], ["Nodes", "12"]],
              color: "#a78bfa",
            },
          ].map((h) => (
            <div key={h.title} className="tile card" style={{ gridColumn: "span 4" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="tag" style={{ color: h.color }}>{h.tag}</span>
                <span className="live"><span className="dot" /> production</span>
              </div>
              <h3 style={{ marginTop: 16, marginBottom: 12 }}>{h.title}</h3>
              <p style={{ marginBottom: 22 }}>{h.body}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "16px 0", borderTop: "1px solid var(--line)" }}>
                {h.metrics.map(([k, v]) => (
                  <div key={k}>
                    <div className="mono" style={{ fontSize: 11, color: "var(--fg-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{k}</div>
                    <div className="mono" style={{ fontSize: 15, color: h.color, marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
              <Sparkline width={260} height={40} color={h.color} seed={h.title.length} motion={motion} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardSection({ motion }) {
  return (
    <section className="section" id="dashboards" data-screen-label="05 Dashboards">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Grafana dashboards</div>
            <h2 style={{ marginTop: 14 }}>Panels people<br /><span className="gradient-text">actually open.</span></h2>
          </div>
          <p className="lead">
            We design dashboards the way good editors design pages: one obvious thing per panel, one obvious decision per dashboard. The result is operations teams who reach for Grafana before they reach for the phone.
          </p>
        </div>
        <div style={{ marginBottom: 40 }}>
          <DashboardMock motion={motion} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="dashboard-points">
          {[
            ["Asset-aware", "Every panel knows what it's looking at — unit, line, batch — so drill-down works the way operators expect."],
            ["Role-tuned", "Plant manager rollups, engineer diagnostics, mobile field views. One source of truth, three reading levels."],
            ["Alert-ready", "Alarm streams wired to PagerDuty, Teams or your CMMS. Acks, snoozes, and post-mortems already considered."],
          ].map(([t, b]) => (
            <div key={t}>
              <h4 style={{ marginBottom: 8 }}>{t}</h4>
              <p style={{ margin: 0, fontSize: 14 }}>{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Nav, Hero, LogoMarquee, Services, HistorianSection, DashboardSection });
