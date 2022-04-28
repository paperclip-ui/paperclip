import * as React from "react";
import { BaseFramePaneProps } from "./frame.pc";
import { isEqual } from "lodash";
import {
  PCVisibleNode,
  DependencyGraph,
  isPCContentNode,
  PCVisibleNodeMetadataKey
} from "paperclip";
import {
  Bounds,
  memoize,
  resizeBounds,
  moveBounds,
  createBounds,
  getBoundsSize
} from "tandem-common";
import { Dispatch } from "redux";
import {
  frameBoundsChangeCompleted,
  frameBoundsChanged
} from "../../../../../actions";
import { DropdownMenuOption } from "../../../../inputs/dropdown/controller";

export type Props = {
  dispatch: Dispatch<any>;
  selectedNode: PCVisibleNode;
  graph: DependencyGraph;
};

const PRESETS: DropdownMenuOption[] = [
  {
    label: "Apple iPhone SE",
    value: createBounds(0, 320, 0, 568)
  },
  {
    label: "Apple iPhone 8",
    value: createBounds(0, 375, 0, 667)
  },
  {
    label: "Apple iPhone 8 Plus",
    value: createBounds(0, 414, 0, 736)
  },
  {
    label: "Google Nexus 4",
    value: createBounds(0, 384, 0, 640)
  },
  {
    label: "Google Nexus 6",
    value: createBounds(0, 411, 0, 731)
  },
  {
    label: "Apple Macbook",
    value: createBounds(0, 1152, 0, 720)
  },
  {
    label: "Apple Macbook Air",
    value: createBounds(0, 1440, 0, 900)
  },
  {
    label: "Apple Macbook Pro",
    value: createBounds(0, 2560, 0, 1600)
  },
  {
    label: "Microsoft Surface Book",
    value: createBounds(0, 1500, 0, 1000)
  }
];

export default (Base: React.ComponentClass<BaseFramePaneProps>) =>
  class FramePaneController extends React.PureComponent<Props> {
    onPresetChangeComplete = (value: Bounds) => {
      const newBounds = resizeBounds(
        this.props.selectedNode.metadata[PCVisibleNodeMetadataKey.BOUNDS],
        getBoundsSize(value)
      );
      this.props.dispatch(frameBoundsChangeCompleted(newBounds));
    };

    onChange = (prop: string, value: number, complete: boolean) => {
      value = Number(value || 0);

      let newBounds = this.props.selectedNode.metadata[
        PCVisibleNodeMetadataKey.BOUNDS
      ];
      switch (prop) {
        case "left": {
          newBounds = moveBounds(newBounds, {
            left: value,
            top: newBounds.top
          });
          break;
        }
        case "top": {
          newBounds = moveBounds(newBounds, {
            left: newBounds.left,
            top: value
          });
          break;
        }
        case "width": {
          newBounds = resizeBounds(newBounds, {
            width: value,
            height: newBounds.bottom - newBounds.top
          });
          break;
        }
        case "height": {
          newBounds = resizeBounds(newBounds, {
            width: newBounds.right - newBounds.left,
            height: value
          });
          break;
        }
      }

      this.props.dispatch(
        (complete ? frameBoundsChangeCompleted : frameBoundsChanged)(newBounds)
      );
    };

    render() {
      const { selectedNode, graph, ...rest } = this.props;
      const { onChange, onPresetChangeComplete } = this;
      if (!isPCContentNode(selectedNode, graph)) {
        return null;
      }
      const { left, top, right, bottom }: Bounds = selectedNode.metadata[
        PCVisibleNodeMetadataKey.BOUNDS
      ];
      const width = right - left || null;
      const height = bottom - top || null;
      const size = { width, height };

      const presetValueOption = PRESETS.find(preset => {
        return isEqual(getBoundsSize(preset.value), size);
      });

      return (
        <Base
          {...rest}
          presetInputProps={{
            value: presetValueOption && presetValueOption.value,
            options: PRESETS,
            onChangeComplete: onPresetChangeComplete
          }}
          xInputProps={{
            value: left,
            onChange: wrapOnChange("left", onChange),
            onChangeComplete: wrapOnChange("left", onChange, true)
          }}
          yInputProps={{
            value: top,
            onChange: wrapOnChange("top", onChange),
            onChangeComplete: wrapOnChange("top", onChange, true)
          }}
          widthInputProps={{
            value: width,
            onChange: wrapOnChange("width", onChange),
            onChangeComplete: wrapOnChange("width", onChange, true)
          }}
          heightInputProps={{
            value: height,
            onChange: wrapOnChange("height", onChange),
            onChangeComplete: wrapOnChange("height", onChange, true)
          }}
        />
      );
    }
  };

const wrapOnChange = memoize(
  (prop: string, onChange: any, complete?: boolean) => {
    return value => onChange(prop, Number(value || 0), complete);
  }
);
