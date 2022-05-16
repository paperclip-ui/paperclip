import * as React from "react";
import cx from "classnames";
import { BaseConsoleProps, ConsoleTab } from "./view.pc";
import { ScriptProcess } from "../../../../state";
import { Dispatch } from "redux";

export type Props = {
  scriptProcesses: ScriptProcess[];
  dispatch: Dispatch<any>;
};

type State = {
  selectedTabIndex: number;
};

export default (Base: React.ComponentClass<BaseConsoleProps>) =>
  class ConsoleController extends React.PureComponent<Props, State> {
    state = {
      selectedTabIndex: 0,
    };

    selectTabIndex = (index: number) => {
      this.setState({ ...this.state, selectedTabIndex: index });
    };

    render() {
      const { selectTabIndex } = this;
      const { scriptProcesses, ...rest } = this.props;
      const { selectedTabIndex } = this.state;

      const tabs = scriptProcesses.map((process, i) => {
        return (
          <ConsoleTab
            variant={cx({
              selected: selectedTabIndex === i,
            })}
            onClick={() => selectTabIndex(i)}
            labelProps={{ text: process.label }}
          />
        );
      });

      const scriptProcess = scriptProcesses[selectedTabIndex];

      return (
        <Base
          {...rest}
          variant={cx({ noProcesses: scriptProcesses.length === 0 })}
          consoleLogsProps={{ scriptProcess }}
          tabs={tabs}
        />
      );
    }
  };
