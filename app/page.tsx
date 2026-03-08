"use client";

import { useState, useEffect, useRef } from "react";
import BootScreen from "@/components/BootScreen";
import SystemBackground from "@/components/SystemBackground";

const projects = [
  {
    id: "inkcheck",
    title: "InkCheck",
    url: "https://inkcheck.io",
    desc: "AI-assisted writing editor",
  },
  {
    id: "applywell",
    title: "ApplyWell",
    url: "https://applywell.io",
    desc: "Resume & application builder",
  },
  {
    id: "offerintegrity",
    title: "OfferIntegrity",
    url: "https://offerintegrity.io",
    desc: "High-ticket offer validator",
  },
  {
    id: "bettercalculators",
    title: "BetterCalculators",
    url: "https://bettercalculators.net",
    desc: "170+ free calculators",
  },
  {
    id: "toolsdock",
    title: "ToolsDock",
    url: "https://toolsdock.io",
    desc: "Developer utilities & tools",
  },
];

const statusLines = [
  { key: "inkcheck",       dots: "........" },
  { key: "applywell",      dots: "......." },
  { key: "offerintegrity", dots: ".." },
  { key: "calculators",    dots: "....." },
  { key: "toolsdock",      dots: "......." },
];

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

function Dashboard({ restartBoot }: { restartBoot: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") restartBoot();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [restartBoot]);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <SystemBackground />

      {/* Retro reboot key — fixed top-left */}
      <button onClick={restartBoot} className="reboot-key" title="Reboot System">
        REBOOT
      </button>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-24">

        {/* Main heading with blinking cursor */}
        <h1 className="neon-heading text-5xl md:text-7xl font-bold">
          gambino.labs<span className="blink-cursor">_</span>
        </h1>

        {/* Subheading */}
        <p className="subheading mt-4 mb-8 text-center">
          experimental software · tools · creative systems
        </p>

        {/* Terminal status block */}
        <div className="terminal-status mb-12">
          <div className="terminal-header">// system status</div>
          {statusLines.map((line) => (
            <div key={line.key} className="terminal-line">
              <span className="terminal-label">{line.key}</span>
              <span className="terminal-dots">{line.dots}</span>
              <span className="terminal-online">online</span>
            </div>
          ))}
        </div>

        {/* Module cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
          {projects.map((project, i) => (
            <ModuleCard key={project.id} project={project} index={i} />
          ))}
        </div>

        {/* Terminal hint */}
        <p className="sys-hint mt-14">
          press <kbd className="sys-kbd">R</kbd> to reboot system
        </p>

        {/* Footer */}
        <footer className="sys-footer mt-4">
          <div className="sys-footer-title">gambino.labs</div>
          <div className="sys-footer-sub">experimental software · tools · creative systems</div>
          <div className="sys-footer-copy">© 2026 Gambino Labs</div>
        </footer>

      </div>
    </main>
  );
}

function ModuleCard({
  project,
  index,
}: {
  project: (typeof projects)[0];
  index: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      ref={ref}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`module-card${visible ? " module-card--visible" : ""}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Sweep-on-hover overlay */}
      <div className="card-sweep-overlay" aria-hidden="true" />

      <div className="card-inner">
        <div className="card-meta">
          <span className="module-index">
            module_{String(index + 1).padStart(2, "0")}
          </span>
          <span className="status-dot" />
        </div>

        <h2 className="module-title">{project.title}</h2>
        <p className="module-desc">{project.desc}</p>

        <div className="module-link">
          <span>open module</span>
          <span className="link-arrow">→</span>
        </div>
      </div>
    </a>
  );
}
