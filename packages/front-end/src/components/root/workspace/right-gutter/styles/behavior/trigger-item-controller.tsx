import * as React from "react";
import { BaseTriggerItemProps } from "./triggers.pc";
import {
  PCVariantTrigger,
  PCVariant,
  PCElementState,
  PCVariantTriggerSourceType,
  PCVariantTriggerStateSource,
  PCVariantTriggerSource,
  PCQuery,
  PCVariantTriggerQuerySource
} from "paperclip";
import { isEqual } from "lodash";
import cx from "classnames";
import { memoize } from "tandem-common";
import { Dispatch } from "redux";
import { DropdownMenuOption } from "../../../../../inputs/dropdown/controller";
import {
  variantTriggerSourceChanged,
  variantTriggerTargetChanged
} from "../../../../../../actions";
export type Props = {
  selected: boolean;
  trigger: PCVariantTrigger;
  variants: PCVariant[];
  globalQueries: PCQuery[];
  dispatch: Dispatch<any>;
  onClick: any;
};

const NO_OPTION: DropdownMenuOption = {
  label: "--",
  value: undefined
};

const BASE_SOURCE_OPTIONS: DropdownMenuOption[] = [
  PCElementState.HOVER,
  PCElementState.ACTIVE,
  PCElementState.FOCUS,
  PCElementState.VISITED,
  PCElementState.DISABLED
].map(
  (state: PCElementState): DropdownMenuOption => ({
    label: String(state),
    value: {
      type: PCVariantTriggerSourceType.STATE,
      state: state
    } as PCVariantTriggerStateSource
  })
);

export default (Base: React.ComponentClass<BaseTriggerItemProps>) =>
  class TriggerItemController extends React.PureComponent<Props> {
    onSourceChange = (value: PCVariantTriggerSource) => {
      this.props.dispatch(
        variantTriggerSourceChanged(this.props.trigger, value)
      );
    };
    onTargetChange = (value: PCVariant) => {
      this.props.dispatch(
        variantTriggerTargetChanged(this.props.trigger, value)
      );
    };
    render() {
      const { onSourceChange, onTargetChange } = this;
      const {
        onClick,
        selected,
        variants,
        trigger,
        globalQueries,
        ...rest
      } = this.props;
      const options = getSourceOptions(globalQueries);
      const valueOption = options.find(option =>
        isEqual(option.value, trigger.source)
      );

      return (
        <Base
          {...rest}
          backgroundProps={{ onClick }}
          variant={cx({ selected })}
          sourceInputProps={{
            value: valueOption && valueOption.value,
            options,
            onChangeComplete: onSourceChange
          }}
          targetInputProps={{
            value: variants.find(
              variant => variant.id === trigger.targetVariantId
            ),
            options: getTargetOptions(variants),
            onChangeComplete: onTargetChange
          }}
        />
      );
    }
  };

export const getSourceOptions = memoize(
  (queries: PCQuery[]): DropdownMenuOption[] => {
    return [
      NO_OPTION,
      ...BASE_SOURCE_OPTIONS,
      ...queries.map(mediaQuery => ({
        label: mediaQuery.label,
        value: {
          type: PCVariantTriggerSourceType.QUERY,
          queryId: mediaQuery.id
        } as PCVariantTriggerQuerySource
      }))
    ];
  }
);

export const getTargetOptions = memoize(
  (variants: PCVariant[]): DropdownMenuOption[] => {
    return [
      NO_OPTION,
      ...variants.map(variant => ({
        label: variant.label,
        value: variant
      }))
    ];
  }
);
