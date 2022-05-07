import * as React from "react";
import cx from "classnames";
import { BaseConsoleLogsProps, ConsoleLog } from "./view.pc";
import { ScriptProcess } from "../../../../state";

export type Props = {
  scriptProcess: ScriptProcess;
};

export default (Base: React.ComponentClass<BaseConsoleLogsProps>) =>
  class ConsoleLogsController extends React.PureComponent<Props> {
    render() {
      const { scriptProcess, ...rest } = this.props;
      if (!scriptProcess) {
        return null;
      }

      const logs = scriptProcess.logs.map((log, i) => {
        return (
          <ConsoleLog
            key={i}
            labelProps={{ text: log.text }}
            variant={cx({
              error: log.error
            })}
          />
        );
      });
      return <Base {...rest} content={logs} />;
    }
  };
