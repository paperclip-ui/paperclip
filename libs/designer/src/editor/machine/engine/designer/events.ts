import {
  eventCreators,
  ExtractEventFromCreators,
} from "../../../modules/machine";

export const designerEngineEvents = eventCreators({}, "designer-engine");

export type DesignerEngineEvent = ExtractEventFromCreators<
  typeof designerEngineEvents
>;
