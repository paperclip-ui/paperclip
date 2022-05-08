import * as React from "react";
import { compose, pure } from "recompose";
import { withPureInputHandlers } from "../text/controller";
export default compose(pure, withPureInputHandlers(), (Base) => ({ value, onKeyDown }) => {
    return React.createElement(Base, { defaultValue: value, onKeyDown: onKeyDown });
});
//# sourceMappingURL=controller.js.map