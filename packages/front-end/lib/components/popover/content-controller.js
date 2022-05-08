var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import { compose, pure, withState } from "recompose";
import { portal } from "../portal/controller";
import { mergeBounds, getBoundsSize } from "tandem-common";
const calcPortalPosition = (centered, anchorRect, portalRect) => {
    const portalSize = getBoundsSize(portalRect);
    const anchorSize = getBoundsSize(anchorRect);
    return {
        left: Math.min(anchorRect.left +
            (centered ? (anchorRect.right - anchorRect.left) / 2 : 0), window.innerWidth - portalSize.width),
        top: Math.min(anchorRect.top + anchorSize.height, window.innerHeight - portalSize.height)
    };
};
// ick, but okay for now. Will need to change
// when tests are added
let _popoverCount = 0;
export default compose((Base) => {
    return class extends React.Component {
        constructor() {
            super(...arguments);
            this.setContainer = (container) => {
                const { onShouldClose } = this.props;
                if (this._emptySpaceListener) {
                    if (this._popoverIndex) {
                        _popoverCount--;
                    }
                    document.body.removeEventListener("mousedown", this._emptySpaceListener);
                    document.removeEventListener("scroll", this._scrollListener, true);
                    this._emptySpaceListener = null;
                }
                if (container && onShouldClose) {
                    // note that we keep track of how many popovers there are currently in the root in case any pop over
                    // opens a separate popover -- in this case the user will need to click multiple times in order to close
                    // all popovers
                    this._popoverIndex = ++_popoverCount;
                    document.body.addEventListener("mousedown", (this._emptySpaceListener = event => {
                        if (!container.contains(event.target) &&
                            _popoverCount === this._popoverIndex) {
                            // beat onClick handler for dropdown button
                            setImmediate(() => {
                                onShouldClose(event);
                            });
                        }
                    }));
                    document.addEventListener("scroll", (this._scrollListener = event => {
                        if (!container.contains(event.target)) {
                            onShouldClose(event);
                        }
                    }), true);
                }
            };
        }
        render() {
            const _a = this.props, { anchorRect, children, setContainer } = _a, rest = __rest(_a, ["anchorRect", "children", "setContainer"]);
            return anchorRect ? (React.createElement(Base, Object.assign({ anchorRect: anchorRect }, rest),
                React.createElement("div", { ref: this.setContainer, style: { width: anchorRect.right - anchorRect.left } }, children))) : null;
        }
    };
}, pure, withState(`style`, `setStyle`, null), portal({
    didMount: ({ centered, anchorRect, setStyle, updateContentPosition }) => portalMount => {
        if (!portalMount ||
            !portalMount.children[0] ||
            !portalMount.children[0].children[0]) {
            return;
        }
        const popoverRect = calcInnerBounds(portalMount.children[0].children[0]
            .children[0]);
        let position = calcPortalPosition(centered, anchorRect, popoverRect);
        if (updateContentPosition) {
            position = updateContentPosition(position, popoverRect);
        }
        const newStyle = Object.assign({ position: "absolute", zIndex: 1024 }, position);
        setStyle(newStyle);
    }
}));
const calcInnerBounds = (element, maxDepth = 0, depth = 0) => {
    const rect = element.getBoundingClientRect();
    if (depth >= maxDepth)
        return rect;
    return mergeBounds(...Array.from(element.children).reduce((rects, child) => {
        return [...rects, calcInnerBounds(child)];
    }, [rect]));
};
//# sourceMappingURL=content-controller.js.map