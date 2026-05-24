// Real, published AVEVA PI System case studies with verified outcomes & links
// All data sourced from aveva.com/perspectives/success-stories or aveva.com whitepapers.

const PI_CASES = [
  {
    company: "TotalEnergies",
    industry: "Energy · Refining",
    metric: "€1.5M saved",
    sub: "64 days avoided downtime",
    body: "Built emissions-monitoring master templates in PI Asset Framework. Deployed across four refineries and 45+ pieces of combustion equipment; monitors ~85% of operational emissions.",
    href: "https://www.aveva.com/en/perspectives/success-stories/totalenergies/",
    color: "#5b8def",
  },
  {
    company: "Dr. Reddy's Laboratories",
    industry: "Pharmaceutical · India",
    metric: "90% productivity gain",
    sub: "40% reduction in quality-related cost",
    body: "WEF Global Lighthouse Network site. PI System is core to a paperless-by-2030 digital transformation across multiple certified manufacturing plants.",
    href: "https://www.aveva.com/en/perspectives/success-stories/drl/",
    color: "#7dd3fc",
  },
  {
    company: "Ontario Power Generation",
    industry: "Power · Nuclear & Renewables",
    metric: "$4M efficiency gains",
    sub: "3,000 hrs / yr maintenance eliminated",
    body: "Deployed PI System + AVEVA Predictive Analytics across nuclear and renewable fleet — over 1,200 predictive models. One early-detection event alone saved $200K at a nuclear plant.",
    href: "https://www.aveva.com/en/perspectives/blog/situational-awareness-for-grid-resilience/",
    color: "#22d3ee",
  },
  {
    company: "Dominion Energy",
    industry: "Utility · Transmission",
    metric: "28,000 assets modeled",
    sub: "42 equipment failures prevented in year 1",
    body: "Used PI Asset Framework to model substations, transformers and circuits across the grid — turning telemetry into a single contextualized network model for proactive maintenance.",
    href: "https://www.aveva.com/en/perspectives/blog/situational-awareness-for-grid-resilience/",
    color: "#5b8def",
  },
  {
    company: "ONS Brazil",
    industry: "Grid Operator · Renewables",
    metric: "211,000 MWh saved",
    sub: "$11.4M USD losses avoided (2024)",
    body: "National Electric System Operator integrated PI System with its energy management platform to optimize renewable dispatch — 98% improvement in operational communication efficiency.",
    href: "https://www.aveva.com/en/perspectives/presentations/2025/ons-brazil--maximizing-renewable-energy-utilization--the-impact-of-pi-system-on-grid-efficiency/",
    color: "#7dd3fc",
  },
  {
    company: "PJM Interconnection",
    industry: "Grid · USA East",
    metric: "Real-time grid visibility",
    sub: "Esri ArcGIS + weather + telemetry fused",
    body: "PJM combines geographic, weather and live grid data in PI System to display power-line status on a single situational-awareness map for dispatchers.",
    href: "https://www.aveva.com/en/perspectives/success-stories/pjm-uses-aveva-pi-system-to-visualize-the-electric-grid-in-real-time/",
    color: "#22d3ee",
  },
  {
    company: "Energy Queensland",
    industry: "Utility · Australia",
    metric: "Hidden grid capacity unlocked",
    sub: "Solar two-way power flow enabled",
    body: "Brings real-time data on grid infrastructure, weather and geography into PI System to manage power flow economically as large solar farms feed back into a one-way-designed grid.",
    href: "https://www.aveva.com/en/perspectives/success-stories/energy-queensland-aveva/",
    color: "#5b8def",
  },
  {
    company: "DTE Energy",
    industry: "Utility · Michigan",
    metric: "Faster outage response",
    sub: "Field crews equipped with live fault data",
    body: "Pairs distribution fault sensors with PI System to give field crews real-time outage information — restoring service to customers faster and more efficiently after grid events.",
    href: "https://www.aveva.com/content/dam/aveva/documents/perspectives/success-stories/SuccessStory_DTEEnergy.pdf.coredownload.inline.pdf",
    color: "#7dd3fc",
  },
  {
    company: "Pfizer",
    industry: "Pharmaceutical · GMP",
    metric: "2,000+ tags / PCMM line",
    sub: "Democratized production analysis",
    body: "Pfizer's portable continuous miniature & modular (PCMM) tablet line streams GMP-validated historian data into AVEVA PI Vision dashboards — enabling rapid root-cause analysis.",
    href: "https://www.aveva.com/content/dam/aveva/documents/perspectives/success-stories/SuccessStory_AVEVA_PfizerUsesAVEVAPISystem_22-09-v1.pdf",
    color: "#22d3ee",
  },
  {
    company: "LADWP",
    industry: "Water & Power · Los Angeles",
    metric: "Drought + wildfire resilience",
    sub: "Automated data collection across legacy sources",
    body: "Los Angeles Department of Water & Power uses PI System + PI Vision to maintain water reliability and safety in the face of aging infrastructure, drought and wildfire.",
    href: "https://swan-forum.com/wp-content/uploads/2022/11/AVEVA-LADWP-Case-Study.pdf",
    color: "#5b8def",
  },
];

function PICasesSection() {
  const [showAll, setShowAll] = React.useState(false);
  const visible = showAll ? PI_CASES : PI_CASES.slice(0, 6);

  return (
    <section className="section" id="pi-cases" data-screen-label="10d PI Case Studies">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">AVEVA PI System · published outcomes</div>
            <h2 style={{ marginTop: 14 }}>
              Real measured impact<br />
              <span className="gradient-text">on the stack we deploy.</span>
            </h2>
          </div>
          <p className="lead">
            Below are <strong>publicly documented case studies</strong> from AVEVA's own customer library — refineries, utilities, grid operators and pharma manufacturers running PI System at scale. Every link goes to the source. We deploy and tune this same platform for our clients.
          </p>
        </div>

        <div className="pi-grid">
          {visible.map((c) => (
            <a
              key={c.company}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pi-card"
              style={{ "--c-accent": c.color }}
            >
              <div className="pi-card__head">
                <span className="tag mono">{c.industry}</span>
                <span className="pi-card__arrow" aria-hidden="true">↗</span>
              </div>
              <div className="pi-card__metric">{c.metric}</div>
              <div className="pi-card__sub mono">{c.sub}</div>
              <h3 className="pi-card__company">{c.company}</h3>
              <p className="pi-card__body">{c.body}</p>
              <div className="pi-card__link mono">
                Read the full case study <span className="arrow">→</span>
              </div>
            </a>
          ))}
        </div>

        <div className="pi-cta-row">
          {!showAll && PI_CASES.length > 6 && (
            <button className="btn btn--ghost" onClick={() => setShowAll(true)}>
              Show {PI_CASES.length - 6} more case studies
            </button>
          )}
          <a
            href="https://www.aveva.com/en/perspectives/success-stories/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost"
          >
            Browse AVEVA's full library <span className="arrow">↗</span>
          </a>
        </div>

        <p className="eco-note mono">
          Source: aveva.com / Perspectives — Success Stories. Outcomes and figures are reproduced from AVEVA's own published case studies. Customer names are trademarks of their respective owners. Blueforge AI is an independent implementation partner, not affiliated with the trademark holders.
        </p>
      </div>
    </section>
  );
}

Object.assign(window, { PICasesSection });
