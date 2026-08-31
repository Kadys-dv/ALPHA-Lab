"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clipboard,
  Code2,
  Github,
  Network,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import PerformanceAwareAlpha from "@/components/three/PerformanceAwareAlpha";
import { useEvmWallet } from "@/hooks/useEvmWallet";
import { usePublicStatus } from "@/hooks/usePublicStatus";
import { ALPHA_CONTRACT, ALPHA_SUPPLY } from "@/lib/constants";
import {
  buildIssueUrl,
  isEvmAddress,
  normalizeGitHubEvidenceUrl,
} from "@/lib/validation";

const shortAddress = (value: string) =>
  value ? `${value.slice(0, 6)}…${value.slice(-4)}` : "";
const explorerUrl = `https://sepolia.basescan.org/address/${ALPHA_CONTRACT}`;
const repositoryUrl = "https://github.com/Kadys-dv/ALPHA-Lab";

const steps = [
  ["01", "Conecte uma carteira de teste", "O acesso é solicitado somente quando você clicar. Nenhuma assinatura é pedida."],
  ["02", "Confirme a Base Sepolia", "A experiência reconhece o Chain ID 84532 e ajuda a adicionar ou trocar a rede."],
  ["03", "Aceite o desafio piloto", "Comece pela revisão estruturada de um README público no GitHub."],
  ["04", "Faça uma contribuição pública", "Melhore contexto, instalação, decisões técnicas ou validação do projeto."],
  ["05", "Envie a evidência", "Use a URL pública do repositório ou Pull Request e sua carteira pública de testnet."],
  ["06", "Aguarde a validação", "A checagem técnica é automatizada; a aceitação final continua humana."],
  ["07", "Construa histórico verificável", "O resultado fica rastreável por GitHub e pelos dados públicos do projeto."],
] as const;

export default function AlphaBuildersApp() {
  const reducedMotion = useReducedMotion();
  const { account, error: walletError, onCorrectNetwork, connect } = useEvmWallet();
  const status = usePublicStatus();

  const [repoUrl, setRepoUrl] = useState("");
  const [wallet, setWallet] = useState("");
  const [walletTouched, setWalletTouched] = useState(false);
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState("");
  const [formState, setFormState] = useState<"idle" | "ready">("idle");
  const [copied, setCopied] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);

  const submissionWallet = walletTouched ? wallet : account;

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const copyContract = async () => {
    try {
      await navigator.clipboard.writeText(ALPHA_CONTRACT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    setFormState("idle");

    const evidenceUrl = normalizeGitHubEvidenceUrl(repoUrl);
    if (!evidenceUrl) {
      setFormError("Informe a URL HTTPS pública de um repositório ou Pull Request do github.com.");
      return;
    }
    if (!isEvmAddress(submissionWallet)) {
      setFormError("Informe um endereço EVM público válido.");
      return;
    }
    if (!consent) {
      setFormError("Confirme que você entende que o piloto usa somente testnet.");
      return;
    }

    setFormState("ready");
    window.open(
      buildIssueUrl({ evidenceUrl, wallet: submissionWallet }),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const motionProps = useMemo(
    () =>
      reducedMotion
        ? {}
        : {
            initial: { opacity: 0, y: 24 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, amount: 0.18 },
            transition: { duration: 0.55 },
          },
    [reducedMotion],
  );

  const exampleBuilder = status.builders[0];

  return (
    <main id="main-content">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="site-header">
        <a className="brand-lockup" href="#main-content" aria-label="ALPHA Builders, início">
          <span className="brand-mark">A</span>
          <span>
            <strong>ALPHA</strong>
            <small>BUILDERS / LAB</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#challenge">Desafio</a>
          <a href="#flow">Como funciona</a>
          <a href="#proof">Prova técnica</a>
          <a href="#builders">Builders</a>
        </nav>
        <div className="wallet-cluster">
          <a className="header-link" href={explorerUrl} target="_blank" rel="noreferrer">
            Contrato <ArrowUpRight size={15} />
          </a>
          <button className="neo-button compact" type="button" onClick={() => void connect()}>
            <Wallet size={17} />
            {account ? shortAddress(account) : "Conectar carteira"}
          </button>
        </div>
      </header>

      <div className="network-strip" aria-live="polite">
        <span className="network-dot" />
        <strong>Base Sepolia</strong>
        <span>Chain ID 84532</span>
        {account && (
          <span className={onCorrectNetwork ? "network-ok" : "network-warn"}>
            {onCorrectNetwork ? "Rede correta" : "Rede incorreta"}
          </span>
        )}
        {walletError && <span className="inline-error">{walletError}</span>}
      </div>

      <section className="hero-latest">
        <motion.div className="hero-copy" {...motionProps}>
          <div className="pilot-badge"><Sparkles size={15} /> Programa piloto · Base Sepolia</div>
          <h1>Aprenda construindo. <span>Prove contribuindo.</span></h1>
          <p className="hero-lead">
            Um laboratório open source para transformar pequenas contribuições públicas em evidências técnicas verificáveis — sem venda de token, sem promessa financeira e sem atalhos de portfólio.
          </p>
          <div className="hero-actions">
            <a
              className="neo-button primary"
              href="#challenge"
              onClick={!account ? (event) => { event.preventDefault(); void connect(); } : undefined}
            >
              Entrar no piloto <ArrowRight size={18} />
            </a>
            <a className="neo-button secondary" href={repositoryUrl} target="_blank" rel="noreferrer">
              <Github size={18} /> Ver código aberto
            </a>
          </div>
          <div className="hero-footnote">
            <ShieldCheck size={18} />
            Ambiente experimental de testnet. Nenhuma compra, transferência, assinatura ou taxa é solicitada.
          </div>
        </motion.div>

        <motion.div className="hero-visual" {...motionProps}>
          <div className="visual-frame">
            <span className="corner-label top-left">ALPHA CORE / TESTNET</span>
            <span className="corner-label bottom-right">84532</span>
            <PerformanceAwareAlpha />
            <div className="visual-card visual-card-a"><Network size={17} /> Base Sepolia</div>
            <div className="visual-card visual-card-b"><Code2 size={17} /> Open source</div>
          </div>
        </motion.div>
      </section>

      <section className="story-band" aria-label="Princípios do piloto">
        <div><span>01</span><strong>CONSTRUA</strong><small>uma melhoria objetiva</small></div>
        <div><span>02</span><strong>PUBLIQUE</strong><small>a evidência no GitHub</small></div>
        <div><span>03</span><strong>VALIDE</strong><small>com histórico rastreável</small></div>
      </section>

      <motion.section className="challenge-latest section-shell" id="challenge" {...motionProps}>
        <div className="section-kicker">UTILIDADE 01 / DESAFIO PILOTO</div>
        <div className="challenge-grid">
          <div className="challenge-copy">
            <h2>Revisão estruturada de <span>README.</span></h2>
            <p>
              Escolha um projeto público, identifique um ponto confuso e proponha uma melhoria objetiva na documentação. Sua contribuição permanece pública e verificável no GitHub.
            </p>
            <div className="challenge-meta">
              <div><small>ENTREGA</small><strong>Melhoria pública e rastreável</strong></div>
              <div><small>RECONHECIMENTO</small><strong>Experimental, sujeito à validação</strong></div>
            </div>
            <a className="text-link" href={repositoryUrl} target="_blank" rel="noreferrer">
              Abrir repositório <ArrowUpRight size={17} />
            </a>
          </div>

          <div className="task-panel">
            <span className="panel-index">DESAFIO / 01</span>
            <h3>O que uma boa contribuição deve melhorar?</h3>
            <ul>
              <li><Check size={17} /> Contexto e objetivo do projeto</li>
              <li><Check size={17} /> Instalação reproduzível</li>
              <li><Check size={17} /> Stack e decisões técnicas</li>
              <li><Check size={17} /> Testes e validações</li>
              <li><Check size={17} /> Demonstração quando fizer sentido</li>
            </ul>
            <div className="safety-note">
              <ShieldCheck size={19} /> Sem assinatura, transferência, approve, swap, bridge ou staking.
            </div>
          </div>
        </div>
      </motion.section>

      <section className="flow-section section-shell" id="flow">
        <div className="section-heading">
          <div className="section-kicker">COMO FUNCIONA</div>
          <h2>Da primeira conexão à sua prova pública.</h2>
        </div>
        <div className="flow-grid">
          {steps.map(([index, title, body], stepIndex) => (
            <motion.article
              className="flow-card"
              key={index}
              initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.42, delay: reducedMotion ? 0 : stepIndex * 0.045 }}
            >
              <span>{index}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <motion.section className="proof-section section-shell" id="proof" {...motionProps}>
        <div className="proof-intro">
          <div className="section-kicker">DADOS VERIFICÁVEIS</div>
          <h2>Não confie no marketing. <span>Confira a prova técnica.</span></h2>
          <p>
            Os dados abaixo são fatos públicos do projeto e da Base Sepolia. Nenhum contador financeiro ou número de usuários é inventado.
          </p>
        </div>
        <div className="proof-grid">
          <article className="proof-card featured"><small>REDE</small><strong>Base Sepolia</strong><span>Testnet EVM</span></article>
          <article className="proof-card"><small>CHAIN ID</small><strong>84532</strong><span>0x14a34</span></article>
          <article className="proof-card"><small>SUPPLY</small><strong>{ALPHA_SUPPLY}</strong><span>ALPHA</span></article>
          <article className="proof-card"><small>DECIMAIS</small><strong>18</strong><span>ERC-20</span></article>
          <article className="proof-card contract-proof">
            <small>CONTRATO</small>
            <code>{ALPHA_CONTRACT}</code>
            <div className="proof-actions">
              <button type="button" onClick={() => void copyContract()}>
                <Clipboard size={16} /> {copied ? "Copiado" : "Copiar"}
              </button>
              <a href={explorerUrl} target="_blank" rel="noreferrer">
                BaseScan <ArrowUpRight size={16} />
              </a>
            </div>
          </article>
        </div>
      </motion.section>

      <motion.section className="submission-section section-shell" id="submit" {...motionProps}>
        <div className="submission-intro">
          <div className="section-kicker">ENVIAR CONTRIBUIÇÃO</div>
          <h2>Sua evidência começa com um link público.</h2>
          <p>
            O envio continua público e auditável: validamos os dados aqui e abrimos uma Issue pré-preenchida para você revisar antes de publicar.
          </p>

          <div className="submission-steps" aria-label="Etapas da submissão">
            <div><span>01</span><strong>Valide o link e a carteira</strong></div>
            <div><span>02</span><strong>Revise a Issue no GitHub</strong></div>
            <div><span>03</span><strong>Publique e acompanhe a revisão</strong></div>
          </div>

          {exampleBuilder && (
            <a className="submission-example" href={`/builders/${exampleBuilder.issue}`}>
              Ver exemplo de contribuição aceita <ArrowUpRight size={16} />
            </a>
          )}

          <div className="wallet-status" aria-live="polite">
            <Wallet size={18} />
            {account ? (
              <>
                <strong>{shortAddress(account)}</strong>
                <span className={onCorrectNetwork ? "network-ok" : "network-warn"}>
                  {onCorrectNetwork ? "Base Sepolia" : "Troque para Base Sepolia"}
                </span>
              </>
            ) : (
              <button type="button" onClick={() => void connect()}>Conectar carteira</button>
            )}
          </div>
        </div>

        <form className="submission-form" onSubmit={submit} noValidate>
          <label htmlFor="repo-url">URL pública do repositório ou Pull Request</label>
          <input
            id="repo-url"
            type="url"
            inputMode="url"
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder="https://github.com/usuario/projeto/pull/123"
            aria-describedby="evidence-hint form-message"
            aria-invalid={Boolean(formError)}
          />
          <small className="evidence-hint" id="evidence-hint">
            Aceitamos exatamente um repositório público ou um Pull Request público do github.com.
          </small>

          <label htmlFor="wallet-address">Carteira pública de testnet</label>
          <input
            id="wallet-address"
            value={submissionWallet}
            onChange={(event) => {
              setWalletTouched(true);
              setWallet(event.target.value);
            }}
            placeholder="0x…"
            autoComplete="off"
            aria-describedby="form-message"
            aria-invalid={Boolean(formError)}
          />

          <label className="consent-row">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>
              Entendo que este piloto usa somente Base Sepolia e que ALPHA não possui oferta pública nem promessa de retorno financeiro.
            </span>
          </label>

          <div id="form-message" aria-live="polite">
            {formError && <p className="form-error" role="alert">{formError}</p>}
            {formState === "ready" && (
              <p className="form-success">
                Etapa 1 concluída. A Issue foi preparada; revise o conteúdo no GitHub antes de publicar.
              </p>
            )}
          </div>

          <button className="neo-button primary wide" type="submit">
            Preparar Issue no GitHub <ArrowUpRight size={18} />
          </button>
          <small className="privacy-copy">
            Nunca envie seed phrase, chave privada ou dados pessoais sensíveis.
          </small>
        </form>
      </motion.section>

      <section className="builders-section section-shell" id="builders">
        <div className="section-heading compact-heading">
          <div className="section-kicker">HISTÓRICO PÚBLICO</div>
          <h2>Builders aceitos.</h2>
          <p>Métricas e perfis abaixo derivam somente de Issues públicas e estados reais do pipeline.</p>
        </div>

        <div className="metrics-grid" aria-label="Métricas públicas do ALPHA Builders">
          <article className="metric-card"><small>SUBMISSÕES</small><strong>{status.metrics.submitted}</strong></article>
          <article className="metric-card"><small>EM REVISÃO</small><strong>{status.metrics.underReview}</strong></article>
          <article className="metric-card"><small>ACEITAS</small><strong>{status.metrics.accepted}</strong></article>
          <article className="metric-card"><small>TAXA DE ACEITE</small><strong>{status.metrics.approvalRate}%</strong></article>
          <article className="metric-card"><small>BUILDERS ÚNICOS</small><strong>{status.metrics.uniqueBuilders}</strong></article>
          <article className="metric-card"><small>PROJETOS</small><strong>{status.metrics.distinctProjects}</strong></article>
        </div>

        {status.builders.length === 0 ? (
          <div className="empty-builders">
            <span>0</span>
            <p>Nenhuma contribuição aceita ainda. O histórico começa quando houver evidência real.</p>
          </div>
        ) : (
          <div className="builders-grid">
            {status.builders.map((builder) => (
              <article className="builder-card" key={builder.issue}>
                <span className="accepted-pill"><Check size={14} /> Accepted</span>
                <h3>Issue #{builder.issue}</h3>
                <code>{builder.wallet}</code>
                <div className="builder-card-actions">
                  <a href={`/builders/${builder.issue}`}>Perfil público <ArrowUpRight size={15} /></a>
                  <a href={builder.evidenceUrl} target="_blank" rel="noreferrer">
                    Evidência <ArrowUpRight size={15} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark">A</span>
          <div><strong>ALPHA Builders</strong><small>Open source · Base Sepolia</small></div>
        </div>
        <div className="footer-links">
          <a href={repositoryUrl} target="_blank" rel="noreferrer">GitHub</a>
          <a href={explorerUrl} target="_blank" rel="noreferrer">Contrato</a>
        </div>
        <p>
          ALPHA é um token experimental de testnet. Não está à venda, não representa participação societária, investimento ou promessa de retorno financeiro.
        </p>
      </footer>

      {stickyVisible && !stickyDismissed && (
        <motion.aside
          className="sticky-pilot"
          initial={reducedMotion ? undefined : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          aria-label="Atalho para o desafio piloto"
        >
          <div><small>PRONTO PARA COMEÇAR?</small><strong>Construa sua primeira prova pública.</strong></div>
          <a href="#challenge">Começar desafio <ArrowRight size={16} /></a>
          <button type="button" onClick={() => setStickyDismissed(true)} aria-label="Dispensar atalho">
            <X size={17} />
          </button>
        </motion.aside>
      )}
    </main>
  );
}
