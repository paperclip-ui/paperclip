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
export default (Base) => class PrettyStylesController extends React.PureComponent {
    render() {
        const _a = this.props, { cwd, dispatch, selectedVariant, computedStyleInfo, globalVariables, fontFamilies, documentColors, projectOptions, graph, selectedInspectorNodes, rootInspectorNode } = _a, rest = __rest(_a, ["cwd", "dispatch", "selectedVariant", "computedStyleInfo", "globalVariables", "fontFamilies", "documentColors", "projectOptions", "graph", "selectedInspectorNodes", "rootInspectorNode"]);
        return (React.createElement(Base, Object.assign({}, rest, { instancePaneProps: {
                computedStyleInfo,
                selectedInspectorNodes,
                rootInspectorNode,
                dispatch,
                graph,
                selectedVariant
            }, inheritPaneProps: {
                projectOptions,
                dispatch,
                selectedInspectorNodes,
                graph
            }, codePaneProps: {
                dispatch,
                computedStyleInfo
            }, layoutPaneProps: {
                dispatch,
                selectedVariant,
                rootInspectorNode,
                selectedInspectorNodes,
                computedStyleInfo,
                graph
            }, typographyPaneProps: {
                projectOptions,
                graph,
                dispatch,
                documentColors,
                computedStyleInfo,
                fontFamilies,
                globalVariables
            }, opacityPaneProps: {
                dispatch,
                computedStyleInfo
            }, backgroundsPaneProps: {
                cwd,
                globalVariables,
                documentColors,
                dispatch,
                computedStyleInfo
            }, spacingPaneProps: {
                dispatch,
                computedStyleInfo
            }, bordersPaneProps: {
                globalVariables,
                documentColors,
                dispatch,
                computedStyleInfo
            }, outerShadowsPaneProps: {
                globalVariables,
                documentColors,
                dispatch,
                computedStyleInfo
            }, innerShadowsPaneProps: {
                globalVariables,
                documentColors,
                dispatch,
                computedStyleInfo
            } })));
    }
};
//# sourceMappingURL=index.js.map