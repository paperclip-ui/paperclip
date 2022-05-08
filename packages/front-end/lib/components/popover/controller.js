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
import * as ReactDOM from "react-dom";
import { shiftBounds, shiftPoint } from "tandem-common";
export default (Base) => {
    return class Popover extends React.PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                anchorRect: null
            };
        }
        componentWillUpdate({ open }) {
            if (!this.props.open && open) {
                const anchor = ReactDOM.findDOMNode(this);
                let rect = getRealElementBounds(anchor);
                this.setState({ anchorRect: rect });
            }
            else if (!open) {
                this.setState({ anchorRect: null });
            }
        }
        render() {
            const _a = this.props, { centered, open, onShouldClose, updateContentPosition } = _a, rest = __rest(_a, ["centered", "open", "onShouldClose", "updateContentPosition"]);
            const { anchorRect } = this.state;
            let overrideProps = {
                contentProps: {
                    onShouldClose,
                    anchorRect
                }
            };
            if (anchorRect) {
                overrideProps = {
                    contentProps: {
                        updateContentPosition,
                        onShouldClose,
                        centered,
                        anchorRect,
                        style: {
                            display: "block",
                            position: "fixed"
                        }
                    }
                };
            }
            return React.createElement(Base, Object.assign({}, rest, overrideProps));
        }
    };
};
const getRealElementBounds = (element) => {
    const parentIframes = [];
    let current = element;
    while (1) {
        const ownerDocument = current.ownerDocument;
        if (ownerDocument === document) {
            break;
        }
        const iframe = Array.prototype.find.call(ownerDocument.defaultView.parent.document.querySelectorAll("iframe"), (iframe) => {
            return iframe.contentDocument === ownerDocument;
        });
        current = iframe;
        parentIframes.push(iframe);
    }
    const offset = parentIframes.reduce((point, iframe) => shiftPoint(point, iframe.getBoundingClientRect()), { left: 0, top: 0 });
    return shiftBounds(element.getBoundingClientRect(), offset);
};
//# sourceMappingURL=controller.js.map