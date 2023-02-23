import { fastify } from "fastify";

import tracking from "./routes/tracking.js";

const server = fastify();

await server.register(tracking, { prefix: "/tracking" });

server.listen({ port: 8080 }, (err, address) => {
  if (err instanceof Error) {
    console.error(err);
  }
  console.log(`Server listening at ${address}`);
});
