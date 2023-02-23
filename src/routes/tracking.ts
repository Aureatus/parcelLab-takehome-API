import type { FastifyInstance } from "fastify";

const tracking = async (fastify: FastifyInstance) => {
  fastify.post("/", () => {
    return "tracking";
  });
};

export default tracking;
