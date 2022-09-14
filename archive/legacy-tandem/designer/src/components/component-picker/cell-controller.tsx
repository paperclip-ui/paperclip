import React, { memo } from "react";
import { BaseComponentOptionProps } from "./cell.pc";

export type Props = BaseComponentOptionProps;

export default (Base: React.ComponentClass<BaseComponentOptionProps>) =>
  memo((props: Props) => {
    return <Base {...props} />;
  });
