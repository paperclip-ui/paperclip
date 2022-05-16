import "./index.scss";
import * as React from "react";

export type GutterComponentInnerProps = {
  children: any;
};

const BaseGutterComponent = ({ children }: GutterComponentInnerProps) => (
  <div className="m-gutter">{children}</div>
);

export const GutterComponent = BaseGutterComponent;
