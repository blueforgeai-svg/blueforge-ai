// Animated plant schematic — sensors, pipes, flow particles
const { useEffect: useEffectS, useState: useStateS, useRef: useRefS } = React;

function PlantSchematic({ motion = 1, accent = "#3b82f6", accent2 = "#06b6d4" }) {
  const [pulse, setPulse] = useStateS(0);
  useAnimationFrame((t) => setPulse(t * 0.001 * motion), true);

  // Nodes
  const nodes = [
    { id: "tank1", x: 90, y: 220, type: "tank", label: "TK-101" },
    { id: "tank2", x: 90, y: 420, type: "tank", label: "TK-102" },
    { id: "pump1", x: 280, y: 320, type: "pump", label: "P-204" },
    { id: "react", x: 480, y: 280, type: "reactor", label: "RX-301" },
    { id: "hx", x: 720, y: 280, type: "hx", label: "HX-410" },
    { id: "sep", x: 920, y: 200, type: "sep", label: "SP-520" },
    { id: "out", x: 1080, y: 360, type: "out", label: "DS-600" },
  ];

  // Pipes (list of segments connecting nodes)
  const pipes = [
    { from: "tank1", to: "pump1", id: "p1" },
    { from: "tank2", to: "pump1", id: "p2" },
    { from: "pump1", to: "react", id: "p3" },
    { from: "react", to: "hx", id: "p4" },
    { from: "hx", to: "sep", id: "p5" },
    { from: "hx", to: "out", id: "p6" },
  ];

  // Sensors attached to pipes
  const sensors = [
    { id: "s1", pipe: "p1", t: 0.6, label: "T", value: "78°C" },
    { id: "s2", pipe: "p3", t: 0.4, label: "P", value: "4.2bar" },
    { id: "s3", pipe: "p4", t: 0.5, label: "F", value: "12 m³/h" },
    { id: "s4", pipe: "p5", t: 0.5, label: "Q", value: "98.4%" },
    { id: "s5", pipe: "p6", t: 0.6, label: "T", value: "42°C" },
  ];

  const nById = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <svg viewBox="0 0 1200 600" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="pipeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accent2} stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="nodeGlow">
          <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <filter id="schemBlur"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>

      {/* Grid */}
      {[...Array(15)].map((_, i) => (
        <line key={`gv${i}`} x1={i * 80} y1={0} x2={i * 80} y2={600} stroke="rgba(226,232,240,0.04)" />
      ))}
      {[...Array(8)].map((_, i) => (
        <line key={`gh${i}`} x1={0} y1={i * 80} x2={1200} y2={i * 80} stroke="rgba(226,232,240,0.04)" />
      ))}

      {/* Pipes */}
      {pipes.map((p) => {
        const a = nById[p.from], b = nById[p.to];
        const midX = (a.x + b.x) / 2;
        const d = `M ${a.x} ${a.y} L ${midX} ${a.y} L ${midX} ${b.y} L ${b.x} ${b.y}`;
        return (
          <g key={p.id}>
            <path d={d} stroke="rgba(226,232,240,0.12)" strokeWidth="2" fill="none" />
            <path d={d} stroke={accent} strokeWidth="1" fill="none" strokeDasharray="4 8"
              strokeDashoffset={-pulse * 30} opacity="0.7" style={{ filter: "drop-shadow(0 0 4px " + accent + ")" }} />
          </g>
        );
      })}

      {/* Flow particles */}
      {pipes.map((p, idx) => {
        const a = nById[p.from], b = nById[p.to];
        const midX = (a.x + b.x) / 2;
        // Approximate length
        const len = Math.abs(midX - a.x) + Math.abs(b.y - a.y) + Math.abs(b.x - midX);
        const seg1 = Math.abs(midX - a.x);
        const seg2 = seg1 + Math.abs(b.y - a.y);
        const phase = ((pulse * 80 + idx * 30) % len) / len;
        const dist = phase * len;
        let px, py;
        if (dist < seg1) { px = a.x + dist; py = a.y; }
        else if (dist < seg2) { px = midX; py = a.y + (dist - seg1) * Math.sign(b.y - a.y); }
        else { px = midX + (dist - seg2) * Math.sign(b.x - midX); py = b.y; }
        return (
          <g key={`fp${p.id}`}>
            <circle cx={px} cy={py} r="3" fill={accent2} style={{ filter: `drop-shadow(0 0 6px ${accent2})` }} />
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((n) => (
        <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
          <circle r="32" fill="url(#nodeGlow)" />
          <NodeShape type={n.type} accent={accent} accent2={accent2} />
          <text y="48" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg-mute)" letterSpacing="1.5">{n.label}</text>
        </g>
      ))}

      {/* Sensors */}
      {sensors.map((s) => {
        const p = pipes.find((pp) => pp.id === s.pipe);
        if (!p) return null;
        const a = nById[p.from], b = nById[p.to];
        const midX = (a.x + b.x) / 2;
        const len = Math.abs(midX - a.x) + Math.abs(b.y - a.y) + Math.abs(b.x - midX);
        const seg1 = Math.abs(midX - a.x);
        const seg2 = seg1 + Math.abs(b.y - a.y);
        const dist = s.t * len;
        let px, py;
        if (dist < seg1) { px = a.x + dist; py = a.y; }
        else if (dist < seg2) { px = midX; py = a.y + (dist - seg1) * Math.sign(b.y - a.y); }
        else { px = midX + (dist - seg2) * Math.sign(b.x - midX); py = b.y; }
        const blink = (Math.sin(pulse * 2 + s.t * 9) + 1) / 2;
        return (
          <g key={s.id} transform={`translate(${px}, ${py})`}>
            <circle r="8" fill="none" stroke={accent2} strokeWidth="1" opacity={0.4 + blink * 0.6} />
            <circle r="3" fill={accent2} style={{ filter: `drop-shadow(0 0 4px ${accent2})` }} />
            <g transform="translate(12, -22)">
              <rect x="0" y="0" width="60" height="22" rx="2" fill="rgba(10,22,40,0.85)" stroke="rgba(6,182,212,0.4)" />
              <text x="6" y="9" fontFamily="var(--font-mono)" fontSize="7" fill="var(--fg-dim)" letterSpacing="1">SENSOR · {s.label}</text>
              <text x="6" y="18" fontFamily="var(--font-mono)" fontSize="9" fill={accent2}>{s.value}</text>
            </g>
          </g>
        );
      })}

      {/* Legend label */}
      <g transform="translate(40, 40)">
        <text fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg-dim)" letterSpacing="2">UNIT 04 · POLYMER LINE</text>
        <text y="14" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-dim)" letterSpacing="1.5">REV 2026.04 · LIVE TELEMETRY</text>
      </g>
    </svg>
  );
}

function NodeShape({ type, accent, accent2 }) {
  const stroke = "rgba(226,232,240,0.4)";
  switch (type) {
    case "tank":
      return <g>
        <rect x="-18" y="-22" width="36" height="44" rx="4" fill="rgba(10,22,40,0.9)" stroke={stroke} />
        <rect x="-18" y="4" width="36" height="18" rx="0" fill={accent} fillOpacity="0.25" />
        <line x1="-18" y1="4" x2="18" y2="4" stroke={accent} strokeWidth="1" />
      </g>;
    case "pump":
      return <g>
        <circle r="22" fill="rgba(10,22,40,0.9)" stroke={stroke} />
        <circle r="14" fill="none" stroke={accent} strokeOpacity="0.5" />
        <path d="M -8 -8 L 8 0 L -8 8 Z" fill={accent} />
      </g>;
    case "reactor":
      return <g>
        <rect x="-26" y="-26" width="52" height="52" rx="6" fill="rgba(10,22,40,0.9)" stroke={stroke} />
        <circle r="14" fill="none" stroke={accent2} strokeOpacity="0.6" />
        <circle r="6" fill={accent2} fillOpacity="0.4" />
      </g>;
    case "hx":
      return <g>
        <rect x="-26" y="-14" width="52" height="28" rx="3" fill="rgba(10,22,40,0.9)" stroke={stroke} />
        <line x1="-22" y1="-6" x2="22" y2="-6" stroke={accent} strokeOpacity="0.6" />
        <line x1="-22" y1="0" x2="22" y2="0" stroke={accent2} strokeOpacity="0.6" />
        <line x1="-22" y1="6" x2="22" y2="6" stroke={accent} strokeOpacity="0.6" />
      </g>;
    case "sep":
      return <g>
        <path d="M -22 -20 L 22 -20 L 14 20 L -14 20 Z" fill="rgba(10,22,40,0.9)" stroke={stroke} />
        <line x1="-18" y1="-8" x2="18" y2="-8" stroke={accent2} strokeOpacity="0.6" />
      </g>;
    case "out":
      return <g>
        <rect x="-22" y="-16" width="44" height="32" rx="2" fill="rgba(10,22,40,0.9)" stroke={stroke} />
        <text textAnchor="middle" y="5" fontFamily="var(--font-mono)" fontSize="11" fill={accent2} letterSpacing="1">OUT</text>
      </g>;
    default:
      return <circle r="18" fill="rgba(10,22,40,0.9)" stroke={stroke} />;
  }
}

Object.assign(window, { PlantSchematic });
