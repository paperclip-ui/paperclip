import { Engine, isPaperclipFile } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState, FSItemKind } from "../../state";
import { routes } from "../../state/routes";
import { DesignFileCreated } from "../api/events";
import { History } from "../history/history";
import { FileNavigatorItemClicked } from "./events";

export const createUIEngine =
  (history: History) => (): Engine<DesignerState, DesignerEvent> => {
    const handleEvent = (event: DesignerEvent) => {};

    return {
      dispose: () => {},
      handleEvent,
    };
  };
