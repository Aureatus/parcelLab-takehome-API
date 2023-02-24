import { fastify } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import tracking from "./routes/tracking.js";

const server = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
}).withTypeProvider<TypeBoxTypeProvider>();

await server.register(tracking, { prefix: "/tracking" });

server.listen({ port: 8080 }, (err) => {
  if (err instanceof Error) {
    console.error(err);
  }
});
