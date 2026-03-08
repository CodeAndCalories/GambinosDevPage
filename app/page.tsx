"use client";

import { useState, useEffect } from "react";
import BootScreen from "@/components/BootScreen";
import SystemBackground from "@/components/SystemBackground";

export default function Page() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("bootSeen");
    if (seen) setBooted(true);
  }, []);

  return (
    <>
      {!booted && (
        <BootScreen
          onComplete={() => {
            localStorage.setItem("bootSeen", "true");
            setBooted(true);
          }}
        />
      )}

      {booted && (
        <Dashboard
          restartBoot={() => {
            localStorage.removeItem("bootSeen");
            setBooted(false);
          }}
        />
      )}
    </>
  );
}

function Dashboard({ restartBoot }: any) {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">

      <SystemBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">

        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-green-400 tracking-wider">
          gambino.labs
        </h1>

        <p className="text-green-300 mb-6 opacity-70 text-center">
          experimental software • tools • creative systems
        </p>

        <button
          onClick={restartBoot}
          className="mb-12 border border-green-500 px-4 py-2 text-sm text-green-400 hover:bg-green-500 hover:text-black transition"
        >
          replay boot sequence
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">

          <Card
            title="INKCHECK"
            desc="AI-assisted writing editor"
            link="https://inkcheck.io"
          />

          <Card
            title="BETTER CALCULATORS"
            desc="170+ free calculators"
            link="https://bettercalculators.net"
          />

          <Card
            title="OFFER INTEGRITY"
            desc="high-ticket offer validator"
            link="https://offerintegrity.com"
          />

  

        </div>

      </div>
    </main>
  );
}

function Card({ title, desc, link }: any) {
  return (
    <a
      href={link}
      target="_blank"
      className="group border border-green-500/30 rounded-xl p-6 hover:border-green-400 transition duration-300 backdrop-blur-sm bg-black/40 hover:bg-black/60"
    >
      <h2 className="text-xl font-semibold text-green-400 mb-2">
        {title}
      </h2>

      <p className="text-green-200 text-sm opacity-70">
        {desc}
      </p>

      <div className="mt-4 text-green-500 text-xs opacity-60 group-hover:opacity-100">
        open module →
      </div>
    </a>
  );
}