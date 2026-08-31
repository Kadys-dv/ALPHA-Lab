"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Wallet } from "lucide-react";
import { FormEvent, useState } from "react";
import { buildIssueUrl, isEvmAddress, normalizeGitHubEvidenceUrl } from "@/lib/validation";

type Props = {
  account: string;
  onCorrectNetwork: boolean;
  connect: () => Promise<void>;
  reducedMotion: boolean;
  exampleBuilderIssue?: number;
};

const shortAddress = (value: string) =>
  value ? `${value.slice(0, 6)}…${value.slice(-4)}` : "";

export default function SubmissionSection({
  account,
  onCorrectNetwork,
  connect,
  reducedMotion,
  exampleBuilderIssue,
}: Props) {
  const [repoUrl, setRepoUrl] = useState("");
  const [wallet, setWallet] = useState("");
  const [walletTouched, setWalletTouched] = useState(false);
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState("");
  const [formState, setFormState] = useState<"idle" | "ready">("idle");
  const submissionWallet = walletTouched ? wallet : account;

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

  return (
    <motion.section
      className="submission-section section-shell"
      id="submit"
      initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55 }}
    >
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

        {exampleBuilderIssue && (
          <a className="submission-example" href={`/builders/${exampleBuilderIssue}`}>
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
  );
}
