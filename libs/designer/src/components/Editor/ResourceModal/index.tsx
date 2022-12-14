import React, { useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/resource-modal.pc";
import { TextInput } from "../../TextInput";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getAllComponents,
  isResourceModalVisible,
} from "@paperclip-ui/designer/src/state";
import { designerEvents } from "@paperclip-ui/designer/src/events";

export const ResourceModal = () => {
  const { visible, allComponents, onBackgroundClick, onFilterChange, filter } =
    useResourceModal();
  if (!visible) {
    return null;
  }
  return (
    <styles.Container
      onBackgroundClick={onBackgroundClick}
      header={
        <TextInput
          autoFocus
          placeholder="Search..."
          onChange={onFilterChange}
        />
      }
      tabs={<></>}
      items={
        <>
          {allComponents
            .filter((info) => {
              if (!filter) {
                return true;
              }
              return (
                info.sourcePath.toLowerCase().includes(filter) ||
                info.component.name.toLowerCase().includes(filter)
              );
            })
            .map((info) => {
              return <Item label={info.component.name} />;
            })}
        </>
      }
    />
  );
};

const useResourceModal = () => {
  const visible = useSelector(isResourceModalVisible);
  const allComponents = useSelector(getAllComponents);
  const [filter, setFilter] = useState("");
  const dispatch = useDispatch();
  const onBackgroundClick = () =>
    dispatch(designerEvents.resourceModalBackgroundClicked());
  const onFilterChange = (value: string) => setFilter(value?.toLowerCase());
  return { visible, filter, allComponents, onBackgroundClick, onFilterChange };
};

export type ItemProps = {
  label: string;
};

const Item = ({ label }: ItemProps) => {
  return <styles.Item label={label} />;
};
