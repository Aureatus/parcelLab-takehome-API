import { fastify } from "fastify";
import {
  TypeBoxTypeProvider,
  TypeBoxValidatorCompiler,
} from "@fastify/type-provider-typebox";

import tracking from "./routes/tracking.js";

const serverOptions = {
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  ajv: {
    customOptions: {
      coerceTypes: false,
    },
  },
};

const server = fastify(serverOptions)
  .withTypeProvider<TypeBoxTypeProvider>()
  .setValidatorCompiler(TypeBoxValidatorCompiler);

await server.register(tracking, { prefix: "/tracking" });

server.listen({ port: 8080 }, (err) => {
  if (err instanceof Error) {
    console.error(err);
  }
});
