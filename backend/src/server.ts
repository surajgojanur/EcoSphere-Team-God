import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, "0.0.0.0", () => {
  console.log(`ecosphere-backend listening on port ${env.PORT}`);
});

async function shutdown(signal: NodeJS.Signals) {
  console.log(`${signal} received, shutting down ecosphere-backend`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

