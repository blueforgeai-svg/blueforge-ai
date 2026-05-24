// Tweaks integration + scroll progress bar + app composition
const { useEffect: useEffApp, useState: useStApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": 0,
  "density": 1,
  "motion": 1
}/*EDITMODE-END*/;

const PALETTES = [
  { name: "Midnight Slate", bg: "#0b1220", bg2: "#111a2e", bg3: "#172238", accent: "#5b8def", accent2: "#7dd3fc", glow: "rgba(91,141,239,0.28)" },
  { name: "Graphite", bg: "#0c0f14", bg2: "#141821", bg3: "#1c2230", accent: "#6b7fff", accent2: "#a5b4fc", glow: "rgba(107,127,255,0.28)" },
  { name: "Deep Teal", bg: "#0a141c", bg2: "#0e1c28", bg3: "#132638", accent: "#22d3ee", accent2: "#67e8f9", glow: "rgba(34,211,238,0.28)" },
  { name: "Carbon", bg: "#08090c", bg2: "#0e1014", bg3: "#171a22", accent: "#94a3b8", accent2: "#e2e8f0", glow: "rgba(148,163,184,0.28)" },
];

function applyPalette(idx) {
  const p = PALETTES[idx] || PALETTES[0];
  const r = document.documentElement.style;
  r.setProperty("--bg", p.bg);
  r.setProperty("--bg-2", p.bg2);
  r.setProperty("--bg-3", p.bg3);
  r.setProperty("--accent", p.accent);
  r.setProperty("--accent-2", p.accent2);
  r.setProperty("--accent-glow", p.glow);
}

function ScrollBar() {
  const [w, setW] = useStApp(0);
  useEffApp(() => {
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setW(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return <div className="scroll-bar" style={{ width: w + "%" }} />;
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffApp(() => { applyPalette(tweaks.palette); }, [tweaks.palette]);
  useEffApp(() => { document.documentElement.style.setProperty("--density", String(tweaks.density)); }, [tweaks.density]);
  useEffApp(() => { document.documentElement.style.setProperty("--motion", String(tweaks.motion)); }, [tweaks.motion]);

  const motion = Number(tweaks.motion) || 1;

  return (
    <>
      <ScrollBar />
      <div className="bg-grid" />
      <div className="bg-vignette" />
      <Nav />
      <Hero motion={motion} />
      <Manifesto />
      <ScrollyIntro />
      <ScrollySpine motion={motion} />
      <Services motion={motion} />
      <HistorianSection motion={motion} />
      <DashboardSection motion={motion} />
      <SymbolsSection motion={motion} />
      <SymbolPlayground motion={motion} />
      <PullQuote />
      <GoldenBatchSection motion={motion} />
      <AILiveSection motion={motion} />
      <SoftwareSection motion={motion} />
      <ProcessSection motion={motion} />
      <EcosystemSection />
      <PICasesSection />
      <LLMAskSection />
      <ContactSection />
      <Footer />
      <AskPill />

      <TweaksPanel title="Tweaks">
        <TweakSection title="Palette">
          <TweakRadio
            label="Color"
            value={tweaks.palette}
            onChange={(v) => setTweak("palette", Number(v))}
            options={PALETTES.map((p, i) => ({ value: i, label: p.name }))}
          />
        </TweakSection>
        <TweakSection title="Density">
          <TweakSlider label="Spacing" value={tweaks.density} min={0.7} max={1.4} step={0.05}
            onChange={(v) => setTweak("density", v)} />
        </TweakSection>
        <TweakSection title="Motion">
          <TweakSlider label="Speed" value={tweaks.motion} min={0.2} max={2.0} step={0.1}
            onChange={(v) => setTweak("motion", v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function ScrollyIntro() {
  return (
    <section className="section section--sm" id="journey" style={{ padding: "100px var(--gutter) 40px" }} data-screen-label="03a Spine Intro">
      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 48, alignItems: "end" }}>
        <div>
          <div className="eyebrow">The journey</div>
          <h2 style={{ marginTop: 14 }}>
            Sensor → Historian<br />
            Dashboard → Insight.
          </h2>
        </div>
        <p className="lead">
          Scroll through the lifecycle of one data point — from a flowmeter on the floor to a yield forecast in the planner's hands. Every layer is a discipline we run for our clients.
        </p>
      </div>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// Remove the instant-paint splash once React has mounted
requestAnimationFrame(() => {
  const splash = document.getElementById("bfSplash");
  if (splash) {
    splash.classList.add("out");
    setTimeout(() => splash.setAttribute("hidden", ""), 400);
  }
});
