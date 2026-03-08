// Example: app/page.tsx
"use client";

import { useState } from "react";
import BootScreen from "@/components/BootScreen";

export default function Page() {
  const [booted, setBooted] = useState(false);

  return (
    <>
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}
      {booted && (
        <main>
          {/* Your homepage content */}
        </main>
      )}
    </>
  );
}
