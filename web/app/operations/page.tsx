"use client";

import Link from "next/link";
import { Activity, ArrowLeft, Clock3, MessageSquareText, Target, Users, Workflow } from "lucide-react";
import { usePublicStatus } from "@/hooks/usePublicStatus";

const value = (metric: number | null, suffix = "") => metric === null ? "—" : `${metric}${suffix}`;
const feedbackUrl = "https://github.com/Kadys-dv/ALPHA-Lab/issues/new?template=alpha-pilot-feedback.yml";

export default function OperationsPage() {
  const status = usePublicStatus();
  const targets = status.targets;
  const gaps = Object.entries(status.rubric ?? {}).filter(([, count]) => count.measured > 0).sort(([, a], [, b]) => b.adjustments - a.adjustments);

  return <main className="builder-profile-page" id="main-content"><div className="builder-profile-shell">
    <Link className="builder-back-link" href="/"><ArrowLeft size={16}/> Voltar ao ALPHA Builders</Link>
    <div className="builder-profile-hero"><p>OPERAÇÃO / TELEMETRIA PÚBLICA</p><h1>Saúde do piloto.</h1><span>Dados públicos do GitHub, fórmulas explícitas e ausência representada por —.</span></div>
    <div className="builder-profile-grid operations-grid">
      <article><small><Activity size={14}/> FONTE</small><strong>{status.state}</strong><span>{status.source ? `${status.source.healthySources}/${status.source.totalSources} fontes saudáveis` : "Aguardando consulta"}</span></article>
      <article><small><Users size={14}/> INICIARAM</small><strong>{value(status.metrics.started)}</strong><span>Meta: {targets?.participants ?? 10}</span></article>
      <article><small><Workflow size={14}/> CONCLUSÃO</small><strong>{value(status.metrics.completionRate, "%")}</strong><span>{value(status.metrics.dropoffs)} desistências observadas</span></article>
      <article><small><Target size={14}/> ACEITE</small><strong>{value(status.metrics.approvalRate, "%")}</strong><span>{value(status.metrics.accepted)} de {value(status.metrics.submitted)} submissões</span></article>
      <article><small><Clock3 size={14}/> MEDIANA</small><strong>{value(status.metrics.medianReviewHours, "h")}</strong><span>P90: {value(status.metrics.p90ReviewHours, "h")} · SLA: {targets?.reviewSlaHours ?? 48}h</span></article>
      <article><small><MessageSquareText size={14}/> FEEDBACK</small><strong>{value(status.metrics.usefulRate, "%")}</strong><span>consideraram a revisão útil</span></article>
      <article><small><Workflow size={14}/> APLICAÇÃO</small><strong>{value(status.metrics.appliedRate, "%")}</strong><span>aplicaram a recomendação principal</span></article>
      <article><small><Users size={14}/> REPETIÇÃO</small><strong>{value(status.metrics.repeatIntentRate, "%")}</strong><span>declararam intenção de repetir</span></article>
    </div>
    <section className="builder-validation"><div><small>METAS 10 / 7 / 5 / 3</small><h2>Placar de decisão.</h2></div><ul>
      <li><Target size={16}/> Participantes: {value(status.metrics.started)} / {targets?.participants ?? 10}</li>
      <li><Target size={16}/> Submissões: {value(status.metrics.submitted)} / {targets?.submissions ?? 7}</li>
      <li><Target size={16}/> Builders recorrentes: {value(status.metrics.repeatBuilders)} / {targets?.repeatBuilders ?? 5}</li>
      <li><Target size={16}/> Disposição de pagar: {value(status.metrics.willingnessToPay)} / {targets?.willingnessToPay ?? 3}</li>
    </ul></section>
    <section className="builder-validation"><div><small>RUBRICA</small><h2>Pontos que mais exigem ajustes.</h2><p>Contagens derivadas somente de revisões aceitas e registradas.</p></div><ul>
      {gaps.length ? gaps.map(([criterion, count]) => <li key={criterion}>{criterion}: {count.adjustments} ajustes em {count.measured} avaliações</li>) : <li>Aguardando rubricas aceitas.</li>}
    </ul></section>
    <a className="neo-button primary" href={feedbackUrl} target="_blank" rel="noreferrer">Registrar feedback do ciclo</a>
  </div></main>;
}
