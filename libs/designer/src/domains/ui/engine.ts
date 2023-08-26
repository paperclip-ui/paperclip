import { Engine, isPaperclipFile } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState, FSItemKind } from "../../state";
import { History } from "../history/history";

export const createUIEngine =
  (history: History) => (): Engine<DesignerState, DesignerEvent> => {
    const handleEvent = (event: DesignerEvent) => {};

    return {
      dispose: () => {},
      handleEvent,
    };
  };
