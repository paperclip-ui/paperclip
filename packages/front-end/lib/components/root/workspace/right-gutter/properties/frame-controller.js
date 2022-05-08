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
import { isEqual } from "lodash";
import { isPCContentNode, PCVisibleNodeMetadataKey } from "paperclip";
import { memoize, resizeBounds, moveBounds, createBounds, getBoundsSize } from "tandem-common";
import { frameBoundsChangeCompleted, frameBoundsChanged } from "../../../../../actions";
const PRESETS = [
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
export default (Base) => class FramePaneController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onPresetChangeComplete = (value) => {
            const newBounds = resizeBounds(this.props.selectedNode.metadata[PCVisibleNodeMetadataKey.BOUNDS], getBoundsSize(value));
            this.props.dispatch(frameBoundsChangeCompleted(newBounds));
        };
        this.onChange = (prop, value, complete) => {
            value = Number(value || 0);
            let newBounds = this.props.selectedNode.metadata[PCVisibleNodeMetadataKey.BOUNDS];
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
            this.props.dispatch((complete ? frameBoundsChangeCompleted : frameBoundsChanged)(newBounds));
        };
    }
    render() {
        const _a = this.props, { selectedNode, graph } = _a, rest = __rest(_a, ["selectedNode", "graph"]);
        const { onChange, onPresetChangeComplete } = this;
        if (!isPCContentNode(selectedNode, graph)) {
            return null;
        }
        const { left, top, right, bottom } = selectedNode.metadata[PCVisibleNodeMetadataKey.BOUNDS];
        const width = right - left || null;
        const height = bottom - top || null;
        const size = { width, height };
        const presetValueOption = PRESETS.find(preset => {
            return isEqual(getBoundsSize(preset.value), size);
        });
        return (React.createElement(Base, Object.assign({}, rest, { presetInputProps: {
                value: presetValueOption && presetValueOption.value,
                options: PRESETS,
                onChangeComplete: onPresetChangeComplete
            }, xInputProps: {
                value: left,
                onChange: wrapOnChange("left", onChange),
                onChangeComplete: wrapOnChange("left", onChange, true)
            }, yInputProps: {
                value: top,
                onChange: wrapOnChange("top", onChange),
                onChangeComplete: wrapOnChange("top", onChange, true)
            }, widthInputProps: {
                value: width,
                onChange: wrapOnChange("width", onChange),
                onChangeComplete: wrapOnChange("width", onChange, true)
            }, heightInputProps: {
                value: height,
                onChange: wrapOnChange("height", onChange),
                onChangeComplete: wrapOnChange("height", onChange, true)
            } })));
    }
};
const wrapOnChange = memoize((prop, onChange, complete) => {
    return value => onChange(prop, Number(value || 0), complete);
});
//# sourceMappingURL=frame-controller.js.map