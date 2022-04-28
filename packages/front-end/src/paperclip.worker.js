import { createLocalPCRuntime, hookRemotePCRuntime } from "paperclip";
hookRemotePCRuntime(createLocalPCRuntime(), self);