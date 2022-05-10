import "./index.scss";
import * as React from "react";
import cx from "classnames";

export type PaneComponentInnerProps = {
  header?: any;
  secondary?: boolean;
  className?: string;
  children: any;
};

export const PaneComponent = ({
  header,
  children,
  className,
  secondary,
}: PaneComponentInnerProps) => (
  <div
    className={cx(
      { "m-panel": true, headerless: !header, secondary },
      className
    )}
  >
    {header && <div className="header">{header}</div>}
    <div className="content-outer">{children}</div>
  </div>
);
