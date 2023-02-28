import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

import type { FileTrackingType } from "../routes/tracking.js";

const castNumsToStrings = (information: FileTrackingType) => {
  return information.map((element) => {
    const constructedObject = { ...element };
    if (typeof constructedObject.tracking_number === "number")
      constructedObject.tracking_number = Value.Cast(
        Type.String(),
        constructedObject.tracking_number
      );
    if (typeof constructedObject.zip_code === "number")
      constructedObject.zip_code = Value.Cast(
        Type.String(),
        constructedObject.zip_code
      );

    return constructedObject;
  });
};

export default castNumsToStrings;
