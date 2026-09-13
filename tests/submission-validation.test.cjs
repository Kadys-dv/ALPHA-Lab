const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { parseReview, parseSubmission, validateSubmission } = require("../scripts/submission-validation.cjs");

const body = (evidence, proofCreatedAt = new Date().toISOString()) => `Cycle ID: alpha-abcdef123456\nRepository: https://github.com/acme/demo\nEvidence: ${evidence}\nWallet: 0x1111111111111111111111111111111111111111\nNonce: 0x${"2".repeat(64)}\nProof Created At: ${proofCreatedAt}\nSignature: 0x${"3".repeat(130)}`;

function harness({ issueBody = body("https://github.com/acme/demo/pull/7"), labels = [], files = [{ filename: "README.md" }], issueUser = "builder", pullUser = "builder", commitUser = "builder" } = {}) {
  const calls = { labels: [], comments: [], updates: [] };
  const rubric = `<!-- alpha-review -->\nContexto e objetivo: aprovado\nInstalação reproduzível: aprovado\nDecisões técnicas: aprovado\nTestes e validações: aprovado\nDemonstração: não se aplica\nResultado: aprovado\nRecomendação: Explicar melhor as decisões de arquitetura.`;
  const github = {
    paginate: async (method) => {
      if (method === github.rest.issues.listComments) return [{ body: rubric, author_association: "OWNER", user: { login: "reviewer" } }];
      if (method === github.rest.issues.listForRepo) return [];
      if (method === github.rest.pulls.listCommits) return [{ author: { login: commitUser } }];
      return files;
    },
    rest: {
      issues: {
        getLabel: async () => ({}), createLabel: async () => ({}),
        setLabels: async (input) => calls.labels.push(input.labels),
        createComment: async (input) => calls.comments.push(input.body),
        update: async (input) => calls.updates.push(input),
        listComments: async () => ({}),
        listForRepo: async () => ({}),
      },
      repos: { get: async () => ({ data: { private: false } }), getReadme: async () => ({}) },
      pulls: {
        get: async () => ({ data: { user: { login: pullUser }, base: { repo: { full_name: "acme/demo" } } } }),
        listFiles: async () => ({}),
        listCommits: async () => ({}),
      },
    },
  };
  return { github, calls, context: { repo: { owner: "Kadys-dv", repo: "ALPHA-Lab" }, payload: { action: "labeled", label: { name: "accepted" }, issue: { number: 1, body: issueBody, labels, user: { login: issueUser } } } }, core: { info() {}, warning() {} }, verifyWalletProof: async () => true };
}

describe("submission workflow", () => {
  it("rejects evidence from another repository", () => {
    assert.equal(parseSubmission(body("https://github.com/other/demo/pull/7")), null);
  });

  it("moves a verified README pull request to under review", async () => {
    const h = harness();
    await validateSubmission(h);
    assert.deepEqual(h.calls.labels.at(-1), ["submission", "valid", "under-review"]);
  });

  it("does not duplicate validation comments on a replayed event", async () => {
    const h = harness();
    const originalPaginate = h.github.paginate;
    h.github.paginate = async (method, options) => {
      if (method === h.github.rest.issues.listComments && options?.issue_number === 1) {
        return [{ body: "<!-- alpha-validation:technical-valid -->" }];
      }
      return originalPaginate(method, options);
    };
    await validateSubmission(h);
    assert.equal(h.calls.comments.length, 0);
  });

  it("rejects a wallet signature that does not recover the declared address", async () => {
    const h = harness();
    h.verifyWalletProof = async () => false;
    await validateSubmission(h);
    assert.deepEqual(h.calls.labels.at(-1), ["submission", "needs-review"]);
  });

  it("rejects a nonce already used by another submission", async () => {
    const h = harness();
    h.github.paginate = async (method) => method === h.github.rest.issues.listForRepo
      ? [{ number: 99, body: body("https://github.com/acme/demo/pull/8") }]
      : [{ filename: "README.md" }];
    await validateSubmission(h);
    assert.deepEqual(h.calls.labels.at(-1), ["submission", "needs-review"]);
  });

  it("rejects an expired wallet proof", async () => {
    const h = harness({ issueBody: body("https://github.com/acme/demo/pull/7", "2026-01-01T00:00:00.000Z") });
    await validateSubmission(h);
    assert.deepEqual(h.calls.labels.at(-1), ["submission", "needs-review"]);
  });

  it("rejects a pull request not authored by the issue participant", async () => {
    const h = harness({ issueUser: "builder", pullUser: "other", commitUser: "other" });
    await validateSubmission(h);
    assert.deepEqual(h.calls.labels.at(-1), ["submission", "needs-review"]);
  });

  it("accepts pull requests with commits authored by the issue participant", async () => {
    const h = harness({ issueUser: "builder", pullUser: "other", commitUser: "builder" });
    await validateSubmission(h);
    assert.deepEqual(h.calls.labels.at(-1), ["submission", "valid", "under-review"]);
  });

  it("sends a pull request without README changes to manual review", async () => {
    const h = harness({ files: [{ filename: "src/index.js" }] });
    await validateSubmission(h);
    assert.deepEqual(h.calls.labels.at(-1), ["submission", "needs-review"]);
  });

  it("makes accepted labels exclusive and records acceptance time", async () => {
    const h = harness({ labels: [{ name: "accepted" }, { name: "valid" }, { name: "under-review" }] });
    await validateSubmission(h);
    assert.deepEqual(h.calls.labels.at(-1), ["submission", "valid", "accepted"]);
    assert.match(h.calls.updates[0].body, /alpha-accepted-at:/);
    assert.match(h.calls.updates[0].body, /alpha-review-record/);
    assert.match(h.calls.updates[0].body, /"version":1/);
    assert.match(h.calls.comments.at(-1), /formulário de feedback associado/i);
  });

  it("does not invent an acceptance time when a legacy issue is edited", async () => {
    const h = harness({ issueBody: `${body("https://github.com/acme/demo/pull/7")}\n<!-- alpha-accepted-at: 2026-09-01T10:00:00.000Z -->`, labels: [{ name: "accepted" }, { name: "valid" }] });
    h.context.payload.action = "edited";
    await validateSubmission(h);
    assert.equal(h.calls.updates.length, 0);
  });

  it("rejects a rubric written by an untrusted author", () => {
    assert.equal(parseReview({ body: "<!-- alpha-review -->", author_association: "NONE" }), null);
  });

  it("removes acceptance when no complete rubric exists", async () => {
    const h = harness({ labels: [{ name: "accepted" }, { name: "valid" }] });
    h.github.paginate = async () => [];
    await validateSubmission(h);
    assert.deepEqual(h.calls.labels.at(-1), ["submission", "valid", "under-review"]);
    assert.match(h.calls.comments.at(-1), /aceite foi removido/i);
  });

  it("does not let a human rubric bypass failed technical validation", async () => {
    const h = harness({ labels: [{ name: "accepted" }, { name: "needs-review" }] });
    await validateSubmission(h);
    assert.deepEqual(h.calls.labels.at(-1), ["submission", "needs-review"]);
    assert.match(h.calls.comments.at(-1), /validação técnica/i);
  });
});
