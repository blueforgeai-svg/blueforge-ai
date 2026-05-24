// Scrollytelling spine: Sensor → Historian → Dashboard → Insight
const { useEffect: useEffSp, useState: useStSp, useRef: useRefSp } = React;

function useScrollProgress(ref) {
  const [p, setP] = useStSp(0);
  useEffSp(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const passed = Math.max(0, -rect.top);
      const prog = Math.max(0, Math.min(1, passed / total));
      setP(prog);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  return p;
}

function ScrollySpine({ motion = 1 }) {
  const wrap = useRefSp(null);
  const p = useScrollProgress(wrap);
  // 4 steps mapped 0-1
  const step = Math.min(3, Math.floor(p * 4));
  const stepP = (p * 4) % 1;

  const steps = [
    {
      key: "sensor",
      tag: "STAGE 01 · ACQUIRE",
      title: "It starts at the sensor.",
      body: "Pressure, temperature, vibration, flow. Thousands of tags pulsing every second on the plant floor. We meet your signals where they live — PLCs, DCS, OPC UA, MQTT, Modbus — and bring them into a single pipeline.",
      kpis: [["Tags / second", "120K"], ["Protocols", "14+"], ["Latency", "<50ms"]],
    },
    {
      key: "historian",
      tag: "STAGE 02 · STORE",
      title: "Then the historian remembers.",
      body: "AVEVA PI, Canary, TDengine — pick the engine that fits your scale, retention and cost profile. We model the asset hierarchy, tune compression, and design retention policies that hold up under audit.",
      kpis: [["Retention", "10y"], ["Compression", "30:1"], ["Uptime", "99.99%"]],
    },
    {
      key: "dashboard",
      tag: "STAGE 03 · SEE",
      title: "Then the dashboard speaks.",
      body: "Grafana, PI Vision, custom symbols built for your operators. Roll-ups for plant managers, drill-downs for engineers, mobile views for the field. Every panel grounded in your real asset model.",
      kpis: [["Dashboards", "200+"], ["Custom symbols", "60+"], ["Roles", "8"]],
    },
    {
      key: "insight",
      tag: "STAGE 04 · DECIDE",
      title: "Then insight takes shape.",
      body: "ML models for anomaly detection, soft sensors, energy and yield optimization. Deployed where they matter: in the control room, in the historian, in the inbox of the people who can act on them.",
      kpis: [["Models live", "40+"], ["Yield gain", "+4.2%"], ["Energy saved", "12%"]],
    },
  ];

  return (
    <section className="scrolly" ref={wrap} style={{ minHeight: "500vh" }} data-screen-label="03 Scrollytelling Spine">
      <div className="scrolly__stage">
        <SpineStage step={step} stepP={stepP} motion={motion} />
      </div>
      <div className="scrolly__overlay">
        {steps.map((s, i) => (
          <div key={s.key} className="scrolly__step">
            <div className="step-card" style={{ opacity: step === i ? 1 : 0.18, transition: "opacity 0.5s" }}>
              <div className="step-pill">{s.tag}</div>
              <h2 style={{ fontSize: "clamp(28px, 3.4vw, 44px)", margin: "16px 0 12px" }}>{s.title}</h2>
              <p>{s.body}</p>
              <div style={{ display: "flex", gap: 24, marginTop: 18, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                {s.kpis.map(([k, v]) => (
                  <div key={k} className="kpi" style={{ gap: 2 }}>
                    <div className="kpi-value" style={{ fontSize: 22 }}>{v}</div>
                    <div className="kpi-label">{k}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SpineStage({ step, stepP, motion }) {
  const stages = [
    <StageSensor motion={motion} />,
    <StageHistorian motion={motion} />,
    <StageDashboard motion={motion} />,
    <StageInsight motion={motion} />,
  ];
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 var(--gutter)" }}>
      <div style={{ width: "min(720px, 56%)", aspectRatio: "1 / 1", position: "relative" }}>
        {stages.map((el, i) => (
          <div key={i} style={{
            position: "absolute", inset: 0,
            opacity: i === step ? 1 : 0,
            transition: "opacity 0.6s ease",
            pointerEvents: i === step ? "auto" : "none",
          }}>
            {el}
          </div>
        ))}
      </div>
      <SpineProgress step={step} stepP={stepP} />
    </div>
  );
}

function SpineProgress({ step, stepP }) {
  const labels = ["SENSOR", "HISTORIAN", "DASHBOARD", "INSIGHT"];
  return (
    <div style={{ position: "absolute", left: "var(--gutter)", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 22 }}>
      {labels.map((l, i) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 1, background: i <= step ? "var(--accent)" : "var(--line-strong)",
            transition: "background 0.5s",
          }} />
          <span className="mono" style={{
            fontSize: 11, letterSpacing: "0.18em",
            color: i === step ? "var(--fg)" : "var(--fg-dim)",
            transition: "color 0.5s",
          }}>{String(i + 1).padStart(2, "0")} {l}</span>
        </div>
      ))}
    </div>
  );
}

function StageSensor({ motion }) {
  const [t, setT] = useStSp(0);
  useAnimationFrame((time) => setT(time * 0.001 * motion));
  // Field of sensor points
  const pts = [];
  const grid = 8;
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      pts.push({ x: i / (grid - 1), y: j / (grid - 1), seed: i * 7 + j * 13 });
    }
  }
  return (
    <svg viewBox="0 0 600 600" width="100%" height="100%">
      <defs>
        <radialGradient id="sensGlow">
          <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {pts.map((p) => {
        const active = (Math.sin(t * 0.8 + p.seed) + 1) / 2;
        const r = 2 + active * 6;
        return (
          <g key={p.seed} transform={`translate(${60 + p.x * 480}, ${60 + p.y * 480})`}>
            <circle r={r * 3} fill="url(#sensGlow)" opacity={active * 0.5} />
            <circle r="2" fill="var(--accent-2)" opacity={0.3 + active * 0.7} />
          </g>
        );
      })}
      {/* center label */}
      <g transform="translate(300, 300)">
        <circle r="60" fill="none" stroke="rgba(6,182,212,0.2)" strokeDasharray="3 6">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite" />
        </circle>
        <text textAnchor="middle" y="-8" fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg-mute)" letterSpacing="2">SIGNALS</text>
        <text textAnchor="middle" y="16" fontFamily="var(--font-display)" fontSize="28" fill="var(--fg)" fontWeight="300"><tspan>120K/s</tspan></text>
      </g>
    </svg>
  );
}

function StageHistorian({ motion }) {
  const [t, setT] = useStSp(0);
  useAnimationFrame((time) => setT(time * 0.001 * motion));
  // Stacked tape-like layers
  return (
    <svg viewBox="0 0 600 600" width="100%" height="100%">
      <defs>
        <linearGradient id="tapeG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[...Array(14)].map((_, i) => {
        const y = 80 + i * 32;
        const offset = (t * 40 + i * 17) % 60;
        const opacity = 0.15 + (i % 4) * 0.15;
        return (
          <g key={i}>
            <line x1="60" y1={y} x2="540" y2={y} stroke="rgba(226,232,240,0.08)" strokeDasharray="2 4" />
            <rect x={60 + offset} y={y - 1} width="120" height="2" fill="url(#tapeG)" opacity={opacity} />
            <rect x={300 - offset / 2} y={y - 1} width="80" height="2" fill="url(#tapeG)" opacity={opacity} />
            <circle cx={60 + (i * 33 + t * 30) % 480} cy={y} r="2" fill="var(--accent-2)" opacity="0.8" />
          </g>
        );
      })}
      <g transform="translate(300, 300)">
        <rect x="-90" y="-30" width="180" height="60" rx="3" fill="rgba(10,22,40,0.9)" stroke="var(--accent)" strokeOpacity="0.4" />
        <text textAnchor="middle" y="-8" fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg-mute)" letterSpacing="2">HISTORIAN</text>
        <text textAnchor="middle" y="14" fontFamily="var(--font-mono)" fontSize="13" fill="var(--accent-2)" letterSpacing="2">PI · CANARY · TDENGINE</text>
      </g>
    </svg>
  );
}

function StageDashboard({ motion }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 640 }}>
        <DashboardMock motion={motion} />
      </div>
    </div>
  );
}

function StageInsight({ motion }) {
  const [t, setT] = useStSp(0);
  useAnimationFrame((time) => setT(time * 0.001 * motion));
  return (
    <svg viewBox="0 0 600 600" width="100%" height="100%">
      <defs>
        <radialGradient id="brainG">
          <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Neural-like network: inputs left, hidden middle, outputs right */}
      {(() => {
        const lcols = [
          { x: 100, n: 6 },
          { x: 250, n: 8 },
          { x: 400, n: 8 },
          { x: 550, n: 3 },
        ];
        const nodes = lcols.flatMap((col, ci) => Array.from({ length: col.n }, (_, i) => ({
          x: col.x, y: 100 + i * (400 / (col.n - 1)), ci, i,
        })));
        const edges = [];
        for (let ci = 0; ci < lcols.length - 1; ci++) {
          const a = nodes.filter((n) => n.ci === ci);
          const b = nodes.filter((n) => n.ci === ci + 1);
          a.forEach((na, ai) => b.forEach((nb, bi) => edges.push({ na, nb, k: ai * 7 + bi * 3 + ci * 11 })));
        }
        return (
          <g>
            <circle cx="300" cy="300" r="220" fill="url(#brainG)" opacity="0.3" />
            {edges.map((e, i) => {
              const op = (Math.sin(t + e.k) + 1) / 2;
              return (
                <line key={i} x1={e.na.x} y1={e.na.y} x2={e.nb.x} y2={e.nb.y}
                  stroke="var(--accent)" strokeOpacity={op * 0.18} strokeWidth="0.5" />
              );
            })}
            {nodes.map((n, i) => {
              const fire = (Math.sin(t * 1.4 + i * 0.7) + 1) / 2;
              return (
                <g key={i}>
                  <circle cx={n.x} cy={n.y} r={3 + fire * 4} fill="var(--accent-2)" opacity={0.2} />
                  <circle cx={n.x} cy={n.y} r="2.5" fill="var(--accent-2)" />
                </g>
              );
            })}
            {/* Output labels */}
            {[
              { y: 100, label: "ANOMALY" },
              { y: 300, label: "FORECAST" },
              { y: 500, label: "OPTIMIZE" },
            ].map((o, i) => (
              <text key={i} x="568" y={o.y + 4} fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg-mute)" letterSpacing="1.5">{o.label}</text>
            ))}
          </g>
        );
      })()}
    </svg>
  );
}

Object.assign(window, { ScrollySpine });
