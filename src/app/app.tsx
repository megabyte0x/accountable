"use client";

import dynamic from "next/dynamic";

// note: dynamic import is required for components that use the Frame SDK
const Accountable = dynamic(() => import("~/components/Accountable"), {
  ssr: false,
});

export default function App() {
  return <Accountable />;
}
