// Live AI/ML demos — anomaly detection, RUL, soft sensor, vision
const { useState: useAL, useEffect: useEffAL, useMemo: useMemoAL, useRef: useRefAL } = React;

const AL_DEMOS = [
  { key: "anomaly", name: "Anomaly Detection", sub: "Autoencoder on vibration", asset: "P-204 · Pump bearing" },
  { key: "rul",     name: "Predictive Maintenance", sub: "RUL forecast w/ uncertainty", asset: "M-118 · Compressor motor" },
  { key: "soft",    name: "Soft Sensor", sub: "Inferred product purity", asset: "DC-301 · Distillation column" },
  { key: "vision",  name: "Vision QA", sub: "Defect detection · 12 fps", asset: "LINE-02 · Bottle line" },
];

function AILiveSection({ motion }) {
  const [active, setActive] = useAL("anomaly");
  return (
    <section className="section" id="ai-live" data-screen-label="08b AI/ML Live">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">08b · Interactive demos</div>
            <h2 style={{ marginTop: 14 }}>See the model shapes.<br /><span style={{ color: "var(--fg-mute)" }}>Four architectures we build to.</span></h2>
          </div>
          <p className="lead">
            Each demo below runs in your browser on synthetic plant telemetry. The architectures — autoencoder anomaly detection, RUL forecasting with uncertainty, soft sensors, vision QA — are the same patterns we ship to client production. Pick one to see how it behaves.
          </p>
        </div>

        <div className="al-wrap">
          <div className="al-tabs">
            {AL_DEMOS.map((d) => (
              <button key={d.key} className={"al-tab" + (active === d.key ? " al-tab--active" : "")} onClick={() => setActive(d.key)}>
                <div className="al-tab__name">{d.name}</div>
                <div className="al-tab__sub">{d.sub}</div>
              </button>
            ))}
          </div>
          <div className="al-stage">
            <div className="al-stage__head">
              <span className="tag">{AL_DEMOS.find((d) => d.key === active).asset}</span>
              <span className="live"><span className="dot" /> demo · 1Hz</span>
            </div>
            {active === "anomaly" && <AnomalyDemo motion={motion} />}
            {active === "rul"     && <RULDemo motion={motion} />}
            {active === "soft"    && <SoftSensorDemo motion={motion} />}
            {active === "vision"  && <VisionDemo motion={motion} />}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Anomaly Detection ---------- */
function AnomalyDemo({ motion }) {
  const N = 120;
  const [data, setData] = useAL(() => Array.from({ length: N }, (_, i) => baseSig(i)));
  const [score, setScore] = useAL(0.08);

  useEffAL(() => {
    if (!motion) return;
    const id = setInterval(() => {
      setData((d) => {
        const next = [...d.slice(1), baseSig(d.length + Math.random() * 1000)];
        const anomaly = Math.random() < 0.12;
        if (anomaly) next[next.length - 1] = baseSig(d.length, true);
        return next;
      });
    }, 400 / motion);
    return () => clearInterval(id);
  }, [motion]);

  function baseSig(t, anomaly = false) {
    const v = 0.5 + Math.sin(t * 0.12) * 0.12 + Math.sin(t * 0.41) * 0.06 + (Math.random() - 0.5) * 0.05;
    return anomaly ? Math.min(0.98, v + 0.3 + Math.random() * 0.15) : v;
  }

  // anomaly score based on deviation from rolling mean
  useEffAL(() => {
    const tail = data.slice(-20);
    const mean = tail.reduce((a, b) => a + b, 0) / tail.length;
    const last = data[data.length - 1];
    setScore(Math.min(1, Math.abs(last - mean) * 3.5));
  }, [data]);

  const W = 720, H = 240, padY = 20;
  const path = data.map((v, i) => `${i === 0 ? "M" : "L"}${(i * W / (N - 1)).toFixed(1)} ${(padY + (1 - v) * (H - padY * 2)).toFixed(1)}`).join(" ");

  // Anomalies = points above threshold
  const threshold = 0.78;
  const anomalies = data.map((v, i) => ({ v, i })).filter((p) => p.v > threshold);

  const status = score > 0.55 ? "ANOMALY" : score > 0.3 ? "WATCH" : "NORMAL";
  const statusColor = score > 0.55 ? "var(--bad)" : score > 0.3 ? "var(--warn)" : "var(--ok)";

  return (
    <div className="al-body">
      <div className="al-chart">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "auto", aspectRatio: `${W}/${H}` }}>
          <defs>
            <linearGradient id="anFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* threshold */}
          <line x1="0" y1={padY + (1 - threshold) * (H - padY * 2)} x2={W} y2={padY + (1 - threshold) * (H - padY * 2)} stroke="var(--bad)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <text x="8" y={padY + (1 - threshold) * (H - padY * 2) - 6} fontFamily="var(--font-mono)" fontSize="10" fill="var(--bad)" opacity="0.7">THRESHOLD</text>
          {/* signal */}
          <path d={path + ` L${W} ${H} L0 ${H} Z`} fill="url(#anFill)" />
          <path d={path} stroke="var(--accent-2)" strokeWidth="1.5" fill="none" />
          {/* anomalies */}
          {anomalies.map((a, idx) => (
            <circle key={idx} cx={a.i * W / (N - 1)} cy={padY + (1 - a.v) * (H - padY * 2)} r="4" fill="var(--bad)" stroke="#0a1628" strokeWidth="1.5">
              <animate attributeName="r" values="4;7;4" dur="1.2s" repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      </div>
      <div className="al-side">
        <div className="al-metric">
          <div className="al-metric__lbl">Anomaly score</div>
          <div className="al-metric__bar"><div className="al-metric__fill" style={{ width: `${score * 100}%`, background: statusColor }} /></div>
          <div className="al-metric__val" style={{ color: statusColor }}>{score.toFixed(2)}</div>
        </div>
        <div className="al-stat-grid">
          <div className="al-stat"><span>Status</span><strong style={{ color: statusColor }}>{status}</strong></div>
          <div className="al-stat"><span>Model</span><strong>LSTM-AE</strong></div>
          <div className="al-stat"><span>Latency</span><strong>3.2 ms</strong></div>
          <div className="al-stat"><span>Recall</span><strong>0.94</strong></div>
        </div>
        <div className="al-note">Trained on 90 days of healthy operation. Flags reconstruction error above 0.78σ.</div>
      </div>
    </div>
  );
}

/* ---------- RUL ---------- */
function RULDemo({ motion }) {
  const [t, setT] = useAL(0);
  useEffAL(() => {
    if (!motion) return;
    const id = setInterval(() => setT((x) => (x + 0.5 * motion) % 100), 300);
    return () => clearInterval(id);
  }, [motion]);

  const W = 720, H = 240, padY = 20;
  const N = 100;
  // health curve - degrades over time with noise
  const health = Array.from({ length: N }, (_, i) => {
    if (i > t) return null;
    return Math.max(0.05, 1 - Math.pow(i / 90, 1.8) + (Math.sin(i * 0.6) * 0.02));
  });
  // forecast band beyond t
  const forecast = Array.from({ length: N }, (_, i) => {
    if (i <= t) return null;
    return Math.max(0.05, 1 - Math.pow(i / 90, 1.8));
  });
  const upper = forecast.map((v) => v == null ? null : Math.min(1, v + 0.08 + (Math.random() * 0.02)));
  const lower = forecast.map((v) => v == null ? null : Math.max(0, v - 0.08 - (Math.random() * 0.02)));

  const toPath = (arr) => arr.map((v, i) => v == null ? "" : `${i === Math.floor(arr.findIndex(x => x != null)) ? "M" : "L"}${(i * W / (N - 1)).toFixed(1)} ${(padY + (1 - v) * (H - padY * 2)).toFixed(1)}`).filter(Boolean).join(" ");

  // band area
  const bandPts = [];
  upper.forEach((v, i) => { if (v != null) bandPts.push([i, v]); });
  for (let i = lower.length - 1; i >= 0; i--) if (lower[i] != null) bandPts.push([i, lower[i]]);
  const bandPath = bandPts.map(([i, v], idx) => `${idx === 0 ? "M" : "L"}${(i * W / (N - 1)).toFixed(1)} ${(padY + (1 - v) * (H - padY * 2)).toFixed(1)}`).join(" ") + " Z";

  // Failure threshold
  const failThresh = 0.25;
  const failIdx = forecast.findIndex((v) => v != null && v < failThresh);
  const daysToFail = failIdx > 0 ? Math.max(0, failIdx - Math.floor(t)) : 0;
  const currentHealth = health.filter(Boolean).pop() || 0;

  return (
    <div className="al-body">
      <div className="al-chart">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "auto", aspectRatio: `${W}/${H}` }}>
          <defs>
            <linearGradient id="rulBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          {/* failure threshold */}
          <line x1="0" y1={padY + (1 - failThresh) * (H - padY * 2)} x2={W} y2={padY + (1 - failThresh) * (H - padY * 2)} stroke="var(--bad)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <text x="8" y={padY + (1 - failThresh) * (H - padY * 2) - 6} fontFamily="var(--font-mono)" fontSize="10" fill="var(--bad)" opacity="0.7">FAILURE</text>
          {/* confidence band */}
          <path d={bandPath} fill="url(#rulBand)" />
          {/* forecast dashed */}
          <path d={toPath(forecast)} stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" opacity="0.7" />
          {/* actual */}
          <path d={toPath(health)} stroke="var(--accent-2)" strokeWidth="2" fill="none" style={{ filter: "drop-shadow(0 0 6px var(--accent-glow))" }} />
          {/* now marker */}
          <line x1={t * W / (N - 1)} y1="0" x2={t * W / (N - 1)} y2={H} stroke="var(--accent-2)" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
          <circle cx={t * W / (N - 1)} cy={padY + (1 - currentHealth) * (H - padY * 2)} r="4" fill="var(--accent-2)" stroke="#0a1628" strokeWidth="2" />
        </svg>
      </div>
      <div className="al-side">
        <div className="al-metric">
          <div className="al-metric__lbl">Health index</div>
          <div className="al-metric__bar"><div className="al-metric__fill" style={{ width: `${currentHealth * 100}%`, background: currentHealth > 0.6 ? "var(--ok)" : currentHealth > 0.35 ? "var(--warn)" : "var(--bad)" }} /></div>
          <div className="al-metric__val">{(currentHealth * 100).toFixed(0)}%</div>
        </div>
        <div className="al-stat-grid">
          <div className="al-stat"><span>RUL</span><strong style={{ color: "var(--accent-2)" }}>~{daysToFail || "—"} days</strong></div>
          <div className="al-stat"><span>Confidence</span><strong>±4d (95%)</strong></div>
          <div className="al-stat"><span>Model</span><strong>XGBoost+Cox</strong></div>
          <div className="al-stat"><span>MAE</span><strong>2.1 d</strong></div>
        </div>
        <div className="al-note">Survival regression on 6 features (vibration, temp, current, lubricant age, load, run hours).</div>
      </div>
    </div>
  );
}

/* ---------- Soft Sensor ---------- */
function SoftSensorDemo({ motion }) {
  const [t, setT] = useAL(0);
  useEffAL(() => {
    if (!motion) return;
    const id = setInterval(() => setT((x) => x + 0.06 * motion), 200);
    return () => clearInterval(id);
  }, [motion]);

  const inputs = [
    { name: "Reflux ratio", v: 2.4 + Math.sin(t) * 0.1, unit: "" },
    { name: "Reboiler duty", v: 1840 + Math.sin(t * 0.7) * 80, unit: "kW" },
    { name: "Top temp",     v: 78.2 + Math.sin(t * 1.1) * 1.4, unit: "°C" },
    { name: "Feed flow",    v: 24.6 + Math.sin(t * 0.5) * 0.8, unit: "m³/h" },
    { name: "Tray 14 ΔP",   v: 0.42 + Math.sin(t * 0.9) * 0.04, unit: "bar" },
  ];

  // Predicted purity
  const predicted = 99.2 + Math.sin(t * 0.5) * 0.35 + (Math.sin(t * 1.3) * 0.1);
  // Lab sample - sampled every ~30 ticks
  const lab = useMemoAL(() => {
    return 99.2 + Math.sin(Math.floor(t / 6) * 0.5) * 0.3;
  }, [Math.floor(t / 6)]);

  // History
  const histRef = useRefAL([]);
  useEffAL(() => {
    histRef.current = [...histRef.current.slice(-79), predicted];
  }, [t]);

  const N = 80, W = 720, H = 200, padY = 16;
  const min = 98.4, max = 100;
  const norm = (v) => (v - min) / (max - min);
  const path = histRef.current.map((v, i) => `${i === 0 ? "M" : "L"}${(i * W / (N - 1)).toFixed(1)} ${(padY + (1 - norm(v)) * (H - padY * 2)).toFixed(1)}`).join(" ");

  return (
    <div className="al-body">
      <div className="al-chart">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {inputs.map((inp) => (
            <div key={inp.name} className="al-input-tile">
              <div className="al-input-tile__name">{inp.name}</div>
              <div className="al-input-tile__val">{inp.v.toFixed(inp.v > 100 ? 0 : 1)}<span>{inp.unit}</span></div>
            </div>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "auto", aspectRatio: `${W}/${H}` }}>
            <defs>
              <linearGradient id="ssFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1={padY + (1 - norm(lab)) * (H - padY * 2)} x2={W} y2={padY + (1 - norm(lab)) * (H - padY * 2)} stroke="#fbbf24" strokeDasharray="3 4" strokeWidth="1" opacity="0.7" />
            <path d={path + ` L${W} ${H} L0 ${H} Z`} fill="url(#ssFill)" />
            <path d={path} stroke="var(--accent)" strokeWidth="2" fill="none" style={{ filter: "drop-shadow(0 0 6px var(--accent-glow))" }} />
          </svg>
          <div style={{ position: "absolute", top: 4, right: 8, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-dim)", display: "flex", gap: 12 }}>
            <span><span style={{ display: "inline-block", width: 12, height: 2, background: "var(--accent)", verticalAlign: "middle", marginRight: 4 }} />ML PREDICTION</span>
            <span><span style={{ display: "inline-block", width: 12, height: 2, background: "#fbbf24", verticalAlign: "middle", marginRight: 4 }} />LAB SAMPLE</span>
          </div>
        </div>
      </div>
      <div className="al-side">
        <div className="al-metric">
          <div className="al-metric__lbl">Predicted purity</div>
          <div className="al-metric__val" style={{ fontSize: 32, color: "var(--accent-2)" }}>{predicted.toFixed(2)}<span style={{ fontSize: 14, color: "var(--fg-dim)" }}>%</span></div>
        </div>
        <div className="al-stat-grid">
          <div className="al-stat"><span>Lab (last)</span><strong style={{ color: "#fbbf24" }}>{lab.toFixed(2)}%</strong></div>
          <div className="al-stat"><span>Δ vs lab</span><strong>{(predicted - lab).toFixed(3)}%</strong></div>
          <div className="al-stat"><span>Model</span><strong>GBM-Reg</strong></div>
          <div className="al-stat"><span>R²</span><strong>0.987</strong></div>
        </div>
        <div className="al-note">Online inference at 1 Hz vs. 4-hour lab cadence. Closes the loop on operator decisions.</div>
      </div>
    </div>
  );
}

/* ---------- Vision QA ---------- */
function VisionDemo({ motion }) {
  const [tick, setTick] = useAL(0);
  const [detections, setDetections] = useAL([]);
  useEffAL(() => {
    if (!motion) return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      // Random detections
      const n = Math.random() < 0.5 ? 1 : Math.random() < 0.85 ? 2 : 0;
      const newDets = Array.from({ length: n }, () => ({
        x: 10 + Math.random() * 70,
        y: 15 + Math.random() * 60,
        w: 8 + Math.random() * 12,
        h: 10 + Math.random() * 14,
        cls: Math.random() < 0.7 ? "OK" : Math.random() < 0.6 ? "SCUFF" : "CHIP",
        conf: 0.72 + Math.random() * 0.27,
      }));
      setDetections(newDets);
    }, 600 / motion);
    return () => clearInterval(id);
  }, [motion]);

  const stats = useMemoAL(() => {
    const seed = tick;
    return {
      processed: 12480 + seed * 12,
      defects: 18 + Math.floor(seed / 30),
      yieldPct: 99.86 + Math.sin(seed * 0.2) * 0.04,
    };
  }, [tick]);

  return (
    <div className="al-body">
      <div className="al-chart">
        <div className="al-vision">
          {/* Conveyor belt placeholder */}
          <svg viewBox="0 0 100 80" preserveAspectRatio="none" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
            <defs>
              <pattern id="belt" x="0" y="0" width="6" height="80" patternUnits="userSpaceOnUse" patternTransform={`translate(${-(tick * 4) % 6} 0)`}>
                <rect width="6" height="80" fill="#1a2540" />
                <line x1="3" y1="0" x2="3" y2="80" stroke="rgba(226,232,240,0.06)" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width="100" height="80" fill="url(#belt)" />
            {/* Bottles */}
            {[0, 1, 2, 3].map((i) => {
              const x = ((tick * 0.8 + i * 25) % 110) - 5;
              return (
                <g key={i} transform={`translate(${x} 28)`}>
                  <rect x="-7" y="-2" width="14" height="32" rx="2" fill="rgba(125,211,252,0.15)" stroke="rgba(125,211,252,0.4)" strokeWidth="0.3" />
                  <rect x="-3" y="-6" width="6" height="6" fill="rgba(125,211,252,0.25)" stroke="rgba(125,211,252,0.4)" strokeWidth="0.3" />
                </g>
              );
            })}
          </svg>
          {/* Bounding boxes */}
          {detections.map((d, i) => (
            <div key={i} className="al-bbox" style={{
              left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, height: `${d.h}%`,
              borderColor: d.cls === "OK" ? "var(--ok)" : d.cls === "SCUFF" ? "var(--warn)" : "var(--bad)",
            }}>
              <span className="al-bbox__lbl" style={{ background: d.cls === "OK" ? "var(--ok)" : d.cls === "SCUFF" ? "var(--warn)" : "var(--bad)" }}>
                {d.cls} · {d.conf.toFixed(2)}
              </span>
            </div>
          ))}
          {/* Scanline */}
          <div className="al-scanline" />
          <div className="al-vision__head">
            <span className="mono" style={{ fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.12em" }}>CAM-04 · 1280×720 · 12 fps</span>
            <span className="live"><span className="dot" /> rec</span>
          </div>
        </div>
      </div>
      <div className="al-side">
        <div className="al-stat-grid">
          <div className="al-stat"><span>Processed</span><strong>{stats.processed.toLocaleString()}</strong></div>
          <div className="al-stat"><span>Defects</span><strong style={{ color: "var(--warn)" }}>{stats.defects}</strong></div>
          <div className="al-stat"><span>Yield</span><strong style={{ color: "var(--ok)" }}>{stats.yieldPct.toFixed(2)}%</strong></div>
          <div className="al-stat"><span>Latency</span><strong>42 ms</strong></div>
        </div>
        <div className="al-metric">
          <div className="al-metric__lbl">Model</div>
          <div className="al-metric__val" style={{ fontSize: 16 }}>YOLOv8-n · ONNX runtime</div>
        </div>
        <div className="al-note">Edge inference on a Jetson Orin. Classes: OK / SCUFF / CHIP / CRACK. Retrained nightly on flagged frames.</div>
      </div>
    </div>
  );
}

Object.assign(window, { AILiveSection });
