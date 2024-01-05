import { BaseEvent } from "@paperclip-ui/common";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import { ComputedStyleMap } from "@paperclip-ui/core/lib/proto/ast/serialize";
import { ShortcutCommand } from "../shortcuts/state";

export type ClipboardPayload =
  | {
      type: ShortcutCommand.Cut | ShortcutCommand.Copy;
      data: ast.InnerExpressionInfo;
    }
  | {
      type: ShortcutCommand.CopyStyles;
      data: ComputedStyleMap;
    };

export type ExpressionPasted = BaseEvent<
  "clipboard/expressionPasted",
  ClipboardPayload
>;

export type ClipboardEvent = ExpressionPasted;
