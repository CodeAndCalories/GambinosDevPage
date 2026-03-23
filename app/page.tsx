"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import BootScreen from "@/components/BootScreen";

const projects = [
  { id: "inkcheck", title: "InkCheck", url: "https://inkcheck.io", desc: "AI-assisted writing editor" },
  { id: "applywell", title: "ApplyWell", url: "https://applywell.io", desc: "Resume & application builder" },
  { id: "offerintegrity", title: "OfferIntegrity", url: "https://offerintegrity.io", desc: "High-ticket offer validator" },
  { id: "bettercalculators", title: "BetterCalculators", url: "https://bettercalculators.net", desc: "170+ free calculators" },
  { id: "toolsdock", title: "ToolsDock", url: "https://toolsdock.io", desc: "Developer utilities & tools" },
  { id: "memstore", title: "memstore.dev", url: "https://memstore.dev", desc: "Persistent memory API for AI agents" },
  { id: "propertysignalhq", title: "PropertySignalHQ", url: "https://propertysignalhq.com", desc: "Real estate distress signal aggregator" },
  { id: "grantlocate", title: "GrantLocate", url: "https://grantlocate.com", desc: "Search 50,000+ active government grants and funding opportunities" },
];

const statusLines = [
  { key: "inkcheck", dots: "........" },
  { key: "applywell", dots: "......." },
  { key: "offerintegrity", dots: ".." },
  { key: "calculators", dots: "....." },
  { key: "toolsdock", dots: "......." },
  { key: "memstore", dots: "......" },
  { key: "propertysignalhq", dots: "......" },
  { key: "grantlocate", dots: "......" },
];

// ─── Particle canvas (interactive network + cursor response) ───────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<any[]>([]);
  const ripples = useRef<any[]>([]);
  const animFrame = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let W = window.innerWidth, H = window.innerHeight;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Spawn particles
    const COUNT = Math.min(120, Math.floor((W * H) / 10000));
    particles.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      base_opacity: Math.random() * 0.4 + 0.1,
      opacity: 0,
      hue: Math.random() * 40 + 140, // 140-180: green-cyan
    }));

    const addRipple = (x: number, y: number) => {
      ripples.current.push({ x, y, r: 0, maxR: 180, opacity: 0.8, life: 1 });
    };

    const onMove = (x: number, y: number) => { mouse.current = { x, y }; };
    const onTap = (x: number, y: number) => {
      addRipple(x, y);
      // Burst particles from tap point
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        const speed = Math.random() * 3 + 1;
        particles.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: Math.random() + 0.5,
          base_opacity: 0.9,
          opacity: 0.9,
          hue: Math.random() * 40 + 140,
          ttl: 80,
          age: 0,
          burst: true,
        });
      }
    };

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onMouseClick = (e: MouseEvent) => onTap(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => { const t = e.touches[0]; onMove(t.clientX, t.clientY); };
    const onTouchStart = (e: TouchEvent) => { const t = e.touches[0]; onTap(t.clientX, t.clientY); };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onMouseClick);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    const LINK_DIST = 130;
    const REPEL_DIST = 120;
    const ATTRACT_DIST = 200;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      const mx = mouse.current.x, my = mouse.current.y;

      // Update & filter particles
      particles.current = particles.current.filter((p) => {
        if (p.burst) {
          p.age++;
          p.vx *= 0.93;
          p.vy *= 0.93;
          p.opacity = p.base_opacity * (1 - p.age / p.ttl);
          if (p.age >= p.ttl) return false;
        } else {
          // Mouse repel/attract
          const dx = mx - p.x, dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_DIST && dist > 0) {
            const force = (REPEL_DIST - dist) / REPEL_DIST * 0.025;
            p.vx -= (dx / dist) * force * 3.5;
            p.vy -= (dy / dist) * force * 3.5;
          } else if (dist < ATTRACT_DIST && dist > REPEL_DIST) {
            const force = 0.0004;
            p.vx += (dx / dist) * force * dist;
            p.vy += (dy / dist) * force * dist;
          }
          // Damping
          p.vx *= 0.985;
          p.vy *= 0.985;
          // Speed cap
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (spd > 2) { p.vx = (p.vx / spd) * 2; p.vy = (p.vy / spd) * 2; }

          p.opacity += (p.base_opacity - p.opacity) * 0.05;

          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.opacity})`;
        ctx.fill();

        return true;
      });

      // Draw links between nearby particles
      const stable = particles.current.filter((p) => !p.burst);
      for (let i = 0; i < stable.length; i++) {
        for (let j = i + 1; j < stable.length; j++) {
          const a = stable[i], b = stable[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,255,156,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw cursor glow
      if (mx > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 90);
        grad.addColorStop(0, "rgba(0,255,156,0.12)");
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(mx, my, 90, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Draw ripples
      ripples.current = ripples.current.filter((rip) => {
        rip.r += 4;
        rip.opacity *= 0.93;
        rip.life = rip.opacity;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,156,${rip.opacity * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Second inner ring
        if (rip.r > 30) {
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.r * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,255,220,${rip.opacity * 0.4})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        return rip.opacity > 0.01 && rip.r < rip.maxR;
      });

      animFrame.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrame.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onMouseClick);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

// ─── Cursor trail ──────────────────────────────────────────────────────────
function CursorTrail() {
  const trailRef = useRef<HTMLDivElement>(null);
  const dots = useRef<HTMLDivElement[]>([]);
  const positions = useRef<{ x: number; y: number }[]>([]);
  const TRAIL_LEN = 20;

  useEffect(() => {
    const container = trailRef.current!;
    for (let i = 0; i < TRAIL_LEN; i++) {
      const d = document.createElement("div");
      d.className = "cursor-dot";
      const scale = 1 - i / TRAIL_LEN;
      d.style.cssText = `
        position:fixed;pointer-events:none;border-radius:50%;z-index:9999;
        transform:translate(-50%,-50%) scale(${scale});
        width:${6 + (1 - scale) * 2}px;height:${6 + (1 - scale) * 2}px;
        background:rgba(0,255,156,${0.9 - i / TRAIL_LEN * 0.85});
        box-shadow: 0 0 ${8 - i * 0.3}px rgba(0,255,156,${0.6 - i * 0.025});
        transition: opacity 0.1s;
      `;
      container.appendChild(d);
      dots.current.push(d);
    }
    positions.current = Array(TRAIL_LEN).fill({ x: -999, y: -999 });

    const onMove = (x: number, y: number) => {
      positions.current.unshift({ x, y });
      positions.current = positions.current.slice(0, TRAIL_LEN);
      dots.current.forEach((d, i) => {
        const p = positions.current[i] || { x: -999, y: -999 };
        d.style.left = p.x + "px";
        d.style.top = p.y + "px";
      });
    };

    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => { const t = e.touches[0]; onMove(t.clientX, t.clientY); };

    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return <div ref={trailRef} />;
}

// ─── Matrix rain columns ──────────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const CHARS = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ<>{}[]|/\\";
    const COL_W = 18;
    const cols = Math.floor(canvas.width / COL_W);
    const drops = Array(cols).fill(1).map(() => Math.random() * -50);

    let frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.055)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drops.forEach((y, i) => {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const brightness = Math.random();
        if (brightness > 0.92) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#00ff9c";
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = `rgba(0,${Math.floor(180 + brightness * 75)},${Math.floor(brightness * 60)},${0.12 + brightness * 0.2})`;
          ctx.shadowBlur = 0;
        }
        ctx.font = `${11 + Math.random() * 3}px monospace`;
        ctx.fillText(char, i * COL_W, drops[i] * COL_W);
        ctx.shadowBlur = 0;

        if (drops[i] * COL_W > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.4;
      });

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.18 }}
    />
  );
}

// ─── Holographic card ─────────────────────────────────────────────────────
function HoloCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, shine: { x: 50, y: 50 } });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -12;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 12;
    const sx = ((e.clientX - rect.left) / rect.width) * 100;
    const sy = ((e.clientY - rect.top) / rect.height) * 100;
    setTilt({ x: rx, y: ry, shine: { x: sx, y: sy } });
  };

  const onMouseLeave = () => {
    setTilt({ x: 0, y: 0, shine: { x: 50, y: 50 } });
    setHovered(false);
  };

  return (
    <a
      ref={ref}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
      className={`holo-card transition-all duration-300 group-hover/system:opacity-70 hover:!opacity-100 group-hover/system:scale-[0.98] hover:!scale-100${visible ? " holo-card--visible" : ""}`}
      style={{
        transitionDelay: `${index * 100}ms`,
        transform: visible
          ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${hovered ? -8 : 0}px)`
          : "translateY(32px)",
        ["--shine-x" as any]: `${tilt.shine.x}%`,
        ["--shine-y" as any]: `${tilt.shine.y}%`,
      }}
    >
      {/* Holographic shine layer */}
      <div className="holo-shine" />
      {/* Scanline overlay */}
      <div className="holo-scanlines" />
      {/* Corner decorations */}
      <div className="holo-corner holo-corner--tl" />
      <div className="holo-corner holo-corner--tr" />
      <div className="holo-corner holo-corner--bl" />
      <div className="holo-corner holo-corner--br" />

      <div className="relative z-10">
        <div className="module-index">
          module_{String(index + 1).padStart(2, "0")}
        </div>
        <h3 className="module-title">{project.title}</h3>
        <p className="module-desc">{project.desc}</p>
        <span className="module-link">open module →</span>
      </div>
    </a>
  );
}

// ─── Typewriter subheading ────────────────────────────────────────────────
function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, 45 + Math.random() * 35);
    return () => clearTimeout(t);
  }, [started, displayed, text]);

  return (
    <p className="subheading mt-4 mb-10 text-center">
      {displayed}
      {displayed.length < text.length && (
        <span className="blink-cursor" style={{ fontSize: "10px" }}>▋</span>
      )}
    </p>
  );
}

// ─── Uptime counter ───────────────────────────────────────────────────────
function UptimeCounter() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <div className="terminal-line" style={{ marginTop: "6px", borderTop: "1px solid rgba(0,255,156,0.07)", paddingTop: "6px" }}>
      <span className="terminal-label" style={{ color: "rgba(0,255,156,0.4)" }}>sys_uptime</span>
      <span className="terminal-dots">...</span>
      <span className="terminal-online" style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.08em" }}>
        {h}:{m}:{s}
      </span>
    </div>
  );
}

// ─── System alert toasts ──────────────────────────────────────────────────
const ALERT_MESSAGES = [
  "[SYS] > anomaly detected in sector 7",
  "[NET] > new connection established",
  "[SEC] > firewall rules updated",
  "[MEM] > cache purge complete",
  "[SYS] > background processes nominal",
  "[NET] > packet loss < 0.01% — optimal",
  "[SEC] > intrusion attempt blocked",
  "[SYS] > entropy pool refreshed",
  "[NET] > routing table synchronized",
  "[MEM] > heap compaction finished",
  "[SEC] > certificates rotated",
  "[SYS] > watchdog timer reset",
];

function SystemAlerts() {
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = 12000 + Math.random() * 20000; // 12–32s
      return setTimeout(() => {
        const msg = ALERT_MESSAGES[Math.floor(Math.random() * ALERT_MESSAGES.length)];
        const id = ++counter.current;
        setToasts((prev) => [...prev.slice(-3), { id, msg }]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4500);
        scheduleNext();
      }, delay);
    };
    const t = scheduleNext();
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px",
      zIndex: 8000, display: "flex", flexDirection: "column", gap: "8px",
      alignItems: "flex-end", pointerEvents: "none",
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} className="sys-toast">
          {toast.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Easter egg — ↑↑↓↓ triggers glitch explosion ─────────────────────────
const CHEAT_CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"];

function EasterEgg() {
  const [active, setActive] = useState(false);
  const seq = useRef<string[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      seq.current = [...seq.current, e.key].slice(-CHEAT_CODE.length);
      if (seq.current.join(",") === CHEAT_CODE.join(",")) {
        setActive(true);
        setTimeout(() => setActive(false), 3200);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!active) return null;

  return (
    <div className="easter-overlay">
      <div className="easter-box">
        <div className="easter-skull">☠</div>
        <div className="easter-title">ACCESS GRANTED</div>
        <div className="easter-sub">welcome to the mainframe, operator</div>
        <div className="easter-code">CLEARANCE LEVEL: OMEGA</div>
      </div>
    </div>
  );
}

// ─── Glitch text ──────────────────────────────────────────────────────────
function GlitchTitle() {
  const text = "gambino.labs";
  return (
    <h1 className="glitch-title" data-text={text}>
      {text}<span className="blink-cursor">_</span>
    </h1>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────
export default function Page() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("bootSeen");
    if (seen) setBooted(true);
  }, []);

  const restartBoot = useCallback(() => {
    localStorage.removeItem("bootSeen");
    setBooted(false);
  }, []);

  // R key to reboot
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") restartBoot();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [restartBoot]);

  if (!booted) {
    return (
      <BootScreen
        onComplete={() => {
          localStorage.setItem("bootSeen", "true");
          setBooted(true);
        }}
      />
    );
  }

  return (
    <main className="cyb-root">
      {/* Layer 0: Matrix rain */}
      <MatrixRain />
      {/* Layer 1: Interactive particle canvas */}
      <ParticleCanvas />
      {/* Layer 2: CRT vignette + scanlines (CSS) */}
      <div className="crt-overlay" />
      {/* Layer 9999: cursor trail */}
      <CursorTrail />

      {/* System alert toasts */}
      <SystemAlerts />

      {/* Easter egg overlay */}
      <EasterEgg />

      {/* REBOOT button — preserved exactly */}
      <button onClick={restartBoot} className="reboot-key" title="Reboot System">
        REBOOT
      </button>

      {/* Content */}
      <div className="cyb-content">

        <GlitchTitle />

        <Typewriter text="experimental software · tools · creative systems" delay={400} />

        {/* System status */}
        <div className="terminal-status mb-12">
          <div className="terminal-header">// system status</div>
          {(() => {
            const chunked: typeof statusLines[] = [];
            for (let i = 0; i < statusLines.length; i += 2) {
              chunked.push(statusLines.slice(i, i + 2));
            }
            return chunked.map((pair, rowIndex) => (
              <div key={rowIndex} className="flex justify-between gap-6">
                {pair.map((line) => (
                  <div key={line.key} className="w-1/2">
                    <div className="terminal-line">
                      <span className="terminal-label">{line.key}</span>
                      <span className="terminal-dots">{line.dots}</span>
                      <span className="terminal-online">online</span>
                    </div>
                  </div>
                ))}
              </div>
            ));
          })()}
          <UptimeCounter />
        </div>

        {/* Cards */}
        <div className="group/system relative scanline-container">
          <div className="cyb-grid">
            {projects.map((project, i) => (
              <HoloCard key={project.id} project={project} index={i} />
            ))}
          </div>
          <div className="scanline-overlay pointer-events-none" />
        </div>

        <p className="sys-hint mt-14">
          press <kbd className="sys-kbd">R</kbd> to reboot system
        </p>

        <footer className="sys-footer mt-4">
          <div className="sys-footer-title">gambino.labs</div>
          <div className="sys-footer-sub">experimental software · tools · creative systems</div>
          <div className="sys-footer-copy">© 2026 Gambino Labs</div>
        </footer>
      </div>

      <style>{`
        /* ── Reset & root ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cyb-root {
          min-height: 100vh;
          background: #000;
          color: #fff;
          overflow-x: hidden;
          cursor: none;
          font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
        }

        /* ── CRT overlay ── */
        .crt-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 500;
          background:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,255,156,0.015) 2px,
              rgba(0,255,156,0.015) 4px
            );
          mix-blend-mode: screen;
        }
        .crt-overlay::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%);
        }

        /* ── Content wrapper ── */
        .cyb-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 6rem 1.5rem;
        }

        /* ── Glitch title ── */
        @keyframes neon-shift {
          0%   { color: #00ff9c; text-shadow: 0 0 18px #00ff9c55, 0 0 40px #00ff9c1a; }
          25%  { color: #00ffd5; text-shadow: 0 0 26px #00ffd566, 0 0 55px #00ffd51a; }
          50%  { color: #00ff9c; text-shadow: 0 0 34px #00ff9c88, 0 0 68px #00ff9c33; }
          75%  { color: #39ff14; text-shadow: 0 0 22px #39ff1455, 0 0 44px #39ff141a; }
          100% { color: #00ff9c; text-shadow: 0 0 18px #00ff9c55, 0 0 40px #00ff9c1a; }
        }

        @keyframes glitch-1 {
          0%,92%,100%  { clip-path: inset(0 0 100% 0); transform: translate(0); }
          93%  { clip-path: inset(20% 0 50% 0); transform: translate(-4px, 1px); color: #00ffd5; }
          95%  { clip-path: inset(60% 0 10% 0); transform: translate(4px, -1px); color: #ff0055; }
          97%  { clip-path: inset(40% 0 30% 0); transform: translate(-2px, 2px); color: #00ff9c; }
        }

        @keyframes glitch-2 {
          0%,94%,100%  { clip-path: inset(0 0 100% 0); transform: translate(0); }
          95%  { clip-path: inset(70% 0 5% 0); transform: translate(3px, -2px); color: #ff0055; }
          97%  { clip-path: inset(10% 0 70% 0); transform: translate(-3px, 1px); color: #00ffd5; }
        }

        .glitch-title {
          position: relative;
          font-size: clamp(2.5rem, 7vw, 4.5rem);
          font-weight: 700;
          letter-spacing: 0.04em;
          animation: neon-shift 8s ease-in-out infinite;
        }

        .glitch-title::before,
        .glitch-title::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .glitch-title::before { animation: glitch-1 7s infinite; }
        .glitch-title::after  { animation: glitch-2 7s infinite 0.5s; }

        @keyframes blink {
          0%,49%  { opacity: 1; }
          50%,100%{ opacity: 0; }
        }
        .blink-cursor { animation: blink 1s step-end infinite; }

        /* ── Subheading ── */
        .subheading {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(0,255,156,0.42);
        }

        /* ── REBOOT button (preserved) ── */
        .reboot-key {
          position: fixed; top: 20px; left: 20px; z-index: 9000;
          font-family: 'JetBrains Mono','Fira Code','Courier New',monospace;
          font-size: 9px; font-weight: 700; letter-spacing: 0.22em;
          color: #00ff9c;
          background: rgba(0,0,0,0.88);
          border: 1.5px solid rgba(0,255,156,0.55);
          border-bottom: 3px solid rgba(0,255,156,0.55);
          border-radius: 5px;
          padding: 5px 11px 7px;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(0,255,156,0.18), inset 0 0 6px rgba(0,255,156,0.05);
          transition: background 0.2s, border-color 0.2s, transform 0.1s;
        }

        @keyframes key-pulse {
          0%,100% { box-shadow: 0 0 8px rgba(0,255,156,0.18), inset 0 0 6px rgba(0,255,156,0.05); }
          50%     { box-shadow: 0 0 22px rgba(0,255,156,0.6), 0 0 38px rgba(0,255,156,0.15), inset 0 0 10px rgba(0,255,156,0.12); }
        }

        .reboot-key:hover {
          background: rgba(0,255,156,0.07);
          border-color: #00ff9c;
          animation: key-pulse 0.9s ease-in-out infinite;
          transform: translateY(-1px);
        }
        .reboot-key:active { transform: translateY(1px); border-bottom-width: 1.5px; }

        /* ── Terminal status (preserved) ── */
        .terminal-status {
          background: rgba(0,0,0,0.65);
          border: 1px solid rgba(0,255,156,0.1);
          border-radius: 8px;
          padding: 14px 22px;
          width: 100%; max-width: 310px;
          line-height: 2;
          font-family: inherit;
        }
        .terminal-header { font-size: 10px; color: rgba(0,255,156,0.32); letter-spacing: 0.1em; margin-bottom: 4px; }
        .terminal-line { display: flex; align-items: center; font-size: 11px; }
        .terminal-label { color: rgba(0,255,156,0.6); min-width: 124px; }
        .terminal-dots { color: rgba(0,255,156,0.16); flex: 1; letter-spacing: 0.04em; }

        @keyframes online-flicker {
          0%,88%,100% { opacity: 1; }
          90% { opacity: 0.18; }
          93% { opacity: 1; }
          96% { opacity: 0.28; }
        }
        .terminal-online { color: #00ff9c; text-shadow: 0 0 8px rgba(0,255,156,0.5); animation: online-flicker 6s ease-in-out infinite; }
        .terminal-line:nth-child(2) .terminal-online { animation-delay: 0.0s; }
        .terminal-line:nth-child(3) .terminal-online { animation-delay: 1.2s; }
        .terminal-line:nth-child(4) .terminal-online { animation-delay: 2.5s; }
        .terminal-line:nth-child(5) .terminal-online { animation-delay: 0.7s; }
        .terminal-line:nth-child(6) .terminal-online { animation-delay: 3.8s; }

        /* ── Cards grid ── */
        .cyb-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 1.5rem;
          max-width: 72rem;
          width: 100%;
          margin-left: auto;
          margin-right: auto;
        }
        @media (min-width: 640px) { .cyb-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 768px) { .cyb-grid { gap: 2rem; } }
        @media (min-width: 1024px) { .cyb-grid { grid-template-columns: repeat(4, 1fr); } }

        /* ── Holographic card ── */
        .holo-card {
          position: relative;
          display: block;
          text-decoration: none;
          background: rgba(0,0,0,0.6);
          border: 1px solid rgba(0,255,156,0.22);
          border-radius: 14px;
          padding: 26px;
          overflow: hidden;
          cursor: none;
          opacity: 0;
          will-change: transform, opacity;
          transition:
            opacity 0.55s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .holo-card--visible { opacity: 1; }

        .holo-card:hover {
          border-color: rgba(0,255,156,0.75);
          box-shadow:
            0 0 30px rgba(0,255,156,0.25),
            0 0 60px rgba(0,255,156,0.08),
            inset 0 0 30px rgba(0,255,156,0.04);
        }

        /* Holographic rainbow shine */
        .holo-shine {
          position: absolute; inset: 0; pointer-events: none; border-radius: 14px;
          background: radial-gradient(
            circle at var(--shine-x, 50%) var(--shine-y, 50%),
            rgba(0,255,200,0.13) 0%,
            rgba(0,180,255,0.07) 30%,
            transparent 65%
          );
          transition: background 0.05s;
          mix-blend-mode: screen;
        }

        /* Scanlines on card */
        .holo-scanlines {
          position: absolute; inset: 0; pointer-events: none; border-radius: 14px;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,255,156,0.025) 3px,
            rgba(0,255,156,0.025) 4px
          );
          opacity: 0;
          transition: opacity 0.3s;
        }
        .holo-card:hover .holo-scanlines { opacity: 1; }

        /* Corner brackets */
        .holo-corner {
          position: absolute; width: 12px; height: 12px;
          border-color: #00ff9c; border-style: solid; opacity: 0.5;
          transition: opacity 0.3s, width 0.3s, height 0.3s;
        }
        .holo-card:hover .holo-corner { opacity: 1; width: 18px; height: 18px; }
        .holo-corner--tl { top: 8px; left: 8px; border-width: 2px 0 0 2px; }
        .holo-corner--tr { top: 8px; right: 8px; border-width: 2px 2px 0 0; }
        .holo-corner--bl { bottom: 8px; left: 8px; border-width: 0 0 2px 2px; }
        .holo-corner--br { bottom: 8px; right: 8px; border-width: 0 2px 2px 0; }

        /* Card text */
        .module-index { font-size: 9px; letter-spacing: 0.16em; color: rgba(0,255,156,0.28); text-transform: uppercase; margin-bottom: 12px; }
        .module-title { font-size: 19px; font-weight: 700; color: #00ff9c; margin-bottom: 8px; letter-spacing: 0.03em; transition: text-shadow 0.3s; }
        .holo-card:hover .module-title { text-shadow: 0 0 16px rgba(0,255,156,0.6); }
        .module-desc { font-size: 13px; color: rgba(134,239,172,0.5); line-height: 1.65; }
        .module-link { display: inline-block; margin-top: 20px; font-size: 11px; color: rgba(0,255,156,0.38); transition: color 0.3s, transform 0.3s; }
        .holo-card:hover .module-link { color: rgba(0,255,156,0.88); transform: translateX(4px); }

        /* ── sys-hint / kbd ── */
        .sys-hint { font-family: inherit; font-size: 11px; letter-spacing: 0.12em; color: rgba(0,255,156,0.55); text-align: center; }
        .sys-kbd { display: inline-block; font-family: inherit; font-size: 10px; color: #00ff9c; border: 1px solid rgba(0,255,156,0.45); border-bottom-width: 2px; border-radius: 3px; padding: 1px 5px; background: rgba(0,255,156,0.05); }

        /* ── System alert toasts ── */
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toast-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }

        .sys-toast {
          font-family: 'JetBrains Mono','Fira Code','Courier New',monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          color: #00ff9c;
          background: rgba(0,0,0,0.88);
          border: 1px solid rgba(0,255,156,0.3);
          border-left: 3px solid #00ff9c;
          border-radius: 4px;
          padding: 8px 14px;
          box-shadow: 0 0 18px rgba(0,255,156,0.15), 0 4px 24px rgba(0,0,0,0.6);
          animation: toast-in 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
          max-width: 320px;
          white-space: nowrap;
        }

        /* ── Easter egg ── */
        @keyframes ee-flicker {
          0%,100% { opacity: 1; }
          8%  { opacity: 0.1; }
          10% { opacity: 1; }
          42% { opacity: 0.8; }
          43% { opacity: 0.1; }
          45% { opacity: 1; }
          76% { opacity: 0.9; }
          77% { opacity: 0.05; }
          79% { opacity: 1; }
        }

        @keyframes ee-scan {
          from { top: -100%; }
          to   { top: 200%; }
        }

        @keyframes ee-in {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes ee-chromatic {
          0%,100% { text-shadow: -2px 0 #ff0055, 2px 0 #00ffd5; }
          33% { text-shadow: 2px 0 #ff0055, -2px 0 #00ffd5; }
          66% { text-shadow: 0 0 #ff0055, 0 0 #00ffd5; }
        }

        .easter-overlay {
          position: fixed; inset: 0; z-index: 99999;
          background: rgba(0,0,0,0.92);
          display: flex; align-items: center; justify-content: center;
          animation: ee-flicker 0.5s ease forwards;
          overflow: hidden;
        }

        .easter-overlay::before {
          content: '';
          position: absolute;
          left: 0; width: 100%; height: 40%;
          background: linear-gradient(transparent, rgba(0,255,156,0.06), transparent);
          animation: ee-scan 1.2s linear infinite;
        }

        .easter-box {
          text-align: center;
          animation: ee-in 0.4s cubic-bezier(0.22,1,0.36,1) forwards;
          font-family: 'JetBrains Mono','Fira Code','Courier New',monospace;
        }

        .easter-skull {
          font-size: 72px;
          line-height: 1;
          margin-bottom: 24px;
          filter: drop-shadow(0 0 24px #00ff9c);
          animation: ee-chromatic 0.3s infinite;
        }

        .easter-title {
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 700;
          color: #00ff9c;
          letter-spacing: 0.2em;
          text-shadow: 0 0 30px rgba(0,255,156,0.8), 0 0 60px rgba(0,255,156,0.4);
          animation: ee-chromatic 0.25s infinite;
          margin-bottom: 16px;
        }

        .easter-sub {
          font-size: 13px;
          color: rgba(0,255,156,0.7);
          letter-spacing: 0.12em;
          margin-bottom: 12px;
        }

        .easter-code {
          font-size: 11px;
          color: rgba(0,255,156,0.4);
          letter-spacing: 0.16em;
          border: 1px solid rgba(0,255,156,0.2);
          display: inline-block;
          padding: 4px 16px;
          border-radius: 3px;
        }

        /* ── Footer ── */
        .sys-footer { font-family: inherit; text-align: center; border-top: 1px solid rgba(0,255,156,0.08); padding-top: 16px; width: 100%; }
        .sys-footer-title { font-size: 12px; font-weight: 700; color: rgba(0,255,156,0.5); letter-spacing: 0.12em; }
        .sys-footer-sub { font-size: 10px; color: rgba(0,255,156,0.28); letter-spacing: 0.08em; margin-top: 3px; }
        .sys-footer-copy { font-size: 10px; color: rgba(0,255,156,0.2); letter-spacing: 0.06em; margin-top: 6px; }
      `}</style>
    </main>
  );
}
