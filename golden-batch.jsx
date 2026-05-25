// Golden Batch — compare current run vs golden reference
const { useState: useGB, useEffect: useEffGB, useMemo: useMemoGB } = React;

// Generate a smooth curve as a series of points (0..1 normalized)
function gbCurve(seed, points = 80, kind = "ramp") {
  const arr = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    let v;
    if (kind === "ramp") {
      // ramp up, hold, ramp down
      if (t < 0.18) v = t / 0.18 * 0.85;
      else if (t < 0.72) v = 0.85 + Math.sin((t - 0.18) * 8 + seed) * 0.04;
      else v = 0.85 - (t - 0.72) / 0.28 * 0.6;
    } else if (kind === "wave") {
      v = 0.5 + Math.sin(t * Math.PI * 1.2 + seed) * 0.3;
    } else { // pressure
      v = 0.2 + Math.pow(Math.sin(t * Math.PI), 1.4) * 0.7;
    }
    arr.push(v);
  }
  return arr;
}

function gbDeviate(golden, amp, drift, seed) {
  return golden.map((g, i) => {
    const t = i / (golden.length - 1);
    const n = Math.sin(i * 0.7 + seed) * 0.025 + Math.sin(i * 0.21 + seed * 2) * 0.015;
    return Math.max(0, Math.min(1, g + n + Math.sin(t * Math.PI) * amp + drift * t));
  });
}

function pointsToPath(arr, w, h, padY = 8) {
  const inner = h - padY * 2;
  const step = w / (arr.length - 1);
  return arr.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${(padY + (1 - v) * inner).toFixed(1)}`).join(" ");
}

function pointsToBand(low, high, w, h, padY = 8) {
  const inner = h - padY * 2;
  const step = w / (low.length - 1);
  const up = low.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${(padY + (1 - v) * inner).toFixed(1)}`).join(" ");
  const down = [...high].reverse().map((v, i) => {
    const idx = high.length - 1 - i;
    return `L${(idx * step).toFixed(1)} ${(padY + (1 - v) * inner).toFixed(1)}`;
  }).join(" ");
  return up + " " + down + " Z";
}

const GB_PARAMS = [
  { key: "temp",    name: "Temperature",  unit: "°C",  span: [20, 145], kind: "ramp",     tolerance: 0.06 },
  { key: "press",   name: "Pressure",     unit: "bar", span: [0, 4.2],  kind: "pressure", tolerance: 0.08 },
  { key: "agit",    name: "Agitation",    unit: "rpm", span: [0, 220],  kind: "wave",     tolerance: 0.07 },
  { key: "ph",      name: "pH",           unit: "",    span: [4, 9],    kind: "wave",     tolerance: 0.05 },
];

const GB_PHASES = [
  { name: "Charge",  start: 0,    end: 0.12 },
  { name: "Heat",    start: 0.12, end: 0.32 },
  { name: "React",   start: 0.32, end: 0.70 },
  { name: "Cool",    start: 0.70, end: 0.88 },
  { name: "Drop",    start: 0.88, end: 1.00 },
];

function GoldenBatchSection({ motion }) {
  const [batch, setBatch] = useGB("B-2207");
  const [progress, setProgress] = useGB(0.72);
  const [activeParam, setActiveParam] = useGB("temp");

  // simulate live progress
  useEffGB(() => {
    if (!motion) return;
    const t = setInterval(() => {
      setProgress((p) => {
        const next = p + 0.003 * motion;
        return next > 0.96 ? 0.4 : next;
      });
    }, 400);
    return () => clearInterval(t);
  }, [motion]);

  // Reference batches selector
  const BATCHES = ["B-2205 (Golden)", "B-2206", "B-2207", "B-2208"];

  // Generate curves once per param
  const curves = useMemoGB(() => {
    const out = {};
    GB_PARAMS.forEach((p, idx) => {
      const golden = gbCurve(idx * 1.7, 80, p.kind);
      const tol = p.tolerance;
      const upper = golden.map((v) => Math.min(1, v + tol));
      const lower = golden.map((v) => Math.max(0, v - tol));
      const current = gbDeviate(golden, idx === 1 ? 0.04 : 0.015, idx === 2 ? 0.03 : 0.005, idx * 3.3);
      out[p.key] = { golden, upper, lower, current };
    });
    return out;
  }, []);

  // KPI scores
  const score = useMemoGB(() => {
    const visible = Math.floor(progress * 80);
    let totalDev = 0, count = 0, breaches = 0;
    GB_PARAMS.forEach((p) => {
      const c = curves[p.key];
      for (let i = 0; i <= visible && i < c.golden.length; i++) {
        const d = Math.abs(c.current[i] - c.golden[i]);
        totalDev += d;
        count++;
        if (c.current[i] > c.upper[i] || c.current[i] < c.lower[i]) breaches++;
      }
    });
    const avg = count > 0 ? totalDev / count : 0;
    const conformance = Math.max(0, Math.min(100, 100 - avg * 350));
    return { conformance, breaches, avg };
  }, [curves, progress]);

  const currentPhase = GB_PHASES.find((p) => progress >= p.start && progress < p.end) || GB_PHASES[GB_PHASES.length - 1];
  const activeCurve = curves[activeParam];
  const activeMeta = GB_PARAMS.find((p) => p.key === activeParam);

  return (
    <section className="section" id="golden-batch" data-screen-label="07 Golden Batch">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">07 · Golden batch</div>
            <h2 style={{ marginTop: 14 }}>One perfect run.<br /><span style={{ color: "var(--fg-mute)" }}>Every batch after, measured against it.</span></h2>
          </div>
          <p className="lead">
            Lock in the parameters of your best-ever batch as the golden reference. Every subsequent run is overlaid in real time — deviation bands flag drift before it becomes scrap, and conformance scoring rolls up to plant-wide KPIs.
          </p>
        </div>

        <div className="gb-wrap">
          {/* Top bar */}
          <div className="gb-topbar">
            <div className="gb-topbar__group">
              <span className="tag">Reference</span>
              <label htmlFor="gb-batch" className="sr-only">Reference batch</label>
              <select id="gb-batch" aria-label="Reference batch" className="gb-select" value={batch} onChange={(e) => setBatch(e.target.value)}>
                {BATCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="gb-topbar__group">
              <span className="tag">Current</span>
              <span className="mono" style={{ color: "var(--accent-2)", fontSize: 13 }}>B-2209 · Reactor R-04</span>
              <span className="live"><span className="dot" /> live</span>
            </div>
            <div className="gb-topbar__group">
              <div className="gb-kpi">
                <span className="gb-kpi__label">Conformance</span>
                <span className="gb-kpi__val" style={{ color: score.conformance > 92 ? "var(--ok)" : score.conformance > 80 ? "var(--warn)" : "var(--bad)" }}>
                  {score.conformance.toFixed(1)}<span style={{ color: "var(--fg-dim)", fontSize: 11 }}>%</span>
                </span>
              </div>
              <div className="gb-kpi">
                <span className="gb-kpi__label">Breaches</span>
                <span className="gb-kpi__val" style={{ color: score.breaches > 0 ? "var(--warn)" : "var(--ok)" }}>
                  {score.breaches}
                </span>
              </div>
              <div className="gb-kpi">
                <span className="gb-kpi__label">Phase</span>
                <span className="gb-kpi__val" style={{ color: "var(--accent-2)", fontSize: 16 }}>{currentPhase.name}</span>
              </div>
            </div>
          </div>

          {/* Phase tracker */}
          <div className="gb-phases">
            {GB_PHASES.map((p) => {
              const done = progress >= p.end;
              const active = progress >= p.start && progress < p.end;
              return (
                <div key={p.name} className={"gb-phase" + (active ? " gb-phase--active" : "") + (done ? " gb-phase--done" : "")}>
                  <div className="gb-phase__bar">
                    <div className="gb-phase__fill" style={{
                      width: done ? "100%" : active ? `${((progress - p.start) / (p.end - p.start)) * 100}%` : "0%"
                    }} />
                  </div>
                  <div className="gb-phase__label">{p.name}</div>
                </div>
              );
            })}
          </div>

          {/* Main chart + parameter list */}
          <div className="gb-main">
            <div className="gb-chart">
              <div className="gb-chart__head">
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", color: "var(--fg-dim)", textTransform: "uppercase" }}>{activeMeta.name}</div>
                  <div style={{ display: "flex", gap: 14, marginTop: 6, alignItems: "baseline" }}>
                    <span className="mono" style={{ fontSize: 22, color: "var(--accent-2)" }}>
                      {(activeMeta.span[0] + activeCurve.current[Math.min(79, Math.floor(progress * 80))] * (activeMeta.span[1] - activeMeta.span[0])).toFixed(1)}
                      <span style={{ color: "var(--fg-dim)", fontSize: 12, marginLeft: 4 }}>{activeMeta.unit}</span>
                    </span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>
                      golden: {(activeMeta.span[0] + activeCurve.golden[Math.min(79, Math.floor(progress * 80))] * (activeMeta.span[1] - activeMeta.span[0])).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="gb-legend">
                  <span><span className="gb-swatch gb-swatch--golden" /> Golden</span>
                  <span><span className="gb-swatch gb-swatch--band" /> Tolerance</span>
                  <span><span className="gb-swatch gb-swatch--current" /> Current</span>
                </div>
              </div>

              <svg viewBox="0 0 720 280" preserveAspectRatio="none" className="gb-svg">
                <defs>
                  <linearGradient id="gb-band" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.04" />
                  </linearGradient>
                  <linearGradient id="gb-current" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
                  </linearGradient>
                  <clipPath id="gb-clip">
                    <rect x="0" y="0" width={720 * progress} height="280" />
                  </clipPath>
                </defs>

                {/* gridlines */}
                {[0.25, 0.5, 0.75].map((g) => (
                  <line key={g} x1="0" y1={g * 280} x2="720" y2={g * 280} stroke="rgba(226,232,240,0.05)" strokeDasharray="2 4" />
                ))}
                {/* phase boundaries */}
                {GB_PHASES.slice(1).map((p) => (
                  <line key={p.name} x1={p.start * 720} y1="0" x2={p.start * 720} y2="280" stroke="rgba(226,232,240,0.06)" strokeDasharray="3 6" />
                ))}

                {/* tolerance band */}
                <path d={pointsToBand(activeCurve.lower, activeCurve.upper, 720, 280, 20)} fill="url(#gb-band)" />
                {/* upper/lower edges */}
                <path d={pointsToPath(activeCurve.upper, 720, 280, 20)} stroke="rgba(251,191,36,0.35)" strokeWidth="1" strokeDasharray="2 3" fill="none" />
                <path d={pointsToPath(activeCurve.lower, 720, 280, 20)} stroke="rgba(251,191,36,0.35)" strokeWidth="1" strokeDasharray="2 3" fill="none" />
                {/* golden line */}
                <path d={pointsToPath(activeCurve.golden, 720, 280, 20)} stroke="#fbbf24" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                {/* current run - clipped to progress */}
                <g clipPath="url(#gb-clip)">
                  <path d={pointsToPath(activeCurve.current, 720, 280, 20) + ` L720 280 L0 280 Z`} fill="url(#gb-current)" />
                  <path d={pointsToPath(activeCurve.current, 720, 280, 20)} stroke="var(--accent-2)" strokeWidth="2" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px var(--accent-glow))" }} />
                </g>

                {/* now marker */}
                <line x1={progress * 720} y1="0" x2={progress * 720} y2="280" stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx={progress * 720} cy={20 + (1 - activeCurve.current[Math.min(79, Math.floor(progress * 80))]) * 240} r="4" fill="var(--accent-2)" stroke="#0a1628" strokeWidth="2" />
              </svg>

              <div className="gb-chart__foot">
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>T-0</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>BATCH PROGRESS · {(progress * 100).toFixed(0)}%</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>T-END</span>
              </div>
            </div>

            <div className="gb-params">
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", color: "var(--fg-dim)", textTransform: "uppercase", padding: "0 4px 10px" }}>
                Parameters
              </div>
              {GB_PARAMS.map((p) => {
                const c = curves[p.key];
                const idx = Math.min(79, Math.floor(progress * 80));
                const actual = c.current[idx];
                const golden = c.golden[idx];
                const dev = Math.abs(actual - golden);
                const inBand = actual <= c.upper[idx] && actual >= c.lower[idx];
                const realVal = p.span[0] + actual * (p.span[1] - p.span[0]);
                const realGold = p.span[0] + golden * (p.span[1] - p.span[0]);
                return (
                  <button key={p.key} className={"gb-param" + (activeParam === p.key ? " gb-param--active" : "")}
                    onClick={() => setActiveParam(p.key)}>
                    <div className="gb-param__head">
                      <span className="gb-param__name">{p.name}</span>
                      <span className={"gb-param__status" + (inBand ? " gb-param__status--ok" : " gb-param__status--warn")}>
                        {inBand ? "IN BAND" : "DRIFT"}
                      </span>
                    </div>
                    <div className="gb-param__row">
                      <div>
                        <div className="gb-param__lbl">Actual</div>
                        <div className="gb-param__val">{realVal.toFixed(1)}<span>{p.unit}</span></div>
                      </div>
                      <div>
                        <div className="gb-param__lbl">Golden</div>
                        <div className="gb-param__val gb-param__val--gold">{realGold.toFixed(1)}<span>{p.unit}</span></div>
                      </div>
                      <div>
                        <div className="gb-param__lbl">Δ</div>
                        <div className="gb-param__val" style={{ color: inBand ? "var(--ok)" : "var(--warn)" }}>
                          {(dev * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <Sparkline width={210} height={28} color={inBand ? "var(--accent-2)" : "var(--warn)"} seed={p.key.length} motion={motion} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Insights strip */}
          <div className="gb-insights">
            <div className="gb-insight">
              <div className="gb-insight__icon" style={{ color: "var(--ok)" }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <div>
                <div className="gb-insight__title">Yield prediction</div>
                <div className="gb-insight__val">+2.4% vs avg</div>
              </div>
            </div>
            <div className="gb-insight">
              <div className="gb-insight__icon" style={{ color: "var(--warn)" }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 9v4M12 17h.01" /><path d="M10.3 3.86l-8.18 14.5A2 2 0 003.86 21h16.28a2 2 0 001.74-2.64L13.7 3.86a2 2 0 00-3.4 0z" />
                </svg>
              </div>
              <div>
                <div className="gb-insight__title">Agitation drift</div>
                <div className="gb-insight__val">±12 rpm @ T+38m</div>
              </div>
            </div>
            <div className="gb-insight">
              <div className="gb-insight__icon" style={{ color: "var(--accent-2)" }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 12l3-9 4 18 4-12 4 6h3" />
                </svg>
              </div>
              <div>
                <div className="gb-insight__title">ETA to drop</div>
                <div className="gb-insight__val">27m · on schedule</div>
              </div>
            </div>
            <div className="gb-insight">
              <div className="gb-insight__icon" style={{ color: "#fbbf24" }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5L18.2 22 12 17.3 5.8 22l2.4-8.1L2 9.4h7.6z" />
                </svg>
              </div>
              <div>
                <div className="gb-insight__title">Golden ref</div>
                <div className="gb-insight__val">B-2205 · 99.4% yield</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { GoldenBatchSection });
