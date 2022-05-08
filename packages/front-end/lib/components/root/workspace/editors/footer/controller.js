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
export default (Base) => class FooterController extends React.PureComponent {
    render() {
        const _a = this.props, { canvas, graph, rootInspectorNode, selectedInspectorNode, dispatch } = _a, rest = __rest(_a, ["canvas", "graph", "rootInspectorNode", "selectedInspectorNode", "dispatch"]);
        return (React.createElement(Base, Object.assign({}, rest, { zoomPercentageProps: {
                text: canvas && `${String(Math.round(canvas.translate.zoom * 100))}%`
            }, breadcrumbsProps: {
                dispatch,
                graph,
                rootInspectorNode,
                selectedInspectorNode
            } })));
    }
};
//# sourceMappingURL=controller.js.map