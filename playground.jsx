// Interactive PI-Vision-style symbol playground
const { useState: usePG, useRef: useRefPG, useEffect: useEffPG } = React;

const PG_LIBRARY = [
  { kind: "vessel", name: "Vessel" },
  { kind: "pump",   name: "Pump" },
  { kind: "valve",  name: "Valve" },
  { kind: "motor",  name: "Motor" },
  { kind: "hx",     name: "Heat Exch." },
  { kind: "trend",  name: "Trend" },
  { kind: "alarm",  name: "Alarm" },
  { kind: "batch",  name: "Batch" },
];

const PG_DEFAULTS = [
  { id: 1, kind: "vessel", x: 60,  y: 60,  tag: "TK-101" },
  { id: 2, kind: "pump",   x: 280, y: 70,  tag: "P-204"  },
  { id: 3, kind: "trend",  x: 500, y: 60,  tag: "FT-310" },
  { id: 4, kind: "valve",  x: 60,  y: 280, tag: "FV-120" },
  { id: 5, kind: "alarm",  x: 300, y: 280, tag: "VIB-07" },
];

function SymbolPlayground({ motion }) {
  const [items, setItems] = usePG(PG_DEFAULTS);
  const [drag, setDrag] = usePG(null); // {id, dx, dy} for moving placed; or {kind} for palette
  const [nextId, setNextId] = usePG(10);
  const [selected, setSelected] = usePG(2);
  const canvasRef = useRefPG(null);

  // Mouse move / up for dragging placed items
  useEffPG(() => {
    if (!drag || !drag.id) return;
    const onMove = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width - 160, e.clientX - rect.left - drag.dx));
      const y = Math.max(0, Math.min(rect.height - 120, e.clientY - rect.top - drag.dy));
      setItems((arr) => arr.map((it) => it.id === drag.id ? { ...it, x, y } : it));
    };
    const onUp = () => setDrag(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [drag]);

  const startMoveItem = (e, it) => {
    e.preventDefault();
    setSelected(it.id);
    const rect = canvasRef.current.getBoundingClientRect();
    setDrag({ id: it.id, dx: e.clientX - rect.left - it.x, dy: e.clientY - rect.top - it.y });
  };

  // Drag from palette: HTML5 drag events for cross-element drop
  const onDragStartPalette = (e, kind) => { e.dataTransfer.setData("kind", kind); e.dataTransfer.effectAllowed = "copy"; };
  const onDrop = (e) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData("kind");
    if (!kind) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 160, e.clientX - rect.left - 70));
    const y = Math.max(0, Math.min(rect.height - 120, e.clientY - rect.top - 50));
    const tag = `TAG-${String(nextId).padStart(3, "0")}`;
    const id = nextId;
    setItems((arr) => [...arr, { id, kind, x, y, tag }]);
    setNextId(id + 1);
    setSelected(id);
  };
  const onDragOver = (e) => e.preventDefault();

  const remove = (id) => setItems((arr) => arr.filter((it) => it.id !== id));
  const clearAll = () => setItems([]);
  const reset = () => { setItems(PG_DEFAULTS); setNextId(10); setSelected(2); };

  const sel = items.find((it) => it.id === selected);

  return (
    <section className="section" id="playground" data-screen-label="06b Symbol Playground">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Try it · Interactive canvas</div>
            <h2 style={{ marginTop: 14 }}>Drag a symbol.<br /><span style={{ color: "var(--fg-mute)" }}>Watch it come alive.</span></h2>
          </div>
          <p className="lead">
            A taste of how our PI Vision and Grafana surfaces feel in the wild. Drag any symbol from the palette onto the canvas, move it around, watch the values tick. Same model we ship to operators — minus the asset bindings.
          </p>
        </div>

        <div className="pg-wrap">
          <aside className="pg-palette">
            <div className="pg-palette__head">
              <span className="tag">Palette</span>
              <span className="live"><span className="dot" /> drag</span>
            </div>
            <div className="pg-palette__grid">
              {PG_LIBRARY.map((s) => (
                <div key={s.kind} className="pg-chip" draggable
                  onDragStart={(e) => onDragStartPalette(e, s.kind)}>
                  <div className="pg-chip__icon"><SymbolGraphic kind={s.kind} motion={motion} i={s.kind.length} /></div>
                  <div className="pg-chip__name">{s.name}</div>
                </div>
              ))}
            </div>
            <div className="pg-actions">
              <button className="btn" onClick={reset} style={{ padding: "8px 12px", fontSize: 11 }}>Reset</button>
              <button className="btn" onClick={clearAll} style={{ padding: "8px 12px", fontSize: 11 }}>Clear</button>
            </div>
          </aside>

          <div className="pg-canvas-wrap">
            <div className="pg-canvas-head">
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)", letterSpacing: "0.1em" }}>operations / mimic / unit-04</span>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>{items.length} symbols</span>
                <span className="live"><span className="dot" /> live · 1s</span>
              </div>
            </div>
            <div className="pg-canvas" ref={canvasRef} onDrop={onDrop} onDragOver={onDragOver}>
              {items.map((it) => (
                <div key={it.id} className={"pg-item" + (selected === it.id ? " pg-item--sel" : "")}
                  style={{ left: it.x, top: it.y }}
                  onMouseDown={(e) => startMoveItem(e, it)}>
                  <div className="pg-item__tag">{it.tag}</div>
                  <SymbolGraphic kind={it.kind} motion={motion} i={it.id} />
                  <button className="pg-item__close" onMouseDown={(e) => { e.stopPropagation(); }}
                    onClick={(e) => { e.stopPropagation(); remove(it.id); }}>×</button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="pg-empty">Drag a symbol from the palette →</div>
              )}
            </div>
          </div>

          <aside className="pg-inspector">
            <div className="pg-palette__head">
              <span className="tag">Inspector</span>
              {sel && <span className="live"><span className="dot" /> bound</span>}
            </div>
            {sel ? (
              <InspectorPanel item={sel} motion={motion} onTag={(t) => setItems((arr) => arr.map((it) => it.id === sel.id ? { ...it, tag: t } : it))} />
            ) : (
              <div style={{ color: "var(--fg-dim)", fontFamily: "var(--font-mono)", fontSize: 12, padding: 12 }}>Select a symbol to inspect its live values.</div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

function InspectorPanel({ item, motion, onTag }) {
  const labels = {
    vessel: [["Level", 69, "%"], ["Volume", 4214, "L"], ["Mass", 3.8, "t"]],
    pump:   [["Speed", 1756, "rpm"], ["Power", 18.4, "kW"], ["Discharge", 4.2, "bar"]],
    valve:  [["Position", 78, "%"], ["Flow", 12.4, "m³/h"], ["ΔP", 0.42, "bar"]],
    motor:  [["Current", 42.1, "A"], ["Temp", 68, "°C"], ["Vibration", 2.1, "mm/s"]],
    hx:     [["Inlet", 124, "°C"], ["Outlet", 82, "°C"], ["ΔT", 42, "°C"]],
    trend:  [["Value", 14.6, "m³/h"], ["Min 1h", 11.2, ""], ["Max 1h", 16.4, ""]],
    alarm:  [["Priority", "HIGH", ""], ["Asset", "P-204", ""], ["Age", "2m", ""]],
    batch:  [["Phase", "REACT", ""], ["Step", "3/5", ""], ["ETA", "27m", ""]],
  }[item.kind] || [];

  return (
    <div className="pg-inspect">
      <div className="pg-inspect__row">
        <label>Tag</label>
        <input value={item.tag} onChange={(e) => onTag(e.target.value)} />
      </div>
      <div className="pg-inspect__row">
        <label>Asset class</label>
        <span className="mono" style={{ fontSize: 12 }}>{item.kind}</span>
      </div>
      <div className="pg-inspect__sep" />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Live values</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {labels.map(([k, v, u]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 8px", background: "rgba(255,255,255,0.02)", borderRadius: 3 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>{k}</span>
            <span className="mono" style={{ fontSize: 13, color: "var(--accent-2)" }}>
              {typeof v === "number" ? <Ticker value={v} decimals={v < 100 ? 1 : 0} motion={motion} /> : v}{u && <span style={{ color: "var(--fg-dim)", marginLeft: 4 }}>{u}</span>}
            </span>
          </div>
        ))}
      </div>
      <div className="pg-inspect__sep" />
      <Sparkline width={240} height={50} color="var(--accent)" seed={item.id} motion={motion} />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", marginTop: 6, textAlign: "right" }}>HISTORIAN · PI / CANARY / TDENGINE</div>
    </div>
  );
}

Object.assign(window, { SymbolPlayground });
