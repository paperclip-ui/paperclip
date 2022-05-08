import * as React from "react";
import { memoize } from "tandem-common";
import { dropdownMenuOptionFromValue, NO_OPTION } from "../../../../../../inputs/dropdown/controller";
import { cssPropertyChangeCompleted, cssPropertyChanged } from "../../../../../../../actions";
import { filterVariablesByType, PCVariableType, isTextLikePCNode, isElementLikePCNode, getNativeComponentName } from "paperclip";
import { mapVariablesToCSSVarDropdownOptions, getPrettyPaneColorSwatchOptionGroups } from "./utils";
const { TextLeftIcon, TextCenterIcon, TextJustifyIcon, TextRightIcon } = require("../../../../../../../icons/view.pc");
export const getFontFamilyOptions = memoize((fontFamiles) => fontFamiles
    .map(family => ({ label: family.name, value: family.name }))
    .sort((a, b) => (a.label > b.label ? 1 : -1)));
const FONT_WEIGHTS = [
    undefined,
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800"
].map(dropdownMenuOptionFromValue);
const DECORATIONS = [
    undefined,
    "underline",
    "overline",
    "line-through",
    "none"
].map(dropdownMenuOptionFromValue);
const ALIGNMENTS = [
    {
        value: "left",
        icon: React.createElement(TextLeftIcon, null)
    },
    {
        value: "center",
        icon: React.createElement(TextCenterIcon, null)
    },
    {
        value: "justify",
        icon: React.createElement(TextJustifyIcon, null)
    },
    {
        value: "right",
        icon: React.createElement(TextRightIcon, null)
    }
];
export default (Base) => class TypographyController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onPropertyChange = (name, value) => {
            this.props.dispatch(cssPropertyChanged(name, value));
        };
        this.onPropertyChangeComplete = (name, value) => {
            this.props.dispatch(cssPropertyChangeCompleted(name, value));
        };
    }
    render() {
        const { onPropertyChange, onPropertyChangeComplete } = this;
        const { graph, fontFamilies, globalVariables, documentColors, dispatch, computedStyleInfo, projectOptions } = this.props;
        const { sourceNode } = computedStyleInfo;
        // Typography pane is only available to text nodes to prevent cascading styles, and void tags (like input) that
        // cannot have children
        if (projectOptions.allowCascadeFonts === false &&
            (!isTextLikePCNode(sourceNode) ||
                (isElementLikePCNode(sourceNode) &&
                    getNativeComponentName(sourceNode, graph) !== "input"))) {
            return null;
        }
        const fontVariables = filterVariablesByType(globalVariables, PCVariableType.FONT);
        return (React.createElement(Base, { fontFamilyInputContainerProps: {
                dispatch,
                inheritedFromNode: computedStyleInfo.styleInheritanceMap["font-family"]
            }, weightInputContainerProps: {
                dispatch,
                inheritedFromNode: computedStyleInfo.styleInheritanceMap["font-weight"]
            }, decorationInputContainerProps: {
                dispatch,
                inheritedFromNode: computedStyleInfo.styleInheritanceMap["text-decoration"]
            }, lineInputContainerProps: {
                dispatch,
                inheritedFromNode: computedStyleInfo.styleInheritanceMap["line-height"]
            }, spacingInputContainerProps: {
                dispatch,
                inheritedFromNode: computedStyleInfo.styleInheritanceMap["letter-spacing"]
            }, sizeInputContainerProps: {
                dispatch,
                inheritedFromNode: computedStyleInfo.styleInheritanceMap["font-size"]
            }, alignmentInputContainerProps: {
                dispatch,
                inheritedFromNode: computedStyleInfo.styleInheritanceMap["text-align"]
            }, colorInputContainerProps: {
                dispatch,
                inheritedFromNode: computedStyleInfo.styleInheritanceMap["color"]
            }, familyInputProps: {
                filterable: true,
                options: [
                    NO_OPTION,
                    ...mapVariablesToCSSVarDropdownOptions(fontVariables),
                    ...getFontFamilyOptions(fontFamilies)
                ],
                value: computedStyleInfo.style["font-family"],
                onChange: propertyChangeCallback("font-family", onPropertyChange),
                onChangeComplete: propertyChangeCallback("font-family", onPropertyChangeComplete)
            }, weightInputProps: {
                options: FONT_WEIGHTS,
                value: computedStyleInfo.style["font-weight"],
                onChange: propertyChangeCallback("font-weight", onPropertyChange),
                onChangeComplete: propertyChangeCallback("font-weight", onPropertyChangeComplete)
            }, decorationInputProps: {
                options: DECORATIONS,
                value: computedStyleInfo.style["text-decoration"],
                onChange: propertyChangeCallback("text-decoration", onPropertyChange),
                onChangeComplete: propertyChangeCallback("text-decoration", onPropertyChangeComplete)
            }, lineInputProps: {
                value: computedStyleInfo.style["line-height"],
                onChange: propertyChangeCallback("line-height", onPropertyChange),
                onChangeComplete: propertyChangeCallback("line-height", onPropertyChangeComplete)
            }, spacingInputProps: {
                value: computedStyleInfo.style["letter-spacing"],
                onChange: propertyChangeCallback("letter-spacing", onPropertyChange),
                onChangeComplete: propertyChangeCallback("letter-spacing", onPropertyChangeComplete)
            }, alignmentInputProps: {
                options: ALIGNMENTS,
                value: computedStyleInfo.style["text-align"],
                onChangeComplete: propertyChangeCallback("text-align", onPropertyChangeComplete)
            }, sizeInputProps: {
                value: computedStyleInfo.style["font-size"],
                onChange: propertyChangeCallback("font-size", onPropertyChange),
                onChangeComplete: propertyChangeCallback("font-size", onPropertyChangeComplete)
            }, colorInputProps: {
                swatchOptionGroups: getPrettyPaneColorSwatchOptionGroups(documentColors, globalVariables),
                value: computedStyleInfo.style.color,
                onChange: propertyChangeCallback("color", onPropertyChange),
                onChangeComplete: propertyChangeCallback("color", onPropertyChangeComplete)
            } }));
    }
};
const propertyChangeCallback = memoize((name, listener) => value => listener(name, value));
//# sourceMappingURL=typography-controller.js.map