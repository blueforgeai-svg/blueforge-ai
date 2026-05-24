// Animated viz components: sparkline, gauge, bars, schematic, etc.
const { useEffect, useRef, useState } = React;

function useAnimationFrame(callback, running = true) {
  const ref = useRef();
  useEffect(() => {
    if (!running) return;
    let raf;
    const tick = (t) => { callback(t); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
}

// Smooth pseudo-random walk
function makeSeries(n, seed = 1, base = 50, amp = 30) {
  let s = seed;
  return Array.from({ length: n }, (_, i) => {
    s = (s * 9301 + 49297) % 233280;
    const noise = (s / 233280 - 0.5);
    return base + Math.sin(i / 4 + seed) * amp * 0.6 + noise * amp;
  });
}

function Sparkline({ width = 240, height = 60, color = "var(--accent)", seed = 1, fill = true, motion = 1 }) {
  const [t, setT] = useState(0);
  useAnimationFrame((time) => setT(time * 0.001 * motion));
  const n = 40;
  const pts = Array.from({ length: n }, (_, i) => {
    const x = (i / (n - 1)) * width;
    const y = height / 2 + Math.sin(i * 0.4 + t) * height * 0.25 + Math.sin(i * 0.13 + t * 0.7 + seed) * height * 0.15;
    return [x, y];
  });
  const path = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const fillPath = path + ` L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block", width: "100%" }}>
      <defs>
        <linearGradient id={`spark-fill-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={fillPath} fill={`url(#spark-fill-${seed})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color}>
        <animate attributeName="r" values="2;5;2" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function Gauge({ value = 0.72, label = "Pressure", unit = "bar", color = "var(--accent)", size = 160, motion = 1 }) {
  const [animVal, setAnimVal] = useState(0);
  useEffect(() => {
    let raf, start;
    const dur = 1200 / motion;
    const from = animVal, to = value;
    const step = (t) => {
      if (!start) start = t;
      const k = Math.min(1, (t - start) / dur);
      const ease = 1 - Math.pow(1 - k, 3);
      setAnimVal(from + (to - from) * ease);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const r = size * 0.36;
  const cx = size / 2, cy = size / 2 + size * 0.05;
  const start = Math.PI * 0.8, end = Math.PI * 2.2;
  const cur = start + (end - start) * animVal;
  const arc = (a1, a2) => {
    const large = (a2 - a1) > Math.PI ? 1 : 0;
    return `M ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)}`;
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size * 0.85} viewBox={`0 0 ${size} ${size * 0.85}`}>
        <path d={arc(start, end)} stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none" />
        <path d={arc(start, cur)} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        {[...Array(11)].map((_, i) => {
          const a = start + (end - start) * (i / 10);
          const x1 = cx + (r - 6) * Math.cos(a), y1 = cy + (r - 6) * Math.sin(a);
          const x2 = cx + (r + 4) * Math.cos(a), y2 = cy + (r + 4) * Math.sin(a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />;
        })}
        <text x={cx} y={cy + 6} textAnchor="middle" fill="var(--fg)" fontFamily="var(--font-display)" fontSize={size * 0.22} fontWeight="300">{(animVal * 100).toFixed(0)}</text>
        <text x={cx} y={cy + size * 0.18} textAnchor="middle" fill="var(--fg-dim)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2">{unit.toUpperCase()}</text>
      </svg>
      <div className="kpi-label" style={{ marginTop: -4 }}>{label}</div>
    </div>
  );
}

function Bars({ data, color = "var(--accent-2)", height = 80, motion = 1 }) {
  const [phase, setPhase] = useState(0);
  useAnimationFrame((t) => setPhase(t * 0.001 * motion));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }}>
      {data.map((v, i) => {
        const h = (v + Math.sin(phase + i * 0.6) * 8 + 20);
        return (
          <div key={i} style={{
            flex: 1,
            height: `${Math.max(6, Math.min(100, h))}%`,
            background: `linear-gradient(180deg, ${color}, ${color}33)`,
            borderRadius: "1px 1px 0 0",
            transition: "height 0.4s ease",
            boxShadow: `0 0 8px ${color}66`,
          }} />
        );
      })}
    </div>
  );
}

function Ticker({ value, decimals = 1, motion = 1, suffix = "" }) {
  const [v, setV] = useState(value);
  useEffect(() => {
    let raf, start;
    const from = v, to = value, dur = 900 / motion;
    const step = (t) => {
      if (!start) start = t;
      const k = Math.min(1, (t - start) / dur);
      const ease = 1 - Math.pow(1 - k, 3);
      setV(from + (to - from) * ease);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{v.toFixed(decimals)}{suffix}</span>;
}

Object.assign(window, { Sparkline, Gauge, Bars, Ticker, makeSeries, useAnimationFrame });
