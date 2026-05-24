// Floating "Ask us" pill + ecosystem references section
const { useState: useER, useEffect: useEffER } = React;

function AskPill() {
  const [visible, setVisible] = useER(false);
  const [hidden, setHidden] = useER(false);
  useEffER(() => {
    const on = () => setVisible(window.scrollY > 600);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  if (hidden) return null;
  return (
    <a
      href="#ask"
      className={"ask-pill" + (visible ? " ask-pill--in" : "")}
      aria-label="Need information? Ask our AI assistant"
    >
      <span className="ask-pill__dot" />
      <span className="ask-pill__body">
        <span className="ask-pill__lbl">Need info?</span>
        <span className="ask-pill__sub">Ask our AI</span>
      </span>
      <button
        className="ask-pill__close"
        onClick={(e) => { e.preventDefault(); setHidden(true); }}
        aria-label="Dismiss"
      >×</button>
    </a>
  );
}

const ECOSYSTEM_REFS = [
  {
    vendor: "AVEVA PI System",
    role: "Plant historian we deploy and tune",
    blurb: "AVEVA's industrial information platform — used by 24 of the top 25 oil and gas companies and most major utilities, chemicals and pharma operators worldwide.",
    cta: "AVEVA customer stories",
    href: "https://www.aveva.com/en/about/customer-stories/",
    examples: ["Saudi Aramco", "Duke Energy", "Air Liquide", "Marathon Petroleum"],
  },
  {
    vendor: "Canary Labs Historian",
    role: "Lightweight historian we deploy at mid-scale sites",
    blurb: "Trusted by manufacturers, utilities and packagers as a cost-effective, no-tag-fee alternative to enterprise historians.",
    cta: "Canary success stories",
    href: "https://www.canarylabs.com/customer-success",
    examples: ["Mauser Packaging", "Bridgestone", "Whirlpool", "Vincit Oy"],
  },
  {
    vendor: "TDengine",
    role: "High-performance time-series database we deploy at scale",
    blurb: "Purpose-built open-source time-series DB for IIoT and connected vehicles. Powers some of the largest telemetry workloads in industry.",
    cta: "TDengine customers",
    href: "https://tdengine.com/customers/",
    examples: ["China Telecom", "Lenovo", "BYD", "Geely"],
  },
];

function EcosystemSection() {
  return (
    <section className="section" id="ecosystem" data-screen-label="10c Ecosystem">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Ecosystem proof</div>
            <h2 style={{ marginTop: 14 }}>
              The stack we deploy<br />
              <span className="gradient-text">is already trusted by giants.</span>
            </h2>
          </div>
          <p className="lead">
            We don't expect you to take our word for what AVEVA PI, Canary or TDengine can do — explore the published customer stories from the vendors themselves. We're the team that turns that platform into your outcomes.
          </p>
        </div>

        <div className="eco-grid">
          {ECOSYSTEM_REFS.map((v) => (
            <a key={v.vendor} href={v.href} target="_blank" rel="noopener noreferrer" className="eco-card">
              <div className="eco-card__top">
                <span className="tag">VENDOR · PUBLIC REFERENCES</span>
                <span className="eco-card__arrow" aria-hidden="true">↗</span>
              </div>
              <h3 className="eco-card__title">{v.vendor}</h3>
              <div className="eco-card__role mono">{v.role}</div>
              <p className="eco-card__blurb">{v.blurb}</p>
              <div className="eco-card__logos">
                {v.examples.map((e) => (
                  <span key={e} className="eco-logo">{e}</span>
                ))}
              </div>
              <div className="eco-card__cta mono">
                {v.cta} <span className="arrow">→</span>
              </div>
            </a>
          ))}
        </div>

        <p className="eco-note mono">
          External links open in a new tab. Customer names are publicly disclosed by the vendors. Blueforge AI is an independent implementation partner — not affiliated with the trademark holders.
        </p>
      </div>
    </section>
  );
}

Object.assign(window, { AskPill, EcosystemSection });
