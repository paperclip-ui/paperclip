import { useSelector } from "@paperclip-ui/common";
import { useHistory } from "@paperclip-ui/designer/src/domains/history/react";
import {
  getGraph,
  getSelectedExpressionInfo,
} from "@paperclip-ui/designer/src/state";
import { routes } from "@paperclip-ui/designer/src/state/routes";
import { Fields } from "@paperclip-ui/designer/src/styles/input.pc";
import { UsedBy } from "@paperclip-ui/designer/src/styles/right-sidebar.pc";
import {
  SidebarSection,
  SidebarPanelHeader,
  SidebarPanelContent,
} from "@paperclip-ui/designer/src/components/Sidebar/sidebar.pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import React from "react";

export const UsedBySection = () => {
  const expr = useSelector(getSelectedExpressionInfo);
  const graph = useSelector(getGraph);
  const history = useHistory();

  if (!expr || expr.kind !== ast.ExprKind.Component) {
    return null;
  }

  const instances = ast.getAllInstancesOfComponent(expr.expr, graph);

  return (
    <SidebarSection>
      <SidebarPanelHeader>Instances</SidebarPanelHeader>
      <SidebarPanelContent>
        <Fields>
          {instances.map((instance) => {
            const instancePath = ast.getOwnerDependencyPath(instance.id, graph);
            return (
              <UsedBy
                key={instance.id}
                onClick={() => {
                  history.redirect(
                    routes.editor({
                      filePath: instancePath,
                      nodeId: instance.id,
                    })
                  );
                }}
              >
                {instancePath.split("/").pop()}
              </UsedBy>
            );
          })}
        </Fields>
      </SidebarPanelContent>
    </SidebarSection>
  );
};
