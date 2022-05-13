import * as path from "path";
import getPort from "get-port";
import express from "express";
import execa from "execa";

export type TandemServerOptions = {
  port?: number;
};

export type TandemServerStartResult = {
  port: number;
};

export const startTandemServer = async ({
  port: fixedPort,
}: TandemServerOptions): Promise<TandemServerOptions> => {
  const port = fixedPort || (await getPort());

  console.log(`Starting HTTP server on port ${port}`);

  const server = express();
  server.use(express.static(path.resolve("tandem-designer")));
  server.listen(port);

  execa(`open`, [`http://localhost:${port}`]);

  return { port };
};
