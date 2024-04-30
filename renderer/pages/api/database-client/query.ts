import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

import * as z from "zod";

import { corsConfig } from "../../../utils/cors";
import { DataSourceConnectionFactory } from "../../../utils/database";

const querySchema = z.object({
  connectionString: z.string(),
  query: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  resp: NextApiResponse
) {
  await NextCors(req, resp, corsConfig);

  const { method } = req;
  if (method === "OPTIONS") {
    resp.setHeader("Allow", "POST");
    return resp.status(200).send("ok");
  }

  try {
    const { connectionString, query } = querySchema.parse(req.body);

    const dataSourceConnection =
      DataSourceConnectionFactory.createDataSourceConnection(connectionString);
    await dataSourceConnection.connect();
    const result = await dataSourceConnection.query(query);
    await dataSourceConnection.disconnect();

    resp.status(200).json(result);
  } catch (error) {
    console.error(error);
    resp.status(500).end();
  }
}
