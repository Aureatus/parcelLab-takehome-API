/* eslint-disable @typescript-eslint/no-misused-promises */
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
  zip_code: Type.String(),
  destination_country_iso3: Type.String({ format: "country_code" }),
  return: Type.Optional(Type.Boolean()),
  cancelled: Type.Optional(Type.Boolean()),
  notificationsInactive: Type.Optional(Type.Boolean()),
});

type TrackingType = Static<typeof TrackingData>;

const FileParametersSchema = Type.Object({
  type: Type.String(),
});

type FileParametersType = Static<typeof FileParametersSchema>;

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

  fastify.post<{ Body: TrackingType; Params: FileParametersType }>(
    "/file/:type",
    {
      preValidation: async (req) => {
        const data = await req.file();
        if (data === undefined) throw new Error("No file uploaded"); // Currently sends 500 status code, should be 400. Can potentially fix with setErrorHandler
        const dataBuffer = await data.toBuffer(); // Throws error if file is over allowed size.
        const file = dataBuffer.toString();
        if (data.mimetype === "application/json") {
          const information = JSON.parse(file) as TrackingType; // Not ideal, it's not a good assertion to have.
          req.body = information;
          const { properties } = TrackingData;
          const desiredPropertyKeys = Object.keys(properties);
          for (const prop in req.body) {
            if (!desiredPropertyKeys.includes(prop))
              delete req.body[prop as keyof TrackingType];
          }
        }
      },
      schema: { body: TrackingData, params: FileParametersSchema },
    },
    async (req) => {
      return req.body;
    }
  );
};

export default tracking;
