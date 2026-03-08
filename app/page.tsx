"use client";

import { useState, useEffect } from "react";
import BootScreen from "@/components/BootScreen";

export default function Page() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("bootSeen");
    if (seen) setBooted(true);
  }, []);

  return (
    <>
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}

      {booted && (
        <main className="min-h-screen bg-black text-white flex items-center justify-center">
          <h1 className="text-4xl font-bold">Welcome to Gambino Dev</h1>
        </main>
      )}
    </>
  );
}