import * as csv from "fast-csv";
import type { TrackingType, FileTrackingType } from "../schema/tracking.js";

const parseCSV = async (file: string) => {
  const data: FileTrackingType = [];
  const delimiters = [",", ";", "|", "+", "\t"];
  await new Promise<void>((resolve) => {
    for (const test of delimiters) {
      if (data.length > 0) break;
      csv
        .parseString(file, {
          objectMode: true,
          delimiter: test,
          headers: true,
          ignoreEmpty: true,
          trim: true,
        })
        .on("data", (row) => data.push(row as TrackingType))
        .on("end", () => {
          resolve();
        });
    }
  });
  return data as unknown;
};

export default parseCSV;
