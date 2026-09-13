const LABELS = {
  submission: ["1d76db", "ALPHA Builders public submission"],
  "under-review": ["fbca04", "Waiting for human review"],
  valid: ["0e8a16", "Technical checks passed"],
  invalid: ["d73a4a", "Technical checks failed"],
  "needs-review": ["5319e7", "Requires manual inspection"],
  accepted: ["2ea44f", "Accepted after human review"],
};

const ACCEPTED_MARKER = /<!-- alpha-accepted-at: ([^ ]+) -->/;
const REVIEW_MARKER = "<!-- alpha-review -->";
const REVIEWERS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);
const CRITERIA = [
  ["context", "Contexto e objetivo"],
  ["installation", "Instalação reproduzível"],
  ["decisions", "Decisões técnicas"],
  ["tests", "Testes e validações"],
  ["demo", "Demonstração"],
];
const RATINGS = new Set(["aprovado", "ajustes necessários", "não se aplica"]);

function reviewField(body, name) {
  return body.match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, "im"))?.[1]?.trim();
}

function parseReview(comment) {
  if (!comment?.body?.includes(REVIEW_MARKER) || !REVIEWERS.has(comment.author_association)) return null;
  const criteria = Object.fromEntries(CRITERIA.map(([key, label]) => [key, reviewField(comment.body, label)?.toLowerCase()]));
  const result = reviewField(comment.body, "Resultado")?.toLowerCase();
  const recommendation = reviewField(comment.body, "Recomendação");
  if (Object.values(criteria).some((value) => !RATINGS.has(value)) || !["aprovado", "ajustes necessários", "reprovado"].includes(result) || !recommendation) return null;
  return { criteria, result, recommendation: recommendation.slice(0, 500), reviewer: comment.user?.login ?? "unknown" };
}

function field(body, name, pattern) {
  return body.match(new RegExp(`^${name}:\\s*(${pattern})\\s*$`, "im"))?.[1]
    ?? body.match(new RegExp(`### ${name}\\s+\\n\\s*(${pattern})`, "im"))?.[1];
}

function parseSubmission(body) {
  const repository = field(body, "Repository", "https:\\/\\/github\\.com\\/[^\\s/]+\\/[^\\s/]+");
  const evidence = field(body, "Evidence", "https:\\/\\/github\\.com\\/\\S+") ?? repository;
  const wallet = field(body, "Wallet", "0x[a-fA-F0-9]{40}");
  const nonce = field(body, "Nonce", "0x[a-fA-F0-9]{64}");
  const signature = field(body, "Signature", "0x[a-fA-F0-9]{130}");
  if (!repository || !evidence || !wallet || !nonce || !signature) return null;

  try {
    const repoUrl = new URL(repository);
    const evidenceUrl = new URL(evidence);
    const repoParts = repoUrl.pathname.split("/").filter(Boolean);
    const evidenceParts = evidenceUrl.pathname.split("/").filter(Boolean);
    const sameRepo = repoParts[0]?.toLowerCase() === evidenceParts[0]?.toLowerCase()
      && repoParts[1]?.replace(/\.git$/, "").toLowerCase() === evidenceParts[1]?.replace(/\.git$/, "").toLowerCase();
    const validRepo = repoUrl.protocol === "https:" && repoUrl.hostname === "github.com" && repoParts.length === 2;
    const validEvidence = evidenceUrl.protocol === "https:" && evidenceUrl.hostname === "github.com"
      && (evidenceParts.length === 2 || (evidenceParts.length === 4 && evidenceParts[2] === "pull" && /^\d+$/.test(evidenceParts[3])));
    if (!validRepo || !validEvidence || !sameRepo) return null;
    return {
      owner: repoParts[0],
      repo: repoParts[1].replace(/\.git$/, ""),
      evidenceParts,
      wallet,
      nonce,
      signature,
    };
  } catch {
    return null;
  }
}

async function setState(github, context, issueNumber, state) {
  const states = {
    invalid: ["submission", "invalid"],
    review: ["submission", "valid", "under-review"],
    needsReview: ["submission", "needs-review"],
    accepted: ["submission", "valid", "accepted"],
  };
  await github.rest.issues.setLabels({ ...context.repo, issue_number: issueNumber, labels: states[state] });
}

async function ensureLabels(github, context) {
  for (const [name, [color, description]] of Object.entries(LABELS)) {
    try {
      await github.rest.issues.getLabel({ ...context.repo, name });
    } catch (error) {
      if (error.status !== 404) throw error;
      await github.rest.issues.createLabel({ ...context.repo, name, color, description });
    }
  }
}

async function findReview(github, context, issueNumber) {
  const comments = await github.paginate(github.rest.issues.listComments, { ...context.repo, issue_number: issueNumber, per_page: 100 });
  return comments.toReversed().map(parseReview).find(Boolean) ?? null;
}

async function markAccepted({ github, context, issue, recordAcceptance, review }) {
  await setState(github, context, issue.number, "accepted");
  if (!recordAcceptance || ACCEPTED_MARKER.test(issue.body ?? "")) return;
  const acceptedAt = new Date().toISOString();
  const reviewRecord = `<!-- alpha-review-record\n${JSON.stringify(review)}\n-->`;
  const body = `${issue.body ?? ""}\n\n<!-- alpha-accepted-at: ${acceptedAt} -->\n${reviewRecord}`.trim();
  await github.rest.issues.update({ ...context.repo, issue_number: issue.number, body });
  const feedbackTitle = encodeURIComponent(`[ALPHA Feedback] Review #${issue.number}`);
  const feedbackUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/issues/new?template=alpha-pilot-feedback.yml&title=${feedbackTitle}`;
  await github.rest.issues.createComment({ ...context.repo, issue_number: issue.number, body: `Contribuição aceita. Registre o resultado do ciclo no [formulário de feedback associado à Issue #${issue.number}](${feedbackUrl}).` });
}

async function validateSubmission({ github, context, core, verifyWalletProof }) {
  const issue = context.payload.issue;
  const labels = (issue.labels ?? []).map((label) => typeof label === "string" ? label : label.name).filter(Boolean);
  await ensureLabels(github, context);

  if (labels.includes("accepted")) {
    const recordAcceptance = context.payload.action === "labeled" && context.payload.label?.name === "accepted";
    if (!recordAcceptance && ACCEPTED_MARKER.test(issue.body ?? "")) {
      await setState(github, context, issue.number, "accepted");
      return;
    }
    if (!labels.includes("valid")) {
      await setState(github, context, issue.number, "needsReview");
      await github.rest.issues.createComment({ ...context.repo, issue_number: issue.number, body: "O aceite foi removido porque a submissão ainda não possui validação técnica `valid`. Corrija a evidência e a prova de carteira antes da decisão humana." });
      return;
    }
    const review = await findReview(github, context, issue.number);
    if (!review || review.result !== "aprovado") {
      await setState(github, context, issue.number, "review");
      await github.rest.issues.createComment({ ...context.repo, issue_number: issue.number, body: "O aceite foi removido: publique antes uma rubrica completa, com resultado `aprovado`, usando o modelo de `docs/REVIEW-RUBRIC.md`. A revisão deve ser feita por owner, member ou collaborator." });
      return;
    }
    await markAccepted({ github, context, issue, recordAcceptance, review });
    core.info("Human acceptance preserved and mutually exclusive labels applied.");
    return;
  }

  const submission = parseSubmission(issue.body ?? "");
  if (!submission) {
    await setState(github, context, issue.number, "invalid");
    await github.rest.issues.createComment({ ...context.repo, issue_number: issue.number, body: "Validação automática: informe repositório, evidência GitHub e endereço EVM válidos. A evidência deve pertencer ao repositório informado." });
    return;
  }

  const { owner, repo, evidenceParts } = submission;
  try {
    const canonicalRepo = `https://github.com/${owner}/${repo}`;
    const canonicalEvidence = evidenceParts.length === 4 ? `${canonicalRepo}/pull/${evidenceParts[3]}` : canonicalRepo;
    const message = `ALPHA Builders wallet proof\nEvidence: ${canonicalEvidence}\nWallet: ${submission.wallet.toLowerCase()}\nNonce: ${submission.nonce}`;
    const verifier = verifyWalletProof ?? (async (input) => {
      const { verifyMessage } = await import("viem");
      return verifyMessage(input);
    });
    const ownsWallet = await verifier({ address: submission.wallet, message, signature: submission.signature });
    if (!ownsWallet) throw new Error("Invalid wallet signature");
    const submissions = await github.paginate(github.rest.issues.listForRepo, { ...context.repo, state: "all", labels: "submission", per_page: 100 });
    const nonceAlreadyUsed = submissions.some((candidate) => candidate.number !== issue.number && parseSubmission(candidate.body ?? "")?.nonce.toLowerCase() === submission.nonce.toLowerCase());
    if (nonceAlreadyUsed) throw new Error("Nonce already used by another submission");

    const repository = await github.rest.repos.get({ owner, repo });
    if (repository.data.private) throw new Error("Repository is private");
    try {
      await github.rest.repos.getReadme({ owner, repo });
    } catch (error) {
      if (error.status !== 404) throw error;
      await setState(github, context, issue.number, "needsReview");
      await github.rest.issues.createComment({ ...context.repo, issue_number: issue.number, body: "Repositório público encontrado, mas nenhum README foi localizado. Revisão humana necessária." });
      return;
    }

    if (evidenceParts.length === 4) {
      const pullNumber = Number(evidenceParts[3]);
      const pull = await github.rest.pulls.get({ owner, repo, pull_number: pullNumber });
      if (pull.data.base.repo.full_name.toLowerCase() !== `${owner}/${repo}`.toLowerCase()) {
        throw new Error("Pull request targets another repository");
      }
      const files = await github.paginate(github.rest.pulls.listFiles, { owner, repo, pull_number: pullNumber, per_page: 100 });
      if (!files.some((file) => /(^|\/)readme(?:\.[^/]+)?$/i.test(file.filename))) {
        await setState(github, context, issue.number, "needsReview");
        await github.rest.issues.createComment({ ...context.repo, issue_number: issue.number, body: "O Pull Request existe e pertence ao repositório, mas não altera um arquivo README. Revisão humana necessária." });
        return;
      }
    }

    await setState(github, context, issue.number, "review");
    await github.rest.issues.createComment({ ...context.repo, issue_number: issue.number, body: "Validação técnica concluída: repositório público, README presente, evidência pertencente ao projeto e carteira EVM em formato válido. A aceitação final continua sendo humana." });
  } catch (error) {
    core.warning(error.message);
    await setState(github, context, issue.number, error.status === 404 ? "invalid" : "needsReview");
    await github.rest.issues.createComment({ ...context.repo, issue_number: issue.number, body: "Não foi possível validar integralmente o repositório ou a evidência. Verifique os links; falhas temporárias seguem para revisão humana." });
  }
}

module.exports = { ACCEPTED_MARKER, parseReview, parseSubmission, validateSubmission };
