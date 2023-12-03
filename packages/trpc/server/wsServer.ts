import ws from "ws";

import { applyWSSHandler } from "@trpc/server/adapters/ws";

import { createContext } from "./createContext";
import { appRouter } from "./routers/_app";

const wss = new ws.Server({
  port: 3005,
});
const handler = applyWSSHandler({ wss, router: appRouter, createContext });

wss.on("connection", (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log("✅ WebSocket Server listening on ws://localhost:3005");

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
