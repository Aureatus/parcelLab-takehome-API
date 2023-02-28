import { Static, Type } from "@sinclair/typebox";
import { TypeSystem } from "@sinclair/typebox/system";

import { readFile } from "node:fs/promises";

import type { FastifyInstance } from "fastify";

import getDesiredProperites from "../helpers/transformations/get-desired-properties.js";
import castNumsToStrings from "../helpers/transformations/cast-nums-to-strings.js";
import exchangeCarrierNamesForKeys from "../helpers/transformations/exchange-carrier-names-for-keys.js";
import parseCSV from "../helpers/parse-csv.js";
import fakeSend from "../helpers/fake-send.js";

export type CarrierCodeType = {
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

export type TrackingType = Static<typeof TrackingData>;

export type FileTrackingType = TrackingType[];

const FileParametersSchema = Type.Object({
  type: Type.String(),
});

type FileParametersType = Static<typeof FileParametersSchema>;

const tracking = async (fastify: FastifyInstance) => {
  const baseUrl = "https://api.parcellab.com";
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
    async (req) => {
      await fakeSend(`${baseUrl}/track`, {
        method: "POST",
        body: req.body,
      });
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
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
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

          information = getDesiredProperites(information, desiredPropertyKeys);

          information = castNumsToStrings(information);

          information = exchangeCarrierNamesForKeys(information, carrierCodes);

          req.body = information;
        } else if (data.mimetype === "text/csv") {
          const data = await parseCSV(keyCorrectedFile);

          let information: FileTrackingType = [];
          Array.isArray(data)
            ? (information = data) // Not ideal, it's not a good assertion to have.
            : (information = [data] as FileTrackingType); // Not ideal, it's not a good assertion to have.
          const { properties } = TrackingData;
          const desiredPropertyKeys = Object.keys(properties);

          information = getDesiredProperites(information, desiredPropertyKeys);

          information = castNumsToStrings(information);

          information = exchangeCarrierNamesForKeys(information, carrierCodes);

          req.body = information;
        } else throw new Error(`File type ${data.mimetype} not supported`);
      },
      schema: { body: Type.Array(TrackingData), params: FileParametersSchema },
    },
    async (req) => {
      await fakeSend(`${baseUrl}/upload/data/${req.params.type}`, {
        method: "POST",
        body: req.body,
      });
      return req.body;
    }
  );
};

export default tracking;
