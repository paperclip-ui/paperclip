import * as React from "react";
import cx from "classnames";
import {
  PCSourceTagNames,
  SyntheticVisibleNode,
  SyntheticElement,
  DependencyGraph,
  getAllPCComponents,
  PCComponent,
  PCNode,
  PCComponentInstanceElement,
  PCElement,
  getNativeComponentName,
  PCTextNode,
} from "@paperclip-lang/core";
import { elementTypeChanged, attributeChanged } from "../../../../../actions";
import {
  DropdownMenuOption,
  dropdownMenuOptionFromValue,
} from "../../../../inputs/dropdown/controller";
import { BaseElementPropertiesProps, ElementProps } from "./view.pc";
import { Dispatch } from "redux";
import { memoize } from "tandem-common";

const TYPE_MENU_OPTIONS: DropdownMenuOption[] = [
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
  "wbr",
].map(dropdownMenuOptionFromValue);

const getComponentDropdownOptions = memoize(
  (components: PCComponent[]): DropdownMenuOption[] => {
    return components.map((component) => ({
      label: component.label,
      value: component.id,
    }));
  }
);

const getTypeMenuOptions = memoize(
  (components: PCComponent[], targetSourceNode: PCNode) => {
    return [
      ...TYPE_MENU_OPTIONS,
      ...getComponentDropdownOptions(components).filter(
        (component) => component.value !== targetSourceNode.id
      ),
    ].sort((a, b) =>
      String(a.label).toLowerCase() < String(b.label).toLowerCase() ? -1 : 1
    );
  }
);

export type Props = {
  sourceNode: PCElement | PCComponent | PCComponentInstanceElement | PCTextNode;
  dispatch: Dispatch<any>;
  graph: DependencyGraph;
} & ElementProps;

export default (Base: React.ComponentClass<BaseElementPropertiesProps>) => {
  return class ElementController extends React.PureComponent<Props> {
    onAttributeChangeComplete = (name: string, value: string) => {
      this.props.dispatch(attributeChanged(name, value));
    };
    onTypeChange = (value: any) => {
      this.props.dispatch(elementTypeChanged(value));
    };
    render() {
      const { onTypeChange, onAttributeChangeComplete } = this;
      const { dispatch, sourceNode, graph, ...rest } = this.props;

      if (
        !sourceNode ||
        (sourceNode.name !== PCSourceTagNames.COMPONENT &&
          sourceNode.name !== PCSourceTagNames.ELEMENT &&
          sourceNode.name !== PCSourceTagNames.COMPONENT_INSTANCE)
      ) {
        return null;
      }
      const components = getAllPCComponents(graph);
      const baseName = getNativeComponentName(sourceNode, graph);

      return (
        <Base
          {...rest}
          variant={cx({
            allowTitle: true,
          })}
          labelInputProps={null}
          titleInputProps={{
            value: sourceNode.attributes.title,
            onChangeComplete: attributeChangeCallback(
              "title",
              onAttributeChangeComplete
            ),
          }}
          elementTypeInputProps={{
            value: sourceNode.is,
            filterable: true,
            options: getTypeMenuOptions(components, sourceNode),
            onChange: onTypeChange,
          }}
          aPropertiesProps={{
            dispatch,
            baseName,
            sourceNode,
          }}
          imgTagPropertiesProps={{
            dispatch,
            graph,
            baseName,
            sourceNode,
          }}
          inputTagPropertiesProps={{
            dispatch,
            graph,
            baseName,
            sourceNode,
          }}
        />
      );
    }
  };
};

const attributeChangeCallback = memoize(
  (name: string, listener) => (value) => listener(name, value)
);
