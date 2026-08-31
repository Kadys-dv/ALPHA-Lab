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
import { useEffect, useMemo, useState } from "react";
import BuildersSection from "@/components/builders/BuildersSection";
import SubmissionSection from "@/components/submission/SubmissionSection";
import PerformanceAwareAlpha from "@/components/three/PerformanceAwareAlpha";
import { useEvmWallet } from "@/hooks/useEvmWallet";
import { usePublicStatus } from "@/hooks/usePublicStatus";
import { ALPHA_CONTRACT, ALPHA_SUPPLY } from "@/lib/constants";

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

  const [copied, setCopied] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);

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
            <a className="neo-button primary" href="#challenge">
              Ver desafios <ArrowRight size={18} />
            </a>
            <a className="neo-button secondary" href="#flow">
              <Code2 size={18} /> Como funciona
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

      <SubmissionSection
        account={account}
        onCorrectNetwork={onCorrectNetwork}
        connect={connect}
        reducedMotion={Boolean(reducedMotion)}
        exampleBuilderIssue={exampleBuilder?.issue}
      />

      <BuildersSection status={status} />

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
