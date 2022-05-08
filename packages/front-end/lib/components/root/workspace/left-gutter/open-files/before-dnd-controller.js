import { compose } from "recompose";
import { withNodeDropTarget, withHoverVariant, withDndContext } from "./dnd-controller";
import { TreeMoveOffset } from "tandem-common";
export default compose(withDndContext, withNodeDropTarget(TreeMoveOffset.BEFORE), withHoverVariant);
//# sourceMappingURL=before-dnd-controller.js.map