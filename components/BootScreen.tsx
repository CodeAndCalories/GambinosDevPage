"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LINES = [
  { text: "gambinos.system v1.0", delay: 0 },
  { text: "initializing environment...", delay: 120 },
  { text: "connecting neural circuits...", delay: 240 },
  { text: "mapping creative pathways...", delay: 360 },
  { text: "assembling digital machinery...", delay: 480 },
  { text: "training caffeine model...", delay: 600 },
  { text: "debugging reality...", delay: 720 },
  { text: "loading experimental modules...", delay: 840 },
  { text: "[✓] systems online", delay: 1000, check: true },
  { text: "[✓] modules loaded", delay: 1100, check: true },
  { text: "[✓] creativity engine active", delay: 1200, check: true },
  { text: "system ready", delay: 1380 },
];

const CHAR_DELAY = 18; // ms per character
const FADE_DELAY = 600; // ms after last line before fade

interface BootLine {
  text: string;
  delay: number;
  check?: boolean;
}

interface TypedLine {
  text: string;
  displayed: string;
  check: boolean;
  done: boolean;
}

interface BootScreenProps {
  onComplete?: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [lines, setLines] = useState<TypedLine[]>([]);
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [cursorLine, setCursorLine] = useState(-1);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;

    BOOT_LINES.forEach((line: BootLine, lineIndex: number) => {
      // Start typing each line after its delay
      const startTimer = setTimeout(() => {
        setLines((prev) => [
          ...prev,
          { text: line.text, displayed: "", check: !!line.check, done: false },
        ]);
        setCursorLine(lineIndex);

        // Type characters one by one
        for (let i = 1; i <= line.text.length; i++) {
          const charTimer = setTimeout(() => {
            setLines((prev) =>
              prev.map((l, idx) =>
                idx === lineIndex
                  ? {
                      ...l,
                      displayed: line.text.slice(0, i),
                      done: i === line.text.length,
                    }
                  : l
              )
            );
          }, i * CHAR_DELAY);
          timers.push(charTimer);
        }
      }, line.delay);

      timers.push(startTimer);
    });

    // After all lines finish, trigger fade
    const lastLine = BOOT_LINES[BOOT_LINES.length - 1];
    const totalDuration =
      lastLine.delay + lastLine.text.length * CHAR_DELAY + FADE_DELAY;

    const fadeTimer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 700);
    }, totalDuration);

    timers.push(fadeTimer);

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {!fading && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" }}
        >
          <div className="w-full max-w-xl px-8">
            {lines.map((line, i) => (
              <div key={i} className="flex items-center leading-relaxed">
                <LineText line={line} isActive={i === cursorLine && !fading} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {fading && (
        <motion.div
          key="boot-fade"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" }}
        >
          <div className="w-full max-w-xl px-8">
            {lines.map((line, i) => (
              <div key={i} className="flex items-center leading-relaxed">
                <LineText line={line} isActive={false} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LineText({
  line,
  isActive,
}: {
  line: TypedLine;
  isActive: boolean;
}) {
  const isCheck = line.check && line.displayed.startsWith("[✓]");
  const isReady = line.text === "system ready";
  const isHeader = line.text.startsWith("gambinos");

  const textColor = isCheck
    ? "text-green-400"
    : isReady
    ? "text-green-300 font-bold"
    : isHeader
    ? "text-green-300"
    : "text-green-500";

  const textSize = isHeader ? "text-sm" : "text-xs";

  return (
    <span className={`${textColor} ${textSize} tracking-wide`}>
      {isCheck && line.displayed.length > 0 ? (
        <>
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15, ease: "backOut" }}
            className="text-green-400"
          >
            {line.displayed.slice(0, 4)}
          </motion.span>
          {line.displayed.slice(4)}
        </>
      ) : (
        line.displayed
      )}
      {isActive && !line.done && <Cursor />}
      {isActive && line.done && <Cursor />}
    </span>
  );
}

function Cursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      className="inline-block ml-0.5 text-green-400 select-none"
    >
      █
    </motion.span>
  );
}
