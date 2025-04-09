"use client";

import { createConfig, http, WagmiProvider } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";

const isDevelopment = process.env.NEXT_PUBLIC_ENV === "development";

export const config = createConfig({
  chains: [isDevelopment ? baseSepolia : base],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http()
  },
  connectors: [miniAppConnector()],
});

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
