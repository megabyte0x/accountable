"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// note: dynamic import is required for components that use the Frame SDK
const Accountable = dynamic(() => import("~/components/Accountable"), {
  ssr: false,
});

export default function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a placeholder with the same structure to avoid hydration mismatch
    return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-xl mx-auto p-4 sm:p-6 md:p-8" />
    </div>;
  }

  return <Accountable />;
}
