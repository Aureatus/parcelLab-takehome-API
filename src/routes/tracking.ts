import { Static, Type } from "@sinclair/typebox";

import type { FastifyInstance } from "fastify";

import carrierCodes from "../data/carrier_codes.json" assert { type: "json" };

const TrackingData = Type.Object({
  courier: Type.Union(carrierCodes.map((code) => Type.Literal(code))), // Perhaps improve by using custom AJV format....
  tracking_number: Type.String(),
  zip_code: Type.String(), // Validate this in a pre-handler using regex perhaps, or with a call to some sort of postcode validation API. Or with custom AJV format.
  destination_country_iso3: Type.String(), // Validate this in a custom AJV format using country-code-lookup.
  return: Type.Optional(Type.Boolean()),
  cancelled: Type.Optional(Type.Boolean()),
  notificationsInactive: Type.Optional(Type.Boolean()),
});

type TrackingType = Static<typeof TrackingData>;

const tracking = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: TrackingType }>(
    "/",
    {
      schema: {
        body: TrackingData,
      },
    },
    (req) => {
      console.log(req.body.notificationsInactive);
      return "tracking";
    }
  );
};

export default tracking;
