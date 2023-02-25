import { TypeSystem } from "@sinclair/typebox/system";
import { byIso } from "country-code-lookup";

import type { FastifyPluginAsync } from "fastify";

const addCustomFormats: FastifyPluginAsync = async () => {
  TypeSystem.CreateFormat("country_code", (x: string) => Boolean(byIso(x)));
};

export default addCustomFormats;
