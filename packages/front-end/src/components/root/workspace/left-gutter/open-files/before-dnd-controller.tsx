import { compose } from "recompose";
import {
  withNodeDropTarget,
  withHoverVariant,
  WithNodeDropTargetProps,
  withDndContext
} from "./dnd-controller";
import { TreeMoveOffset } from "tandem-common";

export type Props = WithNodeDropTargetProps & React.HTMLAttributes<any>;

export default compose<Props, Props>(
  withDndContext,
  withNodeDropTarget(TreeMoveOffset.BEFORE),
  withHoverVariant
);
