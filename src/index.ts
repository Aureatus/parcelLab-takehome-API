import { fastify } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import tracking from "./routes/tracking.js";

const server = fastify().withTypeProvider<TypeBoxTypeProvider>();

await server.register(tracking, { prefix: "/tracking" });

server.listen({ port: 8080 }, (err, address) => {
  if (err instanceof Error) {
    console.error(err);
  }
  console.log(`Server listening at ${address}`);
});
