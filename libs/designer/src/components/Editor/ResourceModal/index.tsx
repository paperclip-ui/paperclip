import React, { useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/resource-modal.pc";
import { TextInput } from "../../TextInput";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getAllComponents,
  getScreenshotUrls,
  isResourceModalVisible,
} from "@paperclip-ui/designer/src/state";
import { designerEvents } from "@paperclip-ui/designer/src/events";

export const ResourceModal = () => {
  const {
    visible,
    allComponents,
    onBackgroundClick,
    onFilterChange,
    screenshotUrls,
    filter,
  } = useResourceModal();
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
              return (
                <Item
                  label={info.component.name}
                  screenshotUrl={screenshotUrls[info.component.id]}
                />
              );
            })}
        </>
      }
    />
  );
};

const useResourceModal = () => {
  const visible = useSelector(isResourceModalVisible);
  const allComponents = useSelector(getAllComponents);
  const screenshotUrls = useSelector(getScreenshotUrls);
  const [filter, setFilter] = useState("");
  const dispatch = useDispatch();
  const onBackgroundClick = () =>
    dispatch(designerEvents.resourceModalBackgroundClicked());
  const onFilterChange = (value: string) => setFilter(value?.toLowerCase());
  return {
    visible,
    filter,
    allComponents,
    onBackgroundClick,
    onFilterChange,
    screenshotUrls,
  };
};

export type ItemProps = {
  label: string;
  screenshotUrl?: string;
};

const Item = ({ label, screenshotUrl }: ItemProps) => {
  return (
    <styles.Item
      label={label}
      previewStyle={{
        backgroundImage: `url(${screenshotUrl})`,
      }}
    />
  );
};
