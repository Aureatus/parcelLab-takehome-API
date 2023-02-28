import type { FileTrackingType } from "../../routes/tracking.js";
import type { TrackingType } from "../../schema/tracking.js";

const getDesiredProperites = (
  information: FileTrackingType,
  desiredPropertyKeys: string[]
) => {
  return information.map((element) => {
    const constructedObject = { ...element };
    for (const prop in element) {
      if (!desiredPropertyKeys.includes(prop)) {
        delete constructedObject[prop as keyof TrackingType];
      }
    }
    return constructedObject;
  });
};

export default getDesiredProperites;
