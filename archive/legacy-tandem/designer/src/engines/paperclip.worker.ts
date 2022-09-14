import {
  createLocalPCRuntime,
  hookRemotePCRuntime,
} from "@paperclip-lang/core";
hookRemotePCRuntime(createLocalPCRuntime(), self as any);
