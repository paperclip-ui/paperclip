import React from "react";
import * as toolbarStyles from "@paperclip-ui/designer/src/ui/toolbar.pc";
import cx from "classnames";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getCanvas,
  getInsertMode,
  InsertMode,
} from "@paperclip-ui/designer/src/state";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";

export const Toolbar =
  (Base: React.FC<toolbarStyles.BaseToolbarProps>) => () => {
    const {
      zoom,
      insertMode,
      onInsertElementClick,
      onInsertTextClick,
      onInsertResourceClick,
    } = useToolbar();

    return (
      <Base>
        <toolbarStyles.ToolbarButton
          root={{
            onClick: onInsertTextClick,
            className: cx({ active: insertMode === InsertMode.Text }),
          }}
        >
          <toolbarStyles.ToolbarIcon class="text" />
        </toolbarStyles.ToolbarButton>
        <toolbarStyles.ToolbarButton
          root={{
            onClick: onInsertElementClick,
            className: cx({ active: insertMode === InsertMode.Element }),
          }}
        >
          <toolbarStyles.ToolbarIcon class="element" />
        </toolbarStyles.ToolbarButton>
        <toolbarStyles.ToolbarDivider />
        <toolbarStyles.ToolbarButton
          root={
            { disabled: true, className: "wide", style: { width: 75 } } as any
          }
        >
          {zoom}%
        </toolbarStyles.ToolbarButton>
      </Base>
    );
  };

const useToolbar = () => {
  const canvas = useSelector(getCanvas);
  const insertMode = useSelector(getInsertMode);
  const dispatch = useDispatch<DesignerEvent>();
  const onInsertElementClick = () =>
    dispatch({
      type: "ui/insertModeButtonClick",
      payload: { mode: InsertMode.Element },
    });
  const onInsertTextClick = () =>
    dispatch({
      type: "ui/insertModeButtonClick",
      payload: { mode: InsertMode.Text },
    });

  const onInsertResourceClick = () =>
    dispatch({
      type: "ui/insertModeButtonClick",
      payload: { mode: InsertMode.Resource },
    });
  return {
    zoom: Math.round(canvas.transform.z * 100),
    insertMode,
    onInsertElementClick,
    onInsertResourceClick,
    onInsertTextClick,
  };
};
