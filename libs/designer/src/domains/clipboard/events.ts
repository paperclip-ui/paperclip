import { BaseEvent } from "@paperclip-ui/common";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";

export type ExpressionPasted = BaseEvent<
  "clipboard/expressionPasted",
  ast.InnerExpressionInfo
>;

export type ClipboardEvent = ExpressionPasted;
