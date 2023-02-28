import type { CarrierCodeType, FileTrackingType } from "../routes/tracking.js";

const exchangeCarrierNamesForKeys = (
  information: FileTrackingType,
  carrierCodes: CarrierCodeType
) => {
  return information.map((element) => {
    const constructedObject = { ...element };
    for (const [key, value] of Object.entries(carrierCodes)) {
      if (constructedObject.courier.split(" ")[0]?.includes("GLS"))
        constructedObject.courier = "gls";
      if (value === constructedObject.courier) constructedObject.courier = key;
    }
    return constructedObject;
  });
};

export default exchangeCarrierNamesForKeys;
