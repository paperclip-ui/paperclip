import { DesignerClient as GRPCDesignerClient } from "@paperclip-ui/proto/lib/service/designer_grpc_web_pb";

export class DesignerClient {
  private _client: GRPCDesignerClient;
  constructor() {}
  start() {
    // 1. look for open designer
    // 2. if no open designer, then look for VS Code binary
    //   a. download binary from releases based on VS Code extension
    // 3. Connect to local GRPC server
  }
  updateVirtualFileContent(filePath: string, text: string) {}
}
