import React, { useState, memo } from "react";
import { Dispatch } from "redux";
import { RootState } from "../../state";
import { ComponentOption } from "./cell.pc";
import { getAllPCComponents } from "@paperclip-lang/core";
import { componentPickerItemClick } from "../../actions";
import { BasePickerProps } from "./picker.pc";
import { useDispatch } from "react-redux";

export type Props = {
  root: RootState;
  dispatch: Dispatch<any>;
};

export default (Base: React.ComponentClass<BasePickerProps>) =>
  memo((props: Props) => {
    const { root } = props;
    const [filter, setFilter] = useState<string[]>();
    const dispatch = useDispatch();

    const onFilterChange = (value) => {
      setFilter(
        String(value || "")
          .toLowerCase()
          .trim()
          .split(/\s+/g)
      );
    };

    const onClickComponent = (component) => {
      dispatch(componentPickerItemClick(component));
    };

    const componentNodes = getAllPCComponents(root.graph);

    // TODO - filter private
    const options = componentNodes
      .filter((component) => {
        const label = (component.label || "").toLowerCase();
        for (const part of filter) {
          if (label.indexOf(part) === -1) {
            return false;
          }
        }

        return true;
      })
      .map((component) => {
        return (
          <ComponentOption
            key={component.id}
            onClick={() => onClickComponent(component)}
            centerProps={{ children: component.label }}
          />
        );
      });

    return (
      <Base
        instance123Props={null}
        filterInputProps={{
          onChange: onFilterChange,
        }}
        optionsProps={{ children: options }}
      />
    );
  });
