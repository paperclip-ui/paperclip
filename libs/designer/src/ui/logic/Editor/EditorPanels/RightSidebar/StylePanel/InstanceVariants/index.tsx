import React from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/ui/logic/Sidebar/sidebar.pc";
import * as input from "@paperclip-ui/designer/src/ui/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getGraph,
  getSelectedExpressionInfo,
  getSelectedExprOwnerComponent,
  getSelectedVariantIds,
} from "@paperclip-ui/designer/src/state";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { Element } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import classNames from "classnames";

export const InstanceVariants = () => {
  const expr = useSelector(getSelectedExpressionInfo);

  if (expr?.kind !== ast.ExprKind.Element) {
    return null;
  }

  return <InstanceVariantsInner expr={expr.expr} />;
};

type InstanceVariantsInnerProps = {
  expr: Element;
};

export const InstanceVariantsInner = ({ expr }: InstanceVariantsInnerProps) => {
  const graph = useSelector(getGraph);
  const selectedVariantIds = useSelector(getSelectedVariantIds);
  const component = ast.getInstanceComponent(expr, graph);
  const variants = component?.body.filter((body) => body.variant != null);
  const dispatch = useDispatch<DesignerEvent>();

  const onVariantToggle = (variantId: string) => {
    dispatch({ type: "designer/instanceVariantToggled", payload: variantId });
  };

  if (!component || variants.length === 0) {
    return null;
  }

  return (
    <sidebarStyles.SidebarSection>
      <sidebarStyles.SidebarPanelHeader>
        Instance
      </sidebarStyles.SidebarPanelHeader>
      <sidebarStyles.SidebarPanelContent>
        <input.Fields>
          {variants.map((variant) => {
            const on = ast.isInstanceVariantEnabled(
              expr.id,
              variant.variant.id,
              selectedVariantIds,
              graph
            );

            return (
              <input.Field
                name={variant.variant.name}
                input={
                  <input.RadioInput
                    container={{ className: classNames({ on }), onClick: () => onVariantToggle(variant.variant.id) }}

                  />
                }
              />
            );
          })}
        </input.Fields>
      </sidebarStyles.SidebarPanelContent>
    </sidebarStyles.SidebarSection>
  );
};
