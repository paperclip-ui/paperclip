import {
  RPCClientAdapter,
  wsAdapter,
  createMockRPCServer,
} from "@paperclip-lang/common";
import { saveTmpFixtureFiles } from "@paperclip-lang/common/lib/test-utils";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { start } from "../server";
import { LogLevel } from "@paperclip-lang/common";
import * as ws from "ws";

export type TestServer = {
  stop: () => void;
  createClient: () => WorkspaceClient;
  createConnection: () => RPCClientAdapter;
  testDir: string;
  fixtureUris: Record<string, string>;
};

export const createTestServer = async (
  files: Record<string, string>,
  fixtureDir = "/tmp/__TEST__"
): Promise<TestServer> => {
  const fixtures = saveTmpFixtureFiles("fixtures", files, fixtureDir);

  const mockServer = createMockRPCServer();

  const server = await start({
    logLevel: LogLevel.None,
    pause: false,
    rpcServer: mockServer,
    useHttpServer: false,
    project: { installDependencies: false },
  });

  server.getWorkspace().start(fixtureDir);

  const createConnection = () => {
    return mockServer.createConnection();
  };
  return {
    testDir: fixtures.testDir,
    fixtureUris: fixtures.fixtureUris,
    stop() {
      server.stop();
      fixtures.dispose();
    },
    createConnection,
    createClient() {
      return new WorkspaceClient(createConnection());
    },
  };
};