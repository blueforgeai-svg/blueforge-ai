// Dashboard mockup — Grafana-inspired (generic, not branded)
const { useState: useStateD } = React;

function DashboardMock({ motion = 1 }) {
  return (
    <div className="dash-mock">
      <div className="dash-mock__head">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
          </div>
          <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)", marginLeft: 8 }}>operations / unit-04-overview</span>
        </div>
        <div className="live"><span className="dot" /> LIVE · 1s</div>
      </div>
      <div className="dash-mock__grid">
        <div className="dash-panel dash-panel--wide">
          <div className="dash-panel__head">
            <span>Throughput · Last 1h</span>
            <span className="mono" style={{ color: "var(--accent-2)" }}><Ticker value={847.2} decimals={1} motion={motion} /> t/h</span>
          </div>
          <AreaChart motion={motion} seed={3} />
        </div>
        <div className="dash-panel">
          <div className="dash-panel__head"><span>Reactor Temp</span><span className="mono" style={{ color: "var(--accent)" }}>OK</span></div>
          <Gauge value={0.78} label="" unit="°C" size={120} motion={motion} />
        </div>
        <div className="dash-panel">
          <div className="dash-panel__head"><span>Pump Vibration</span><span className="mono" style={{ color: "var(--warn,#f59e0b)" }}>WATCH</span></div>
          <Sparkline width={240} height={70} color="#f59e0b" seed={7} motion={motion} />
        </div>
        <div className="dash-panel">
          <div className="dash-panel__head"><span>Energy kWh</span><span className="mono" style={{ color: "var(--fg-mute)" }}>24h</span></div>
          <Bars data={[40,60,52,80,75,90,72,84,68,76,82,90]} motion={motion} />
        </div>
        <div className="dash-panel">
          <div className="dash-panel__head"><span>OEE</span><span className="mono" style={{ color: "var(--accent-2)" }}><Ticker value={92.4} decimals={1} motion={motion} suffix="%" /></span></div>
          <RadialBar value={0.924} motion={motion} />
        </div>
        <div className="dash-panel dash-panel--wide">
          <div className="dash-panel__head"><span>Alarm Stream</span><span className="mono" style={{ color: "var(--fg-mute)" }}>5 active</span></div>
          <AlarmList motion={motion} />
        </div>
      </div>
    </div>
  );
}

function AreaChart({ motion = 1, seed = 1 }) {
  const [t, setT] = useStateD(0);
  useAnimationFrame((time) => setT(time * 0.0005 * motion));
  const w = 600, h = 140, n = 60;
  const pts = Array.from({ length: n }, (_, i) => {
    const x = (i / (n - 1)) * w;
    const y = h * 0.6 + Math.sin(i * 0.3 + t) * 22 + Math.sin(i * 0.11 + t * 1.6 + seed) * 14 - Math.sin(i * 0.05) * 10;
    return [x, y];
  });
  const path = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const fillPath = path + ` L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1="0" x2={w} y1={h * p} y2={h * p} stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4" />
      ))}
      <path d={fillPath} fill="url(#areaG)" />
      <path d={path} stroke="var(--accent-2)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function RadialBar({ value = 0.92, motion = 1 }) {
  const r = 50, c = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
      <svg viewBox="0 0 140 140" width="120">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--accent)" strokeWidth="6"
          strokeDasharray={`${c * value} ${c}`} strokeLinecap="round"
          transform="rotate(-90 70 70)" style={{ filter: "drop-shadow(0 0 6px var(--accent))", transition: "stroke-dasharray 0.8s" }} />
        <text x="70" y="76" textAnchor="middle" fill="var(--fg)" fontFamily="var(--font-display)" fontSize="22" fontWeight="300">{(value*100).toFixed(1)}%</text>
      </svg>
    </div>
  );
}

function AlarmList({ motion = 1 }) {
  const rows = [
    { sev: "warn", code: "VIB-07", msg: "Pump P-204 vibration trending up", t: "2m" },
    { sev: "info", code: "BATCH", msg: "Batch B-2206 completed · 4.2% over yield", t: "11m" },
    { sev: "warn", code: "TMP-14", msg: "HX-410 outlet temperature drift", t: "23m" },
    { sev: "ok", code: "MAINT", msg: "PM scheduled for TK-101 cleared", t: "1h" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "4px 0" }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "auto auto 1fr auto", gap: 10, alignItems: "center", padding: "6px 8px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-mute)" }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: r.sev === "warn" ? "#f59e0b" : r.sev === "info" ? "var(--accent-2)" : "var(--ok,#10b981)",
            boxShadow: `0 0 6px ${r.sev === "warn" ? "#f59e0b" : r.sev === "info" ? "#06b6d4" : "#10b981"}`,
          }} />
          <span style={{ color: "var(--fg-dim)" }}>{r.code}</span>
          <span style={{ color: "var(--fg)" }}>{r.msg}</span>
          <span>{r.t}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { DashboardMock });
