import { createRequire } from "node:module";
import { expect, test } from "@playwright/test";

const require = createRequire(import.meta.url);
const axe = require("axe-core");

const ACCOUNT = "0x1111111111111111111111111111111111111111";

async function mockStatus(page) {
  await page.route("**/api/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        state: "ok",
        checkedAt: "2026-08-31T00:00:00.000Z",
        metrics: {
          submitted: 4,
          underReview: 1,
          accepted: 2,
          approvalRate: 50,
          uniqueBuilders: 2,
          distinctProjects: 2,
          repeatBuilders: 0,
          acceptedPerBuilder: 1,
        },
        builders: [],
      }),
    });
  });
}

async function mockWallet(page) {
  await page.addInitScript(({ account }) => {
    const listeners = new Map();
    window.ethereum = {
      request: async ({ method }) => {
        if (method === "eth_accounts" || method === "eth_requestAccounts") return [account];
        if (method === "eth_chainId") return "0x14a34";
        if (method === "wallet_switchEthereumChain" || method === "wallet_addEthereumChain") return null;
        throw new Error(`Unexpected wallet method: ${method}`);
      },
      on: (event, callback) => listeners.set(event, callback),
      removeListener: (event) => listeners.delete(event),
    };
    window.__alphaOpenedUrl = "";
    window.open = (url) => {
      window.__alphaOpenedUrl = String(url ?? "");
      return null;
    };
  }, { account: ACCOUNT });
}

test.beforeEach(async ({ page }) => {
  await mockStatus(page);
});

test("home keeps critical content keyboard and WCAG accessible", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Aprenda construindo");
  await expect(page.getByText("Base Sepolia", { exact: true }).first()).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();

  await page.addScriptTag({ content: axe.source });
  const seriousViolations = await page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
    });
    return result.violations
      .filter((violation) => violation.impact === "critical" || violation.impact === "serious")
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => ({ target: node.target, html: node.html })),
      }));
  });

  expect(seriousViolations).toEqual([]);
});

test("submission accepts a public Pull Request with a testnet wallet", async ({ page }) => {
  await mockWallet(page);
  await page.goto("http://127.0.0.1:3000/");

  await page.locator("#repo-url").fill("https://github.com/Kadys-dv/ALPHA-Lab/pull/29");
  await page.locator("#wallet-address").fill(ACCOUNT);
  await page.locator(".consent-row input").check();
  await page.getByRole("button", { name: "Preparar Issue no GitHub" }).click();

  await expect(page.getByText("Etapa 1 concluída.", { exact: false })).toBeVisible();
  const opened = await page.evaluate(() => window.__alphaOpenedUrl);
  expect(opened).toContain("github.com/Kadys-dv/ALPHA-Lab/issues/new");
  expect(opened).toContain("pull%2F29");
});

test("submission rejects evidence outside github.com", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/");

  await page.locator("#repo-url").fill("https://example.com/projeto");
  await page.locator("#wallet-address").fill(ACCOUNT);
  await page.locator(".consent-row input").check();
  await page.getByRole("button", { name: "Preparar Issue no GitHub" }).click();

  await expect(page.locator(".submission-form .form-error[role='alert']")).toContainText("github.com");
});
