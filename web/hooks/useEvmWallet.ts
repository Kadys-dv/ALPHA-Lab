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
    const list = accounts as string[];
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
        const list = accounts as string[];
        setAccount(list[0] ?? "");
        setChain(String(currentChain));
      })
      .catch(() => undefined);

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
      setError(
        errorCode(walletError) === "4001"
          ? "Conexão cancelada na carteira."
          : "Não foi possível conectar ou configurar a carteira.",
      );
    }
  }, [provider, sync]);

  return useMemo(
    () => ({ account, chain, error, onCorrectNetwork, connect }),
    [account, chain, error, onCorrectNetwork, connect],
  );
}
