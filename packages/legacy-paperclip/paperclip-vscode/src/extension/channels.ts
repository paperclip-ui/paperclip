import { remoteChannel } from "@paperclip-lang/common";
import { ExprSource } from "@paperclip-ui/utils";

export interface DesignServerStartedInfo {
  httpPort: number;
  projectId: string;
}

export const designServerStartedChannel = remoteChannel<
  DesignServerStartedInfo,
  void
>("designServerStartedChannel");

export const revealSourceChannel = remoteChannel<ExprSource, void>(
  "revealSourceChannel"
);
