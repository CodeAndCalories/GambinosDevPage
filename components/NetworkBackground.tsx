"use client";

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

export default function NetworkBackground() {
  // BUG FIX: Typed engine as Engine (avoids any, also ensures correct tsparticles-engine import)
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    // BUG FIX: Changed from fixed + -z-10 wrapper to absolute + -z-10.
    // "fixed" competes with SystemBackground's "absolute" and can escape the
    // <main> stacking context. Using absolute keeps both backgrounds in the same
    // stacking context as the parent <main>. z-index order:
    //   SystemBackground: -z-20 (deepest)
    //   NetworkBackground: -z-10 (above grid, below content)
    //   Content div:       z-10  (topmost)
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <Particles
        id="network"
        // BUG FIX: prop is "init" in react-tsparticles v2 — correct as-is,
        // but some bundler setups need the explicit Engine type to resolve correctly.
        init={particlesInit}
        options={{
          fpsLimit: 60,
          background: { color: { value: "transparent" } },

          particles: {
            number: {
              value: 65,
              density: { enable: true, area: 900 },
            },

            color: { value: "#00ff9c" },

            links: {
              enable: true,
              color: "#00ff9c",
              distance: 150,
              opacity: 0.15,
              width: 1,
            },

            move: {
              enable: true,
              speed: 0.35,
              outModes: { default: "bounce" },
            },

            opacity: {
              value: { min: 0.1, max: 0.4 },
            },

            size: {
              value: { min: 1, max: 2 },
            },
          },

          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
            },

            modes: {
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },

          detectRetina: true,
        }}
      />
    </div>
  );
}
