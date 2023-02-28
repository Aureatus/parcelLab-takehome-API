/* eslint-disable @typescript-eslint/no-unused-vars */

const fakeSend = async (
  _url: string,
  _options: { body: unknown; method: "POST" | "GET" }
) => {
  return;
};

export default fakeSend;
