import * as React from "react";
import cx from "classnames";
import {
  cssPropertyChangeCompleted,
  cssPropertyChanged,
  cssPropertiesChanged,
  cssPropertiesChangeCompleted
} from "../../../../../../../actions";
import { arraySplice } from "tandem-common";
import { Dispatch } from "redux";
import { PCVariable, isTextLikePCNode, ComputedStyleInfo } from "paperclip";
import { BaseBackgroundsProps } from "./backgrounds.pc";
import {
  computeCSSBackgrounds,
  CSSBackground,
  getCSSBackgroundsStyle
} from "./inputs/background/state";
import { BackgroundItem } from "./backgrounds.pc";

const DEFAULT_COLOR = "rgba(200, 200, 200, 1)";

export type Props = {
  cwd: string;
  documentColors: string[];
  dispatch: Dispatch;
  computedStyleInfo: ComputedStyleInfo;
  globalVariables: PCVariable[];
};

export default (Base: React.ComponentClass<BaseBackgroundsProps>) =>
  class BackgroundsController extends React.PureComponent<Props> {
    onChange = (item, index) => {
      const style = this._getChangedStyle(item, index);
      this.props.dispatch(cssPropertiesChanged(style));
    };
    onChangeComplete = (item, index) => {
      const style = this._getChangedStyle(item, index);
      this.props.dispatch(cssPropertiesChangeCompleted(style));
    };

    private _getChangedStyle(item: CSSBackground, index: number) {
      const backgrounds = arraySplice(
        computeCSSBackgrounds(this.props.computedStyleInfo),
        index,
        1,
        item
      );
      const backgroundStyle = getCSSBackgroundsStyle(backgrounds);
      return backgroundStyle;
    }
    onPlusButtonClick = () => {
      const value = this.props.computedStyleInfo.style["background-image"];
      this.props.dispatch(
        cssPropertyChangeCompleted(
          "background-image",
          value
            ? value +
                "," +
                `linear-gradient(${DEFAULT_COLOR}, ${DEFAULT_COLOR})`
            : `linear-gradient(${DEFAULT_COLOR}, ${DEFAULT_COLOR})`
        )
      );
    };
    onRemove = (index: number) => {
      const backgrounds = arraySplice(
        computeCSSBackgrounds(this.props.computedStyleInfo),
        index,
        1
      );
      const backgroundStyle = getCSSBackgroundsStyle(backgrounds);
      this.props.dispatch(cssPropertiesChangeCompleted(backgroundStyle));
      return backgroundStyle;
    };
    render() {
      const {
        cwd,
        computedStyleInfo,
        documentColors,
        globalVariables
      } = this.props;
      const { onChange, onChangeComplete, onPlusButtonClick, onRemove } = this;

      const { sourceNode } = computedStyleInfo;

      // Typography pane is only available to text nodes to prevent cascading styles
      if (isTextLikePCNode(sourceNode)) {
        return null;
      }

      let backgrounds: CSSBackground[] = [];

      try {
        backgrounds = computeCSSBackgrounds(computedStyleInfo);
      } catch (e) {
        console.warn(e);
      }

      const children = backgrounds.map((background, i) => {
        return (
          <BackgroundItem
            key={i}
            cwd={cwd}
            value={background}
            onRemove={() => onRemove(i)}
            globalVariables={globalVariables}
            onChange={value => onChange(value, i)}
            onChangeComplete={value => onChangeComplete(value, i)}
            documentColors={documentColors}
          />
        );
      });
      return (
        <Base
          variant={cx({
            hasBackground: Boolean(children.length)
          })}
          contentProps={{ children }}
          plusButtonProps={{ onClick: onPlusButtonClick }}
        />
      );
    }
  };

const splitBackgrounds = value =>
  (value || "").match(/(\w+\(.*?\)|[\w-]+|#[^,]+)/g) || [];

// TODO - validation here
const replaceBackground = (oldValue, replacement, index) =>
  arraySplice(splitBackgrounds(oldValue), index, 1, replacement)
    .filter(v => Boolean(v && v.trim()))
    .join(",") || undefined;
