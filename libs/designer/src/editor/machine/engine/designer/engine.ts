import { DesignerClient } from "../../../proto/designer_grpc_web_pb";
import { FileRequest } from "../../../proto/designer_pb";
import { Engine } from "../../../modules/machine/engine";
import { Dispatch } from "../../../modules/machine/events";
import { DesignerEngineEvent } from "./events";
import { DesignerEngineState } from "./state";
import * as qs from "querystring";

export const createDesignerEngine = (
  dispatch: Dispatch<DesignerEngineEvent>
): Engine<DesignerEngineState, DesignerEngineEvent> => {
  const client = new DesignerClient(
    window.location.protocol + "//" + window.location.host
  );

  const openFile = async (filePath: string) => {
    const fileRequest = new FileRequest();
    fileRequest.setPath(filePath);
    client
      .openFile(fileRequest)
      .on("data", (data) => {
        console.log(data);
      })
      .on("end", () => {
        console.log("END");
      });
  };

  openFile(new URLSearchParams(window.location.search).get("file"));

  const handleEvent = () => {};

  return {
    handleEvent,
    dispose: () => {},
  };
};
