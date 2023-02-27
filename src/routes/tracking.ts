/* eslint-disable @typescript-eslint/no-misused-promises */
import { Static, Type } from "@sinclair/typebox";
import { TypeSystem } from "@sinclair/typebox/system";
import { Value } from "@sinclair/typebox/value";

import { readFile } from "node:fs/promises";

import type { FastifyInstance } from "fastify";

type CarrierCodeType = {
  [key: string]: string;
};

const carrierCodes = JSON.parse(
  await readFile("src/data/carrier_codes.json", "utf8")
) as CarrierCodeType;

const CarrierCode = TypeSystem.CreateType<(typeof carrierCodes)[number]>(
  "CarrierCode",
  (_options, value) => {
    if (typeof value !== "string") return false;
    return Object.keys(carrierCodes).includes(value);
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

type FileTrackingType = TrackingType[];

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

  fastify.post<{
    Body: TrackingType | FileTrackingType;
    Params: FileParametersType;
  }>(
    "/file/:type",
    {
      preValidation: async (req) => {
        const data = await req.file();
        if (data === undefined) throw new Error("No file uploaded"); // Currently sends 500 status code, should be 400. Can potentially fix with setErrorHandler
        const dataBuffer = await data.toBuffer(); // Throws error if file is over allowed size.
        const file = dataBuffer.toString();
        const keyCorrectedFile = file
          .replaceAll("Courier", "courier")
          .replaceAll("TrackingNo", "tracking_number")
          .replaceAll("ZipCode", "zip_code")
          .replaceAll("DestinationCountry", "destination_country_iso3");

        if (data.mimetype === "application/json") {
          const parsedFile = JSON.parse(keyCorrectedFile) as unknown;
          let information: FileTrackingType = [];
          Array.isArray(parsedFile)
            ? (information = parsedFile as FileTrackingType) // Not ideal, it's not a good assertion to have.
            : (information = [parsedFile] as FileTrackingType); // Not ideal, it's not a good assertion to have.
          const { properties } = TrackingData;
          const desiredPropertyKeys = Object.keys(properties);
          information.forEach((element) => {
            for (const prop in element) {
              if (!desiredPropertyKeys.includes(prop))
                delete element[prop as keyof TrackingType];
            }
          });
          information.forEach((element) => {
            if (typeof element.tracking_number === "number")
              element.tracking_number = Value.Cast(
                Type.String(),
                element.tracking_number
              );
            if (typeof element.zip_code === "number")
              element.zip_code = Value.Cast(Type.String(), element.zip_code);
          });

          information.forEach((element) => {
            for (const [key, value] of Object.entries(carrierCodes)) {
              if (element.courier.split(" ")[0]?.includes("GLS"))
                element.courier = "gls";
              if (value === element.courier) element.courier = key;
            }
          });

          req.body = information;
        }
      },
      schema: { body: Type.Array(TrackingData), params: FileParametersSchema },
    },
    async (req) => {
      return req.body;
    }
  );
};

export default tracking;
