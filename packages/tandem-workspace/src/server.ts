import getPort from "get-port";
import express from "express";

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

  const server = express();
  server.listen(port);

  return { port };
};
