import type { FileTrackingType, TrackingType } from "../routes/tracking.js";

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
