import * as React from "react";
import { Dispatch } from "redux";
import * as cx from "classnames";
import { PCVariantTrigger, PCVariant, PCQuery } from "paperclip";
import { BaseTriggersPaneProps, TriggerItem } from "./triggers.pc";
import {
  addVariantTriggerButtonClicked,
  removeVariantTriggerButtonClicked
} from "../../../../../../actions";
export type Props = {
  dispatch: Dispatch<any>;
  variantTriggers: PCVariantTrigger[];
  variants: PCVariant[];
  globalQueries: PCQuery[];
};
type State = {
  selectedVariantTrigger: PCVariantTrigger;
  variantTriggers: PCVariantTrigger[];
};

export default (Base: React.ComponentClass<BaseTriggersPaneProps>) =>
  class TriggersPaneController extends React.PureComponent<Props, State> {
    state = {
      variantTriggers: this.props.variantTriggers,
      selectedVariantTrigger: null
    };

    onAddTriggerClick = () => {
      this.props.dispatch(addVariantTriggerButtonClicked());
    };

    onRemoveTriggerClick = () => {
      this.props.dispatch(
        removeVariantTriggerButtonClicked(this.state.selectedVariantTrigger)
      );
      this.setState({
        ...this.state,
        selectedVariantTrigger: null
      });
    };

    static getDerivedStateFromProps(props: Props, state: State) {
      if (props.variantTriggers !== state.variantTriggers) {
        return {
          ...state,
          variantTriggers: props.variantTriggers,
          selectedVariantTrigger: null
        };
      }
      return null;
    }

    onTriggerClick = (trigger: PCVariantTrigger) => {
      this.setState({
        ...this.state,
        selectedVariantTrigger:
          !this.state.selectedVariantTrigger ||
          this.state.selectedVariantTrigger.id !== trigger.id
            ? trigger
            : null
      });
    };

    render() {
      const { onAddTriggerClick, onRemoveTriggerClick, onTriggerClick } = this;
      const { selectedVariantTrigger } = this.state;
      const {
        variantTriggers,
        variants,
        globalQueries,
        dispatch,
        ...rest
      } = this.props;
      const items = variantTriggers.map(trigger => (
        <TriggerItem
          selected={
            selectedVariantTrigger && selectedVariantTrigger.id === trigger.id
          }
          globalQueries={globalQueries}
          onClick={() => onTriggerClick(trigger)}
          dispatch={dispatch}
          trigger={trigger}
          variants={variants}
        />
      ));
      return (
        <Base
          {...rest}
          itemProps={null}
          itemProps1={null}
          itemProps2={null}
          items={items}
          removeTriggerButtonProps={{
            onClick: onRemoveTriggerClick
          }}
          variant={cx({
            hasTriggers: Boolean(items.length),
            hasItemSelected: Boolean(selectedVariantTrigger)
          })}
          addTriggerButtonProps={{
            onClick: onAddTriggerClick
          }}
        />
      );
    }
  };
