"use client";

import Link from "next/link";
import { Activity, ArrowLeft, Clock3, MessageSquareText, Target, Users, Workflow } from "lucide-react";
import { usePublicStatus } from "@/hooks/usePublicStatus";

const value = (metric: number | null, suffix = "") => metric === null ? "-" : `${metric}${suffix}`;
const feedbackUrl = "https://github.com/Kadys-dv/ALPHA-Lab/issues/new?template=alpha-pilot-feedback.yml";
const rubricLabels: Record<string, string> = { context: "Contexto", installation: "Instalacao", decisions: "Decisoes tecnicas", tests: "Testes e validacoes", demo: "Demonstracao" };

function Goal({ label, current, target }: { label: string; current: number | null; target: number }) {
  return <li className="pilot-goal"><span><Target size={16}/> {label}: {value(current)} / {target}</span><progress aria-label={`Progresso de ${label}`} max={target} value={current ?? 0}/></li>;
}

export default function OperationsPage() {
  const status = usePublicStatus();
  const targets = status.targets;
  const gaps = Object.entries(status.rubric ?? {}).filter(([, count]) => count.measured > 0).sort(([, a], [, b]) => b.adjustments - a.adjustments);

  return <main className="builder-profile-page" id="main-content"><div className="builder-profile-shell">
    <Link className="builder-back-link" href="/"><ArrowLeft size={16}/> Voltar ao ALPHA Builders</Link>
    <div className="builder-profile-hero"><p>OPERACAO / TELEMETRIA PUBLICA</p><h1>Saude do piloto.</h1><span>Dados publicos do GitHub, formulas explicitas e ausencia representada por -.</span></div>
    <div className="builder-profile-grid operations-grid">
      <article><small><Activity size={14}/> FONTE</small><strong>{status.state}</strong><span>{status.source ? `${status.source.healthySources}/${status.source.totalSources} fontes saudaveis` : "Aguardando consulta"}</span></article>
      <article><small><Users size={14}/> INICIARAM</small><strong>{value(status.metrics.started)}</strong><span>Meta: {targets?.participants ?? 10}</span></article>
      <article><small><Workflow size={14}/> CONCLUSAO</small><strong>{value(status.metrics.completionRate, "%")}</strong><span>{value(status.metrics.dropoffs)} desistencias observadas</span></article>
      <article><small><Target size={14}/> ACEITE</small><strong>{value(status.metrics.approvalRate, "%")}</strong><span>{value(status.metrics.accepted)} de {value(status.metrics.submitted)} submissoes</span></article>
      <article><small><Clock3 size={14}/> MEDIANA</small><strong>{value(status.metrics.medianReviewHours, "h")}</strong><span>P90: {value(status.metrics.p90ReviewHours, "h")} / SLA: {targets?.reviewSlaHours ?? 48}h</span></article>
      <article><small><MessageSquareText size={14}/> FEEDBACK</small><strong>{value(status.metrics.usefulRate, "%")}</strong><span>{value(status.metrics.privateFeedbackRequests)} pediram retorno privado</span></article>
      <article><small><Workflow size={14}/> APLICACAO</small><strong>{value(status.metrics.appliedRate, "%")}</strong><span>aplicaram a recomendacao principal</span></article>
      <article><small><Users size={14}/> REPETICAO</small><strong>{value(status.metrics.repeatIntentRate, "%")}</strong><span>declararam intencao de repetir</span></article>
    </div>
    <section className="builder-validation"><div><small>METAS 10 / 7 / 5 / 3</small><h2>Placar de decisao.</h2></div><ul className="pilot-goals">
      <Goal label="Participantes" current={status.metrics.started} target={targets?.participants ?? 10}/>
      <Goal label="Submissoes" current={status.metrics.submitted} target={targets?.submissions ?? 7}/>
      <Goal label="Builders recorrentes" current={status.metrics.repeatBuilders} target={targets?.repeatBuilders ?? 5}/>
      <Goal label="Disposicao de pagar" current={status.metrics.willingnessToPay} target={targets?.willingnessToPay ?? 3}/>
    </ul></section>
    <section className="builder-validation"><div><small>FILA SLA</small><h2>Revisoes em aberto.</h2><p>Ordenado por idade da Issue em under-review.</p></div><ul>
      {status.reviewQueue?.length ? status.reviewQueue.map((item) => <li key={item.issue}>#{item.issue} por @{item.author}: {value(item.ageHours, "h")} {item.slaBreached ? "fora do SLA" : "no SLA"}</li>) : <li>Nenhuma revisao em aberto.</li>}
    </ul></section>
    <section className="builder-validation"><div><small>COORTE</small><h2>Participantes iniciados.</h2><p>Primeiros registros publicos do ciclo piloto.</p></div><ul>
      {status.startedCohort?.length ? status.startedCohort.map((item) => <li key={item.issue}>#{item.issue} @{item.author}{item.repository ? ` / ${item.repository}` : ""}</li>) : <li>Aguardando inicios de ciclo.</li>}
    </ul></section>
    <section className="builder-validation"><div><small>RUBRICA v{status.rubricVersion ?? 1}</small><h2>Pontos que mais exigem ajustes.</h2><p>Contagens derivadas somente de revisoes aceitas e registradas.</p></div><ul>
      {gaps.length ? gaps.map(([criterion, count]) => <li key={criterion}>{rubricLabels[criterion] ?? criterion}: {count.adjustments} ajustes em {count.measured} avaliacoes</li>) : <li>Aguardando rubricas aceitas.</li>}
    </ul></section>
    <a className="neo-button primary" href={feedbackUrl} target="_blank" rel="noreferrer">Registrar feedback do ciclo</a>
  </div></main>;
}
