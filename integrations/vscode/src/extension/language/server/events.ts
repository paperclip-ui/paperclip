import {
  eventCreators,
  ExtractEventFromCreators,
  identity,
} from "@paperclip-ui/common";
import { FileChanged } from "@paperclip-ui/proto/lib/generated/service/designer";

export const serverEvents = eventCreators(
  {
    started: identity<{ port }>(),
    fileChanged: identity<{ path: string; content: string }>(),
  },
  "server"
);

export type ServerEvent = ExtractEventFromCreators<typeof serverEvents>;
