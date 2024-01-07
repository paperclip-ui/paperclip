import { useSelector } from "@paperclip-ui/common";
import { useHistory } from "@paperclip-ui/designer/src/domains/history/react";
import {
  getEditorState,
  getGraph,
  getSelectedExpressionInfo,
} from "@paperclip-ui/designer/src/state";
import { routes } from "@paperclip-ui/designer/src/state/routes";
import { Fields } from "@paperclip-ui/designer/src/ui/input.pc";
import { UsedBy } from "@paperclip-ui/designer/src/ui/right-sidebar.pc";
import {
  SidebarSection,
  SidebarPanelHeader,
  SidebarPanelContent,
} from "@paperclip-ui/designer/src/ui/logic/Sidebar/sidebar.pc";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import React from "react";

export const UsedBySection = () => {
  const expr = useSelector(getSelectedExpressionInfo);
  const graph = useSelector(getGraph);
  const history = useHistory();
  const projectDirectory = useSelector(getEditorState).projectDirectory;

  if (!expr || expr.kind !== ast.ExprKind.Component) {
    return null;
  }

  const instances = ast.getAllInstancesOfComponent(expr.expr, graph);

  return (
    <SidebarSection>
      <SidebarPanelHeader>Instances</SidebarPanelHeader>
      <div>
        {instances.map((instance) => {
          const instancePath = ast.getOwnerDependencyPath(instance.id, graph);
          const ownerComponent = ast.getExprOwnerComponent(instance, graph);
          return (
            <UsedBy
              key={instance.id}
              right={instancePath.replace(projectDirectory?.path + "/", "")}
              left={
                (ownerComponent && ownerComponent.name) ||
                instance.name ||
                "Unnamed instance"
              }
              root={{
                onClick: () => {
                  history.redirect(
                    routes.editor({
                      filePath: instancePath,
                      nodeId: instance.id,
                    })
                  );
                },
              }}
            ></UsedBy>
          );
        })}
      </div>
    </SidebarSection>
  );
};
