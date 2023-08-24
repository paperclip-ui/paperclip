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

    const handleFileNavigatorItemClicked = (
      event: FileNavigatorItemClicked
    ) => {
      if (event.payload.kind === FSItemKind.File) {
        // TODO: need to display an error somehow
        if (isPaperclipFile(event.payload.path)) {
          history.redirect(routes.editor(event.payload.path));
        }
      }
    };

    const handleEvent = (event: DesignerEvent) => {
      switch (event.type) {
        case "designer-engine/designFileCreated":
          return handleDesignFileCreated(event);
        case "ui/FileNavigatorItemClicked":
          return handleFileNavigatorItemClicked(event);
      }
    };

    return {
      dispose: () => {},
      handleEvent,
    };
  };
