import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as commonStyles from "@paperclip-ui/designer/src/styles/common.pc";
import { useSelector } from "@paperclip-ui/common";
import { getHistoryState } from "@paperclip-ui/designer/src/machine/engine/history/state";
import { getCurrentDependency } from "@paperclip-ui/designer/src/machine/state";
import { DocumentBodyItem } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { getDocumentBodyInner } from "@paperclip-ui/proto/lib/ast/pc-utils";

export const LeftSidebar = () => {
  const { title, document } = useLeftSidebar();

  if (!document) {
    return null;
  }

  return (
    <styles.LeftSidebar>
      <styles.LeftSidebarHeader title={title} />
      <commonStyles.SidebarSection>
        <commonStyles.SidebarPanelHeader>
          Layers
        </commonStyles.SidebarPanelHeader>
      </commonStyles.SidebarSection>
      <styles.Layers>
        {document.body.map((item) => (
          <DocumentBodyItemLeaf
            key={getDocumentBodyInner(item).id}
            item={item}
          />
        ))}
      </styles.Layers>
    </styles.LeftSidebar>
  );
};

type DocumentBodyItemProps = {
  item: DocumentBodyItem;
};

const DocumentBodyItemLeaf = ({ item }: DocumentBodyItemProps) => {
  if (item.component) {
    return (
      <styles.LayerNavigationItemHeader
        class="component container"
        style={{ "--depth": 1 }}
      >
        {item.component.name}
      </styles.LayerNavigationItemHeader>
    );
  }

  return null;
};

const useLeftSidebar = () => {
  const history = useSelector(getHistoryState);
  const dependency = useSelector(getCurrentDependency);

  return {
    title: history.query.file.split("/").pop(),
    document: dependency?.document,
  };
};
