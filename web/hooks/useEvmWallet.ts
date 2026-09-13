"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BASE_SEPOLIA } from "@/lib/constants";

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, cb: (...args: unknown[]) => void): void;
  removeListener?(event: string, cb: (...args: unknown[]) => void): void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const errorCode = (error: unknown) =>
  typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";

const walletErrorMessage = (error: unknown, fallback: string) =>
  errorCode(error) === "4001" ? "Operação cancelada na carteira." : fallback;

const accountsFrom = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export function useEvmWallet() {
  const [account, setAccount] = useState("");
  const [chain, setChain] = useState("");
  const [error, setError] = useState("");

  const provider = typeof window !== "undefined" ? window.ethereum : undefined;
  const onCorrectNetwork = chain === BASE_SEPOLIA.chainIdHex;

  const sync = useCallback(async () => {
    if (!provider) return;
    const [accounts, currentChain] = await Promise.all([
      provider.request({ method: "eth_accounts" }),
      provider.request({ method: "eth_chainId" }),
    ]);
    const list = accountsFrom(accounts);
    setAccount(list[0] ?? "");
    setChain(String(currentChain));
  }, [provider]);

  useEffect(() => {
    if (!provider) return;
    let active = true;

    void Promise.all([
      provider.request({ method: "eth_accounts" }),
      provider.request({ method: "eth_chainId" }),
    ])
      .then(([accounts, currentChain]) => {
        if (!active) return;
        const list = accountsFrom(accounts);
        setAccount(list[0] ?? "");
        setChain(String(currentChain));
      })
      .catch((walletError: unknown) => {
        if (active) setError(walletErrorMessage(walletError, "Não foi possível ler o estado da carteira."));
      });

    const onAccountsChanged = (value: unknown) => {
      const nextAccount = Array.isArray(value) ? String(value[0] ?? "") : "";
      setAccount(nextAccount);
    };
    const onChainChanged = (value: unknown) => setChain(String(value));
    const onDisconnect = () => {
      setAccount("");
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

  const connect = useCallback(async () => {
    setError("");
    if (!provider) {
      setError("Nenhuma carteira EVM compatível foi detectada neste navegador.");
      return;
    }

    try {
      await provider.request({ method: "eth_requestAccounts" });
      const current = String(await provider.request({ method: "eth_chainId" }));
      if (current !== BASE_SEPOLIA.chainIdHex) {
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BASE_SEPOLIA.chainIdHex }],
          });
        } catch (switchError) {
          if (errorCode(switchError) !== "4902") throw switchError;
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
      await sync();
    } catch (walletError) {
      setError(walletErrorMessage(walletError, "Não foi possível conectar ou configurar a carteira."));
    }
  }, [provider, sync]);

  const signMessage = useCallback(async (message: string) => {
    setError("");
    if (!provider || !account) throw new Error("wallet_not_connected");
    try {
      return String(await provider.request({ method: "personal_sign", params: [message, account] }));
    } catch (walletError) {
      setError(walletErrorMessage(walletError, "Não foi possível comprovar o controle da carteira."));
      throw walletError;
    }
  }, [account, provider]);

  return useMemo(
    () => ({ account, chain, error, onCorrectNetwork, connect, signMessage }),
    [account, chain, error, onCorrectNetwork, connect, signMessage],
  );
}
