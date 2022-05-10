import * as React from "react";
import TextPropertiesController0, {
  Props as TextPropertiesController0Props,
} from "./text-controller";
import ElementPropertiesController0, {
  Props as ElementPropertiesController0Props,
} from "./element-controller";
import PropertiesController0, {
  Props as PropertiesController0Props,
} from "./properties-controller";
import ControllersPaneController0, {
  Props as ControllersPaneController0Props,
} from "./component-controller";
import ExportsPaneController0, {
  Props as ExportsPaneController0Props,
} from "./exports-controller";
import ExportNameInputController0, {
  Props as ExportNameInputController0Props,
} from "./exports-name-input-controller";
import ImgPropertiesController0, {
  Props as ImgPropertiesController0Props,
} from "./img-controller";
import APropertiesController0, {
  Props as APropertiesController0Props,
} from "./a-controller";
import { _b6c162d113Props } from "../../../../pane/view.pc";
import { _d65d17fd4015Props } from "../../../../inputs/textarea/view.pc";
import { _7149f8199122Props } from "../../../../inputs/text/view.pc";
import { _7149f8192509Props } from "../../../../inputs/molecules.pc";
import { _50e32bec2591Props } from "../../../../inputs/dropdown/view.pc";
import { _6e2729d443544Props } from "./input.pc";
import { _ca37a81113095Props } from "./frame.pc";
import {
  _d30286e83385Props,
  _f27782548182Props,
} from "../../../../../icons/view.pc";
import { _9f364d2139415Props } from "../../../../inputs/button/view.pc";
import { _c389e3829Props } from "../../../../inputs/table/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseTextPropertiesProps = {
  paneProps?: _b6c162d113Props;
  textInputProps: _d65d17fd4015Props;
} & ElementProps;

export type _83d6aa88499432Props = TextPropertiesController0Props;
export const TextProperties: (
  props: TextPropertiesController0Props
) => React.ReactElement<TextPropertiesController0Props>;

export type BaseElementPropertiesProps = {
  variant?: string;
  paneProps?: _b6c162d113Props;
  labelInputProps: _7149f8199122Props;
  fieldsProps?: ElementProps;
  typeSectionProps?: _7149f8192509Props;
  elementTypeInputProps: _50e32bec2591Props;
  imgTagPropertiesProps: _891523ff46326Props;
  labeledInputProps?: _7149f8192509Props;
  titleInputProps: _7149f8199122Props;
  aPropertiesProps: _45cb3afa42261Props;
  inputTagPropertiesProps: _6e2729d443544Props;
  allowTitleProps?: ElementProps;
} & ElementProps;

export type _9208d19533717Props = ElementPropertiesController0Props;
export const ElementProperties: (
  props: ElementPropertiesController0Props
) => React.ReactElement<ElementPropertiesController0Props>;

export type BasePropertiesProps = {
  variant?: string;
  elementProps: _9208d19533717Props;
  framePaneProps: _ca37a81113095Props;
  textProps: _83d6aa88499432Props;
  elementProps1?: ElementProps;
  componentProps?: ElementProps;
  textProps1?: ElementProps;
  slotProps?: ElementProps;
  controllersPaneProps: _60ea77f714Props;
  contentNodeProps?: ElementProps;
} & ElementProps;

export type _9208d19593983Props = PropertiesController0Props;
export const Properties: (
  props: PropertiesController0Props
) => React.ReactElement<PropertiesController0Props>;

export type BaseComponentPropertiesProps = {} & ElementProps;

export type _6a863e8631Props = BaseComponentPropertiesProps;

export const ComponentProperties: (
  props: BaseComponentPropertiesProps
) => React.ReactElement<BaseComponentPropertiesProps>;

export type BaseBehaviorPaneProps = {} & ElementProps;

export type _308dd31356Props = BaseBehaviorPaneProps;

export const BehaviorPane: (
  props: BaseBehaviorPaneProps
) => React.ReactElement<BaseBehaviorPaneProps>;

export type BaseControllersPaneProps = {
  variant?: string;
  content?: any;
  elementProps?: ElementProps;
  textProps?: TextProps;
  elementProps1?: ElementProps;
  removeControllerButtonProps?: _d30286e83385Props;
  addControllerButtonProps?: _f27782548182Props;
  hasControllerSelectedProps?: ElementProps;
  hasControllerProps?: ElementProps;
} & ElementProps;

export type _60ea77f714Props = ControllersPaneController0Props;
export const ControllersPane: (
  props: ControllersPaneController0Props
) => React.ReactElement<ControllersPaneController0Props>;

export type BaseExportsPaneProps = {
  exportsNameInputProps: _3acea128129776Props;
} & _b6c162d113Props;

export type _b5b3b569317416Props = ExportsPaneController0Props;
export const ExportsPane: (
  props: ExportsPaneController0Props
) => React.ReactElement<ExportsPaneController0Props>;

export type BaseExportNameInputProps = {
  variant?: string;
  inputProps: _7149f8199122Props;
  elementProps?: ElementProps;
  errorProps?: TextProps;
  elementProps1?: ElementProps;
  invalidProps?: ElementProps;
} & ElementProps;

export type _3acea128129776Props = ExportNameInputController0Props;
export const ExportNameInput: (
  props: ExportNameInputController0Props
) => React.ReactElement<ExportNameInputController0Props>;

export type BaseImgPropertiesProps = {
  labeledInputProps?: _7149f8192509Props;
  elementProps?: ElementProps;
  pathInputProps: _7149f8199122Props;
  uploadButtonProps?: _9f364d2139415Props;
} & ElementProps;

export type _891523ff46326Props = ImgPropertiesController0Props;
export const ImgProperties: (
  props: ImgPropertiesController0Props
) => React.ReactElement<ImgPropertiesController0Props>;

export type BaseAPropertiesProps = {
  labeledInputProps?: _7149f8192509Props;
  hrefInputProps: _7149f8199122Props;
} & ElementProps;

export type _45cb3afa42261Props = APropertiesController0Props;
export const AProperties: (
  props: APropertiesController0Props
) => React.ReactElement<APropertiesController0Props>;

export type BaseAttributeFieldProps = {
  input?: any;
  labeledInputProps?: _7149f8192509Props;
  textInputProps?: _80c8fafc2300Props;
  textProps?: TextProps;
} & ElementProps;

export type _80c8fafc2140Props = BaseAttributeFieldProps;

export const AttributeField: (
  props: BaseAttributeFieldProps
) => React.ReactElement<BaseAttributeFieldProps>;

export type BaseBrowseAttributeInputProps = {
  elementProps?: ElementProps;
  pathInputProps: _7149f8199122Props;
  uploadButtonProps?: _9f364d2139415Props;
} & ElementProps;

export type _80c8fafc2270Props = BaseBrowseAttributeInputProps;

export const BrowseAttributeInput: (
  props: BaseBrowseAttributeInputProps
) => React.ReactElement<BaseBrowseAttributeInputProps>;

export type BaseTextAttributeInputProps = {
  textInputProps: _7149f8199122Props;
} & ElementProps;

export type _80c8fafc2300Props = BaseTextAttributeInputProps;

export const TextAttributeInput: (
  props: BaseTextAttributeInputProps
) => React.ReactElement<BaseTextAttributeInputProps>;

export type BaseTextAreaAttributeInputProps = {
  textareaProps: _d65d17fd4015Props;
} & ElementProps;

export type _80c8fafc2309Props = BaseTextAreaAttributeInputProps;

export const TextAreaAttributeInput: (
  props: BaseTextAreaAttributeInputProps
) => React.ReactElement<BaseTextAreaAttributeInputProps>;

export type BaseDropdownAttributeInputProps = {
  dropdownProps: _50e32bec2591Props;
} & ElementProps;

export type _80c8fafc2316Props = BaseDropdownAttributeInputProps;

export const DropdownAttributeInput: (
  props: BaseDropdownAttributeInputProps
) => React.ReactElement<BaseDropdownAttributeInputProps>;
