import { fastify } from "fastify";

const server = fastify();

server.listen({ port: 8080 }, (err, address) => {
  if (err instanceof Error) {
    console.error(err);
  }
  console.log(`Server listening at ${address}`);
});
