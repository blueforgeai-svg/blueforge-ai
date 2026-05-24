// High-impact "moment" sections: manifesto, big-stats, quote
const { useEffect: useEffM, useState: useStM, useRef: useRefM } = React;

function useInView(threshold = 0.2) {
  const ref = useRefM(null);
  const [seen, setSeen] = useStM(false);
  useEffM(() => {
    if (!ref.current || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setSeen(true); },
      { threshold }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen];
}

function CountUp({ to, suffix = "", duration = 1600, decimals = 0 }) {
  const [ref, seen] = useInView(0.4);
  const [val, setVal] = useStM(0);
  useEffM(() => {
    if (!seen) return;
    let raf, start;
    const tick = (t) => {
      if (!start) start = t;
      const k = Math.min(1, (t - start) / duration);
      const ease = 1 - Math.pow(1 - k, 3);
      setVal(to * ease);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen]);
  return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>;
}

function Manifesto() {
  return (
    <section className="section section--sm manifesto" data-screen-label="01c Manifesto">
      <div className="container">
        <div className="manifesto__inner">
          <div className="manifesto__eyebrow eyebrow">Our position</div>
          <h2 className="manifesto__line">
            <span className="manifesto__strike">Dashboards don't run plants.</span>
            <span className="manifesto__strike">Models don't run plants.</span>
            <span>Operators do — and they need the right number, on the right screen, at the right moment.</span>
          </h2>
          <p className="manifesto__signoff mono">— That's the only KPI we measure ourselves by.</p>
        </div>
      </div>
    </section>
  );
}

function BigStats() {
  // Removed: unverified vanity stats (tags piped, model count, uptime) — site is too
  // young to claim a track record. Kept the named export hollow so app.jsx imports
  // don't break until next refactor; renders nothing.
  return null;
}

function PullQuote() {
  return (
    <section className="section pull-quote" data-screen-label="06c Pull Quote">
      <div className="container">
        <div className="pull-quote__mark" aria-hidden="true">"</div>
        <p className="pull-quote__body">
          A historian without a model is a graveyard for data.<br />
          A model without operators is a science project.<br />
          <span className="gradient-text">Our job is to wire all three into one nervous system.</span>
        </p>
        <div className="pull-quote__attr mono">Blueforge AI · operating principle no. 01</div>
      </div>
    </section>
  );
}

Object.assign(window, { Manifesto, BigStats, PullQuote, CountUp });
