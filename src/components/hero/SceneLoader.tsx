"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { PhoneArt } from "@/components/PhoneArt";

/** Drawn while the 3D chunk downloads, and kept forever when it never should. */
function ArtFallback() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="aspect-[8/14] h-full max-h-full">
        <PhoneArt
          accent="#ff416a"
          name="AFAMIA TEK"
          className="drop-shadow-[0_40px_70px_rgba(200,145,47,0.22)]"
        />
      </div>
    </div>
  );
}

/**
 * `ssr: false` is illegal inside a Server Component, so the hero reaches the
 * WebGL scene through this client wrapper.
 */
const PhoneScene = dynamic(() => import("./PhoneScene"), {
  ssr: false,
  loading: ArtFallback,
});

type ConnectionLike = { saveData?: boolean };
type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (id: number) => void;
};

function hasWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    return Boolean(
      probe.getContext("webgl2") ??
        probe.getContext("webgl") ??
        probe.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

/** Three.js is not worth the bytes on a phone or on a metered connection. */
function shouldRenderScene(): boolean {
  if (typeof window === "undefined") return false;
  if (window.innerWidth < 640) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  const connection = (navigator as Navigator & { connection?: ConnectionLike })
    .connection;
  if (connection?.saveData === true) return false;

  return hasWebGL();
}

export default function SceneLoader() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const idleWindow = window as IdleWindow;
    const enable = () => setEnabled(shouldRenderScene());

    if (idleWindow.requestIdleCallback) {
      const idle = idleWindow.requestIdleCallback(enable, { timeout: 1600 });
      return () => idleWindow.cancelIdleCallback?.(idle);
    }

    const timer = window.setTimeout(enable, 900);
    return () => window.clearTimeout(timer);
  }, []);

  if (!enabled) return <ArtFallback />;

  return <PhoneScene />;
}
