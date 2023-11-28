import React from "react";
import { BaseBoxProps } from "./layout.pc";

type BoxProps = {
    onClick?: any;
    onMouseDown?: any;
    className?: string;
    children: any;
}

export const Box = (Base: React.FC<BaseBoxProps>) => ({children, ...rest}: BoxProps) => {
  return <Base rootProps={rest}>
    {children}
  </Base>
};