import express from "express";

export const startHTTPServer = (port: number) => {
  const expressServer = express();
  const httpServer = expressServer.listen(port);

  return {
    httpServer,
    expressServer,
  };
};
