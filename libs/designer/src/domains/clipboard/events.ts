import { BaseEvent } from "@paperclip-ui/common";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";

export type ExpressionPasted = BaseEvent<
  "clipboard/expressionPasted",
  { expr: ast.InnerExpressionInfo; type: "cut" | "copy" }
>;

export type ClipboardEvent = ExpressionPasted;
