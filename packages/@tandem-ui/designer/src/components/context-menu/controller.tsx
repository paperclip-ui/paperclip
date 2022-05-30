import React, { memo } from "react";
import * as styles from "./view.pc";
import { Point } from "tandem-common";
import {
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuOption,
  ContextMenuOptionType,
} from "../../state";
import { useDispatch } from "react-redux";

export type Props = {
  anchor: Point;
  options: ContextMenuOption[];
} & styles.BaseContextMenuProps;

export const ContextMenuContext = React.createContext({});

export default (Base: React.ComponentClass<styles.BaseContextMenuProps>) =>
  ({ options, anchor, ...rest }: Props) => {
    return (
      <Base {...rest} style={{ left: anchor.left, top: anchor.top }}>
        {options.map((option, i) => {
          if (option.type === ContextMenuOptionType.GROUP) {
            return <Group option={option} key={i} />;
          }
          return <Item option={option} key={i} />;
        })}
      </Base>
    );
  };

type GroupProps = {
  option: ContextMenuGroup;
};

const Group = memo(({ option }: GroupProps) => {
  return (
    <>
      {option.options.map((option) => (
        <Item option={option} key={option.label} />
      ))}
    </>
  );
});

type ItemProps = {
  option: ContextMenuItem;
};

const Item = memo(({ option }: ItemProps) => {
  const dispatch = useDispatch();

  const onClick = () => {
    console.log("ISP", option.action);
    dispatch(option.action);
  };

  return (
    <styles.ContextMenuItem
      textProps={{ text: option.label }}
      onClick={onClick}
    />
  );
});
