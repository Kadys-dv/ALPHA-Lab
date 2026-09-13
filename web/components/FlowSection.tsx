type FlowStep = readonly [string, string, string];

export default function FlowSection({ steps }: { steps: readonly FlowStep[] }) {
  return (
    <section className="flow-section section-shell" id="flow">
      <div className="section-heading">
        <div className="section-kicker">COMO FUNCIONA</div>
        <h2>Da primeira conexão à sua prova pública.</h2>
      </div>
      <div className="flow-grid">
        {steps.map(([index, title, body]) => (
          <article className="flow-card" key={index}>
            <span>{index}</span><h3>{title}</h3><p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
