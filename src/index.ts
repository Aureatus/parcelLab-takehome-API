import { fastify } from "fastify";
import {
  TypeBoxTypeProvider,
  TypeBoxValidatorCompiler,
} from "@fastify/type-provider-typebox";
import { fastifyMultipart } from "@fastify/multipart";

import addCustomFormats from "./plugins/custom-formats.js";
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

await server.register(fastifyMultipart, {
  limits: { files: 1, fileSize: 500000000 }, // 500MB file limit.
});

await server.register(addCustomFormats);

await server.register(tracking, { prefix: "/tracking" });

server.listen({ port: 8080 }, (err) => {
  if (err instanceof Error) {
    console.error(err);
  }
});
