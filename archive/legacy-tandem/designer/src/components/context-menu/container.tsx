import React, { memo } from "react";
import { useSelector } from "react-redux";
import { getContextMenuOptions } from "../../state";
import { ContextMenu } from "./view.pc";

export const ContextMenuContainer = memo(() => {
  const contextMenuOptions = useSelector(getContextMenuOptions);

  if (!contextMenuOptions) {
    return null;
  }

  const { anchor, options } = contextMenuOptions;

  return <ContextMenu anchor={anchor} options={options} />;
});
