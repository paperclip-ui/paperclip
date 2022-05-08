import { compose } from "recompose";
import { withNodeDropTarget, withHoverVariant, withDndContext } from "./dnd-controller";
import { TreeMoveOffset } from "tandem-common";
export default compose(withDndContext, withNodeDropTarget(TreeMoveOffset.AFTER), withHoverVariant);
//# sourceMappingURL=after-dnd-controller.js.map