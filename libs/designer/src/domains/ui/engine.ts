import { Engine, isPaperclipFile } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState, FSItemKind } from "../../state";
import { routes } from "../../state/routes";
import { DesignFileCreated } from "../api/events";
import { History } from "../history/history";
import { FileNavigatorItemClicked } from "./events";

export const createUIEngine =
  (history: History) => (): Engine<DesignerState, DesignerEvent> => {
    const handleDesignFileCreated = ({
      payload: { filePath },
    }: DesignFileCreated) => {
      history.redirect(routes.editor(filePath));
    };

    const handleEvent = (event: DesignerEvent) => {
      switch (event.type) {
        case "designer-engine/designFileCreated":
          return handleDesignFileCreated(event);
      }
    };

    return {
      dispose: () => {},
      handleEvent,
    };
  };
