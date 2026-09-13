import { Code2, Github, Network, ShieldCheck } from "lucide-react";

export default function PurposePanel() {
  return (
    <section className="purpose-panel" aria-labelledby="purpose-title">
      <div className="purpose-heading">
        <ShieldCheck size={28} aria-hidden="true" />
        <div>
          <h2 id="purpose-title">Propósito do ALPHA Builders</h2>
          <p>Fortalecer portfólios com código aberto real, rastreável e verificável. Aqui, cada contribuição deixa um rastro técnico que fala por você.</p>
        </div>
      </div>
      <div className="story-band" aria-label="Princípios do piloto">
        <div><Github size={26} aria-hidden="true" /><strong>Aberto</strong><small>Tudo é público e auditável.</small></div>
        <div><ShieldCheck size={26} aria-hidden="true" /><strong>Verificável</strong><small>Evidências técnicas on-chain e off-chain.</small></div>
        <div><Code2 size={26} aria-hidden="true" /><strong>Sem token à venda</strong><small>Sem venda, sem rendimento e sem promessa financeira.</small></div>
        <div><Network size={26} aria-hidden="true" /><strong>Para builders</strong><small>Feito para transformar contribuição em prova técnica.</small></div>
      </div>
    </section>
  );
}
