import { BaseEvent } from "@paperclip-ui/common";
import { DesignerEngineEvent } from "../domains/api/events";
import { HistoryEngineEvent } from "../domains/history/events";
import { ShortcutEvent } from "../domains/shortcuts/events";
import { KeyboardEngineEvent } from "../domains/keyboard/events";
import { UIEvent } from "../domains/ui/events";
import { ClipboardEvent } from "../domains/clipboard/events";

export type DesignerEvent =
  | DesignerEngineEvent
  | HistoryEngineEvent
  | ClipboardEvent
  | ShortcutEvent
  | KeyboardEngineEvent
  | UIEvent;
