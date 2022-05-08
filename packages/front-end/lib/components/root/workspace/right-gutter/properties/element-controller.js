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
import cx from "classnames";
import { PCSourceTagNames, getAllPCComponents, getNativeComponentName } from "paperclip";
import { elementTypeChanged, attributeChanged } from "../../../../../actions";
import { dropdownMenuOptionFromValue } from "../../../../inputs/dropdown/controller";
import { memoize } from "tandem-common";
const TYPE_MENU_OPTIONS = [
    "a",
    "abbr",
    "acronym",
    "address",
    "b",
    "base",
    "blockquote",
    "br",
    "button",
    "canvas",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "font",
    "footer",
    "form",
    "frame",
    "frameset",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hr",
    "html",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "menu",
    "menuitem",
    "meta",
    "meter",
    "nav",
    "noframes",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "param",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "script",
    "section",
    "select",
    "small",
    "source",
    "span",
    "strike",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "svg",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "tt",
    "u",
    "ul",
    "var",
    "video",
    "wbr"
].map(dropdownMenuOptionFromValue);
const getComponentDropdownOptions = memoize((components) => {
    return components.map(component => ({
        label: component.label,
        value: component.id
    }));
});
const getTypeMenuOptions = memoize((components, targetSourceNode) => {
    return [
        ...TYPE_MENU_OPTIONS,
        ...getComponentDropdownOptions(components).filter(component => component.value !== targetSourceNode.id)
    ].sort((a, b) => String(a.label).toLowerCase() < String(b.label).toLowerCase() ? -1 : 1);
});
export default (Base) => {
    return class ElementController extends React.PureComponent {
        constructor() {
            super(...arguments);
            this.onAttributeChangeComplete = (name, value) => {
                this.props.dispatch(attributeChanged(name, value));
            };
            this.onTypeChange = (value) => {
                this.props.dispatch(elementTypeChanged(value));
            };
        }
        render() {
            const { onTypeChange, onAttributeChangeComplete } = this;
            const _a = this.props, { dispatch, sourceNode, graph } = _a, rest = __rest(_a, ["dispatch", "sourceNode", "graph"]);
            if (!sourceNode ||
                (sourceNode.name !== PCSourceTagNames.COMPONENT &&
                    sourceNode.name !== PCSourceTagNames.ELEMENT &&
                    sourceNode.name !== PCSourceTagNames.COMPONENT_INSTANCE)) {
                return null;
            }
            const components = getAllPCComponents(graph);
            const baseName = getNativeComponentName(sourceNode, graph);
            return (React.createElement(Base, Object.assign({}, rest, { variant: cx({
                    allowTitle: true
                }), labelInputProps: null, titleInputProps: {
                    value: sourceNode.attributes.title,
                    onChangeComplete: attributeChangeCallback("title", onAttributeChangeComplete)
                }, elementTypeInputProps: {
                    value: sourceNode.is,
                    filterable: true,
                    options: getTypeMenuOptions(components, sourceNode),
                    onChange: onTypeChange
                }, aPropertiesProps: {
                    dispatch,
                    baseName,
                    sourceNode
                }, imgTagPropertiesProps: {
                    dispatch,
                    graph,
                    baseName,
                    sourceNode
                }, inputTagPropertiesProps: {
                    dispatch,
                    graph,
                    baseName,
                    sourceNode
                } })));
        }
    };
};
const attributeChangeCallback = memoize((name, listener) => value => listener(name, value));
//# sourceMappingURL=element-controller.js.map