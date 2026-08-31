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
    if (reducedMotion) return;

    const nav = navigator as NavigatorWithHints;
    const constrained =
      nav.connection?.saveData === true ||
      (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) ||
      window.matchMedia("(max-width: 720px)").matches ||
      !supportsWebGL();

    if (constrained) return;

    let activated = false;
    const activate = () => {
      if (activated) return;
      activated = true;
      setAllow3d(true);
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("touchstart", activate);
      window.removeEventListener("keydown", activate);
      window.removeEventListener("scroll", activate);
    };

    window.addEventListener("pointerdown", activate, { passive: true, once: true });
    window.addEventListener("touchstart", activate, { passive: true, once: true });
    window.addEventListener("keydown", activate, { once: true });
    window.addEventListener("scroll", activate, { passive: true, once: true });

    return () => {
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("touchstart", activate);
      window.removeEventListener("keydown", activate);
      window.removeEventListener("scroll", activate);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return <div className="alpha-orb-fallback" aria-hidden="true" />;
  }

  return allow3d ? <FloatingAlpha /> : <div className="alpha-orb-fallback" aria-hidden="true" />;
}
