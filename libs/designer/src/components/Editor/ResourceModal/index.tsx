import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/resource-modal.pc";
import { TextInput } from "../../TextInput";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { isResourceModalVisible } from "@paperclip-ui/designer/src/state";
import { designerEvents } from "@paperclip-ui/designer/src/events";

export const ResourceModal = () => {
  const { visible, onBackgroundClick } = useResourceModal();
  if (!visible) {
    return null;
  }
  return (
    <styles.Container
      onBackgroundClick={onBackgroundClick}
      header={<TextInput autoFocus placeholder="Search..." />}
      tabs={<></>}
      items={<Items />}
    />
  );
};

const useResourceModal = () => {
  const visible = useSelector(isResourceModalVisible);
  const dispatch = useDispatch();
  const onBackgroundClick = () =>
    dispatch(designerEvents.resourceModalBackgroundClicked());
  return { visible, onBackgroundClick };
};

const Items = () => (
  <>
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
    <Item />
  </>
);

const Item = () => {
  return <styles.Item label="Component" />;
};
