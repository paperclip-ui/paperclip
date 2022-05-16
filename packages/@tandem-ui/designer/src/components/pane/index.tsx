import * as React from "react";
import cx from "classnames";
import * as styles from "./styles";

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
  <styles.Container
    className={cx({ headerless: !header, secondary }, className)}
  >
    {header && <div className="header">{header}</div>}
    <div className="content-outer">{children}</div>
  </styles.Container>
);
