import { readFile } from "node:fs/promises";
import { Static, Type } from "@sinclair/typebox";
import { TypeSystem } from "@sinclair/typebox/system";

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

export { CarrierCodeType, carrierCodes, TrackingData, TrackingType };
