import * as React from "react";
import {
  PCVariant,
  DependencyGraph,
  PCComponentInstanceElement,
  PCComponent,
  isVariantTriggered,
  getVariantTriggers,
  getPCNode,
} from "@paperclip-lang/core";
import { Dispatch } from "redux";
import cx from "classnames";
import {
  variantDefaultSwitchClicked,
  variantLabelChanged,
} from "../../../../../../actions";
import { FocusComponent } from "../../../../../focus";
import { BaseVariantOptionProps } from "./option.pc";
const { TextInput } = require("../../../../../inputs/text/view.pc");

export type Props = {
  instance: PCComponentInstanceElement | PCComponent;
  component: PCComponent;
  item: PCVariant;
  graph: DependencyGraph;
  alt?: boolean;
  enabled?: boolean;
  dispatch: Dispatch<any>;
  onToggle?: any;
  onClick?: any;
  editable?: boolean;
  onReset?: any;
} & BaseVariantOptionProps;

type State = {
  editingLabel: boolean;
};

export default (Base: React.ComponentClass<BaseVariantOptionProps>) =>
  class OptionsController extends React.PureComponent<Props, State> {
    state = {
      editingLabel: false,
    };
    setEditingLabel = (value: boolean) => {
      this.setState({ ...this.state, editingLabel: value });
    };
    onSwitchChange = () => {
      const { onToggle, dispatch, item } = this.props;
      if (onToggle) {
        onToggle(item, event);
      } else {
        dispatch(variantDefaultSwitchClicked(item));
      }
    };
    onInputClick = (event) => {
      const { editingLabel } = this.state;
      if (editingLabel !== false) {
        this.setEditingLabel(true);
        event.stopPropagation();
      }
    };
    onLabelChange = (value: string) => {
      const { item, dispatch } = this.props;
      this.setEditingLabel(false);
      dispatch(variantLabelChanged(item, value));
    };
    render() {
      const { onSwitchChange, onInputClick, onLabelChange } = this;
      const { editingLabel } = this.state;
      const {
        item,
        graph,
        onReset,
        component,
        instance,
        alt,
        enabled,
        ...rest
      } = this.props;
      if (!item) {
        return null;
      }
      const triggered = isVariantTriggered(instance, item, graph);
      const hasTrigger =
        Boolean(getVariantTriggers(item, component).length) && !triggered;
      return (
        <Base
          {...rest}
          variant={cx({ alt, triggered, hasTrigger })}
          switchProps={{
            value: enabled,
            onChangeComplete: onSwitchChange,
          }}
          resetButtonProps={{
            onClick: onReset && (() => onReset(item)),
            style: {
              display: onReset ? "block" : "none",
            },
          }}
          input={
            editingLabel ? (
              <FocusComponent>
                {
                  <TextInput
                    value={item.label}
                    onChangeComplete={onLabelChange}
                  />
                }
              </FocusComponent>
            ) : (
              item.label || "Click to edit"
            )
          }
          inputProps={{
            onClick: onInputClick,
          }}
        />
      );
    }
  };
