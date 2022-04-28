import "./index.scss";
import * as React from "react";

export type PresetOption = {
  name: string;
  value: string;
};

export type PresetComponentOuterProps = {
  values: PresetOption[];
};

export class PresetComponent extends React.PureComponent<
  PresetComponentOuterProps
> {
  render() {
    return (
      <div className="m-presets m-hidden">
        <div className="content">TODO</div>
      </div>
    );
  }
}
