"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const FloatingAlpha = dynamic(() => import("./FloatingAlpha"), {
  ssr: false,
  loading: () => <div className="alpha-orb-fallback alpha-orb-loading" aria-hidden="true" />,
});

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function PerformanceAwareAlpha() {
  const reducedMotion = useReducedMotion();
  const [allow3d, setAllow3d] = useState(false);

  useEffect(() => {
    const nav = navigator as NavigatorWithHints;
    const constrained =
      reducedMotion ||
      nav.connection?.saveData === true ||
      (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) ||
      window.matchMedia("(max-width: 720px)").matches ||
      !supportsWebGL();

    if (constrained) {
      setAllow3d(false);
      return;
    }

    const idle = window.requestIdleCallback?.(() => setAllow3d(true), { timeout: 1600 });
    const timer = idle === undefined ? window.setTimeout(() => setAllow3d(true), 700) : undefined;

    return () => {
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [reducedMotion]);

  return allow3d ? <FloatingAlpha /> : <div className="alpha-orb-fallback" aria-hidden="true" />;
}
