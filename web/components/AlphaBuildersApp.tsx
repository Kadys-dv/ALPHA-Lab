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
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import FloatingAlpha from "@/components/three/FloatingAlpha";
import { ALPHA_CONTRACT, ALPHA_SUPPLY, BASE_SEPOLIA } from "@/lib/constants";
import { buildIssueUrl, isEvmAddress, normalizeGitHubRepoUrl } from "@/lib/validation";

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, cb: (...args: unknown[]) => void): void;
  removeListener?(event: string, cb: (...args: unknown[]) => void): void;
};

type PublicStatus = {
  metrics: { submitted: number; underReview: number; accepted: number };
  builders: Array<{ issue: number; repoUrl: string; wallet: string; status: string }>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const shortAddress = (value: string) => (value ? `${value.slice(0, 6)}…${value.slice(-4)}` : "");
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
  const [account, setAccount] = useState("");
  const [chain, setChain] = useState("");
  const [walletError, setWalletError] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [wallet, setWallet] = useState("");
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState("");
  const [formState, setFormState] = useState<"idle" | "ready">("idle");
  const [copied, setCopied] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);
  const [status, setStatus] = useState<PublicStatus>({
    metrics: { submitted: 0, underReview: 0, accepted: 0 },
    builders: [],
  });

  const provider = typeof window !== "undefined" ? window.ethereum : undefined;
  const onCorrectNetwork = chain === BASE_SEPOLIA.chainIdHex;

  const syncWallet = useCallback(async () => {
    if (!provider) return;
    const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
    const currentChain = (await provider.request({ method: "eth_chainId" })) as string;
    setAccount(accounts[0] ?? "");
    setWallet(accounts[0] ?? "");
    setChain(currentChain);
  }, [provider]);

  useEffect(() => {
    void fetch("/api/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((value) => {
        if (value) setStatus(value as PublicStatus);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!provider) return;
    let active = true;

    void Promise.all([
      provider.request({ method: "eth_accounts" }),
      provider.request({ method: "eth_chainId" }),
    ])
      .then(([accounts, currentChain]) => {
        if (!active) return;
        const list = accounts as string[];
        const nextAccount = list[0] ?? "";
        setAccount(nextAccount);
        setWallet(nextAccount);
        setChain(String(currentChain));
      })
      .catch(() => undefined);

    const onAccountsChanged = (value: unknown) => {
      const nextAccount = Array.isArray(value) ? String(value[0] ?? "") : "";
      setAccount(nextAccount);
      setWallet(nextAccount);
    };
    const onChainChanged = (value: unknown) => setChain(String(value));
    const onDisconnect = () => {
      setAccount("");
      setWallet("");
      setChain("");
    };

    provider.on?.("accountsChanged", onAccountsChanged);
    provider.on?.("chainChanged", onChainChanged);
    provider.on?.("disconnect", onDisconnect);

    return () => {
      active = false;
      provider.removeListener?.("accountsChanged", onAccountsChanged);
      provider.removeListener?.("chainChanged", onChainChanged);
      provider.removeListener?.("disconnect", onDisconnect);
    };
  }, [provider]);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const connect = async () => {
    setWalletError("");
    if (!provider) {
      setWalletError("Nenhuma carteira EVM compatível foi detectada neste navegador.");
      return;
    }

    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const nextAccount = accounts[0] ?? "";
      setAccount(nextAccount);
      setWallet(nextAccount);

      const current = (await provider.request({ method: "eth_chainId" })) as string;
      if (current !== BASE_SEPOLIA.chainIdHex) {
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BASE_SEPOLIA.chainIdHex }],
          });
        } catch {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: BASE_SEPOLIA.chainIdHex,
                chainName: BASE_SEPOLIA.chainName,
                nativeCurrency: BASE_SEPOLIA.nativeCurrency,
                rpcUrls: BASE_SEPOLIA.rpcUrls,
                blockExplorerUrls: BASE_SEPOLIA.blockExplorerUrls,
              },
            ],
          });
        }
      }
      await syncWallet();
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? String((error as { code?: unknown }).code)
          : "";
      setWalletError(
        code === "4001"
          ? "Conexão cancelada na carteira."
          : "Não foi possível conectar ou configurar a carteira.",
      );
    }
  };

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

    if (!normalizeGitHubRepoUrl(repoUrl)) {
      setFormError("Informe uma URL HTTPS pública e válida do github.com.");
      return;
    }
    if (!isEvmAddress(wallet)) {
      setFormError("Informe um endereço EVM público válido.");
      return;
    }
    if (!consent) {
      setFormError("Confirme que você entende que o piloto usa somente testnet.");
      return;
    }

    setFormState("ready");
    window.open(buildIssueUrl({ repoUrl, wallet }), "_blank", "noopener,noreferrer");
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

  return (
    <main id="top">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="ALPHA Builders, início">
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
          <button className="neo-button compact" type="button" onClick={connect}>
            <Wallet size={17} />
            {account ? shortAddress(account) : "Conectar carteira"}
          </button>
        </div>
      </header>

      <div className="network-strip" aria-live="polite">
        <span className="network-dot" />
        <strong>Base Sepolia</strong>
        <span>Chain ID 84532</span>
        {account && <span className={onCorrectNetwork ? "network-ok" : "network-warn"}>{onCorrectNetwork ? "Rede correta" : "Rede incorreta"}</span>}
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
            <a className="neo-button primary" href={account ? "#challenge" : "#challenge"} onClick={!account ? (event) => { event.preventDefault(); void connect(); } : undefined}>
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
            <FloatingAlpha />
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
            <a className="text-link" href={repositoryUrl} target="_blank" rel="noreferrer">Abrir repositório <ArrowUpRight size={17} /></a>
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
            <div className="safety-note"><ShieldCheck size={19} /> Sem assinatura, transferência, approve, swap, bridge ou staking.</div>
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
          <p>Os dados abaixo são fatos públicos do projeto e da Base Sepolia. Nenhum contador financeiro ou número de usuários é inventado.</p>
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
              <button type="button" onClick={copyContract}><Clipboard size={16} /> {copied ? "Copiado" : "Copiar"}</button>
              <a href={explorerUrl} target="_blank" rel="noreferrer">BaseScan <ArrowUpRight size={16} /></a>
            </div>
          </article>
        </div>
      </motion.section>

      <motion.section className="submission-section section-shell" id="submit" {...motionProps}>
        <div className="submission-intro">
          <div className="section-kicker">ENVIAR CONTRIBUIÇÃO</div>
          <h2>Sua evidência começa com um link público.</h2>
          <p>Sem backend proprietário nesta etapa: o envio abre uma Issue pré-preenchida no ALPHA-Lab para manter o processo público e auditável.</p>
          <div className="wallet-status" aria-live="polite">
            <Wallet size={18} />
            {account ? <><strong>{shortAddress(account)}</strong><span className={onCorrectNetwork ? "network-ok" : "network-warn"}>{onCorrectNetwork ? "Base Sepolia" : "Troque para Base Sepolia"}</span></> : <button type="button" onClick={connect}>Conectar carteira</button>}
          </div>
        </div>

        <form className="submission-form" onSubmit={submit} noValidate>
          <label htmlFor="repo-url">URL pública do GitHub</label>
          <input id="repo-url" type="url" inputMode="url" value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="https://github.com/usuario/projeto" aria-describedby={formError ? "form-message" : undefined} />

          <label htmlFor="wallet-address">Carteira pública de testnet</label>
          <input id="wallet-address" value={wallet} onChange={(event) => setWallet(event.target.value)} placeholder="0x…" autoComplete="off" aria-describedby={formError ? "form-message" : undefined} />

          <label className="consent-row">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span>Entendo que este piloto usa somente Base Sepolia e que ALPHA não possui oferta pública nem promessa de retorno financeiro.</span>
          </label>

          <div id="form-message" aria-live="polite">
            {formError && <p className="form-error" role="alert">{formError}</p>}
            {formState === "ready" && <p className="form-success">Issue preparada. Revise o conteúdo no GitHub antes de enviar.</p>}
          </div>

          <button className="neo-button primary wide" type="submit">Enviar contribuição <ArrowUpRight size={18} /></button>
          <small className="privacy-copy">Nunca envie seed phrase, chave privada ou dados pessoais sensíveis.</small>
        </form>
      </motion.section>

      <section className="builders-section section-shell" id="builders">
        <div className="section-heading compact-heading">
          <div className="section-kicker">HISTÓRICO PÚBLICO</div>
          <h2>Builders aceitos.</h2>
          <p>Esta área nasce somente de Issues públicas aceitas após revisão humana.</p>
        </div>
        {status.builders.length === 0 ? (
          <div className="empty-builders"><span>0</span><p>Nenhuma contribuição aceita ainda. O histórico começa quando houver evidência real.</p></div>
        ) : (
          <div className="builders-grid">
            {status.builders.map((builder) => (
              <article className="builder-card" key={builder.issue}>
                <span className="accepted-pill"><Check size={14} /> Accepted</span>
                <h3>Issue #{builder.issue}</h3>
                <a href={builder.repoUrl} target="_blank" rel="noreferrer">Abrir projeto <ArrowUpRight size={16} /></a>
                <code>{builder.wallet}</code>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="site-footer">
        <div className="footer-brand"><span className="brand-mark">A</span><div><strong>ALPHA Builders</strong><small>Open source · Base Sepolia</small></div></div>
        <div className="footer-links"><a href={repositoryUrl} target="_blank" rel="noreferrer">GitHub</a><a href={explorerUrl} target="_blank" rel="noreferrer">Contrato</a></div>
        <p>ALPHA é um token experimental de testnet. Não está à venda, não representa participação societária, investimento ou promessa de retorno financeiro.</p>
      </footer>

      {stickyVisible && !stickyDismissed && (
        <motion.aside className="sticky-pilot" initial={reducedMotion ? undefined : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} aria-label="Atalho para o desafio piloto">
          <div><small>PRONTO PARA COMEÇAR?</small><strong>Construa sua primeira prova pública.</strong></div>
          <a href="#challenge">Começar desafio <ArrowRight size={16} /></a>
          <button type="button" onClick={() => setStickyDismissed(true)} aria-label="Dispensar atalho"><X size={17} /></button>
        </motion.aside>
      )}
    </main>
  );
}
