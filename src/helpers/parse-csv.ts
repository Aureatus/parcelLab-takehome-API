import * as csv from "fast-csv";
import type { FileTrackingType } from "../routes/tracking.js";
import type { TrackingType } from "../schema/tracking.js";

const parseCSV = async (file: string) => {
  const data: FileTrackingType = [];
  await new Promise<void>((resolve) => {
    csv
      .parseString(file, {
        objectMode: true,
        delimiter: ";",
        headers: true,
        ignoreEmpty: true,
        trim: true,
      })
      .on("error", (error) => console.error(error))
      .on("data", (row) => data.push(row as TrackingType))
      .on("end", () => {
        resolve();
      });
  });
  return data;
};

export default parseCSV;
