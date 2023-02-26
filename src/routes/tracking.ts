import { Static, Type } from "@sinclair/typebox";
import { TypeSystem } from "@sinclair/typebox/system";
import { readFile } from "node:fs/promises";

import type { FastifyInstance } from "fastify";

const carrierCodes = JSON.parse(
  await readFile("src/data/carrier_codes.json", "utf8")
) as string[];

const CarrierCode = TypeSystem.CreateType<(typeof carrierCodes)[number]>(
  "CarrierCode",
  (_options, value) => {
    if (typeof value !== "string") return false;
    return carrierCodes.includes(value);
  }
);

const TrackingData = Type.Object({
  courier: CarrierCode(),
  tracking_number: Type.String(),
  zip_code: Type.String(), // Validate this in a pre-handler using regex perhaps, or with a call to some sort of postcode validation API. Or with custom AJV format.
  destination_country_iso3: Type.String({ format: "country_code" }), // Validate this in a custom AJV format using country-code-lookup.
  return: Type.Optional(Type.Boolean()),
  cancelled: Type.Optional(Type.Boolean()),
  notificationsInactive: Type.Optional(Type.Boolean()),
});

type TrackingType = Static<typeof TrackingData>;

const tracking = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: TrackingType }>(
    "/",
    {
      preValidation: (req, _reply, done) => {
        const { properties } = TrackingData;
        const desiredPropertyKeys = Object.keys(properties);
        for (const prop in req.body) {
          if (!desiredPropertyKeys.includes(prop))
            delete req.body[prop as keyof TrackingType];
        }
        done();
      },
      schema: {
        body: TrackingData,
      },
    },
    (req) => {
      console.log(req.body);
      return "tracking";
    }
  );
};

export default tracking;
