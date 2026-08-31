import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Github, ShieldCheck } from "lucide-react";
import { getAcceptedBuilder } from "@/lib/builders";

type Params = Promise<{ issue: string }>;

function asIssue(value: string) {
  const issue = Number(value);
  return Number.isSafeInteger(issue) && issue > 0 ? issue : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { issue: rawIssue } = await params;
  const issue = asIssue(rawIssue);
  if (!issue) return { title: "Builder não encontrado | ALPHA Builders" };

  const builder = await getAcceptedBuilder(issue);
  if (!builder) return { title: "Builder não encontrado | ALPHA Builders" };

  return {
    title: `Builder #${builder.issue} | ALPHA Builders`,
    description: "Contribuição pública aceita e verificável no ALPHA Builders.",
    alternates: { canonical: `/builders/${builder.issue}` },
    openGraph: {
      title: `Builder #${builder.issue} | ALPHA Builders`,
      description: "Contribuição pública aceita e verificável no ALPHA Builders.",
      type: "article",
      url: `/builders/${builder.issue}`,
    },
  };
}

export default async function BuilderProfile({ params }: { params: Params }) {
  const { issue: rawIssue } = await params;
  const issue = asIssue(rawIssue);
  if (!issue) notFound();

  const builder = await getAcceptedBuilder(issue);
  if (!builder) notFound();

  const acceptedDate = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(builder.updatedAt));

  return (
    <main className="builder-profile-page" id="main-content">
      <div className="builder-profile-shell">
        <Link className="builder-back-link" href="/#builders">
          <ArrowLeft size={17} /> Voltar para Builders
        </Link>

        <div className="builder-profile-status">
          <Check size={16} /> Contribuição aceita
        </div>

        <header className="builder-profile-hero">
          <p>ALPHA BUILDERS / PROVA PÚBLICA</p>
          <h1>Builder #{builder.issue}</h1>
          <span>
            Evidência pública, revisada e rastreável por GitHub. Nenhuma classificação financeira é atribuída a esta contribuição.
          </span>
        </header>

        <section className="builder-profile-grid" aria-label="Dados verificáveis da contribuição">
          <article>
            <small>PROJETO</small>
            <strong>{new URL(builder.repoUrl).pathname.slice(1)}</strong>
            <a href={builder.repoUrl} target="_blank" rel="noreferrer">
              Abrir repositório <ArrowUpRight size={16} />
            </a>
          </article>

          <article>
            <small>EVIDÊNCIA</small>
            <strong>{builder.evidenceUrl.includes("/pull/") ? "Pull Request" : "Repositório"}</strong>
            <a href={builder.evidenceUrl} target="_blank" rel="noreferrer">
              Ver contribuição <ArrowUpRight size={16} />
            </a>
          </article>

          <article>
            <small>IDENTIDADE TESTNET</small>
            <strong>{builder.wallet}</strong>
            <span>Endereço exibido de forma abreviada.</span>
          </article>

          <article>
            <small>VALIDAÇÃO</small>
            <strong>{acceptedDate}</strong>
            <a href={builder.issueUrl} target="_blank" rel="noreferrer">
              Issue #{builder.issue} <Github size={16} />
            </a>
          </article>
        </section>

        <aside className="builder-profile-note">
          <ShieldCheck size={20} />
          <p>
            O perfil registra somente dados públicos necessários para comprovar a contribuição. ALPHA permanece um experimento de testnet e não representa investimento, rendimento ou participação societária.
          </p>
        </aside>
      </div>
    </main>
  );
}
