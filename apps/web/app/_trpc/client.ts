import type { AppRouter } from "@calcom/trpc/server/routers/_app";

import { createTRPCProxyClient, createWSClient, wsLink } from "@trpc/client";

// create persistent WebSocket connection
const wsClient = createWSClient({
  url: `ws://localhost:3005`,
});

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    wsLink({
      client: wsClient,
    }),
  ],
});
