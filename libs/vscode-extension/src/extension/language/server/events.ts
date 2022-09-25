import {
  eventCreators,
  ExtractEventFromCreators,
  identity,
} from "@paperclip-ui/common";

export const serverEvents = eventCreators(
  {
    started: identity<{ port }>(),
  },
  "server"
);

export type ServerEvent = ExtractEventFromCreators<typeof serverEvents>;
