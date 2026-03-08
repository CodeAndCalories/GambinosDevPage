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
      {!booted && <BootScreen onComplete={() => {
        localStorage.setItem("bootSeen","true");
        setBooted(true);
      }} />}

      {booted && <Dashboard />}
    </>
  );
}

function Dashboard() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">

      <SystemBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">

        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-green-400 tracking-wider">
          gambinos.system
        </h1>

        <p className="text-green-300 mb-12 opacity-70">
          creative engine online
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">

          <Card title="TOOLS" desc="calculators & utilities" link="#" />
          <Card title="PROJECTS" desc="software builds" link="#" />
          <Card title="EXPERIMENTS" desc="ai & strange ideas" link="#" />
          <Card title="WRITING" desc="stories & worlds" link="#" />

        </div>

      </div>

    </main>
  );
}

function Card({ title, desc, link }: any) {
  return (
    <a
      href={link}
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