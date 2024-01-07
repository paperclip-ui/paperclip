import React, { useEffect, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/ui/styles-panel.pc";
import {
  ComputedStyle,
  serializeDeclaration,
} from "@paperclip-ui/core/lib/proto/ast/serialize";
import classNames from "classnames";
import { Portal } from "@paperclip-ui/designer/src/ui/logic/Portal";
import { usePositioner } from "@paperclip-ui/designer/src/ui/logic/hooks/usePositioner";
import { useHistory } from "@paperclip-ui/designer/src/domains/history/react";
import { routes } from "@paperclip-ui/designer/src/state/routes";
import { useSelector } from "@paperclip-ui/common";
import { getGraph } from "@paperclip-ui/designer/src/state";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import { NameInput } from "./NameInput";

export type DeclNameProps = {
  name: string;
  style: ComputedStyle;
  inherited: boolean;
  onChange?: (value: string) => void;
};

export const DeclName = ({ name, style, inherited }: DeclNameProps) => {
  const { onClick, change, anchorRef, targetRef } = useDeclName();

  // WIP
  // if (!inherited && change) {
  //   return <NameInput name={name} onChange={onChange} />;
  // }

  return (
    <styles.DeclInheritanceInfo
      class={classNames({
        open: change,
      })}
    >
      <styles.DeclName
        ref={anchorRef}
        class={classNames({
          inherited,
          overridden: !inherited && !!style.prevValues?.length,
        })}
        onClick={onClick}
      >
        {name}
      </styles.DeclName>
      {change && (!!style.prevValues?.length || inherited) ? (
        <Portal>
          <styles.DeclInfoCard
            ref={targetRef}
            header={inherited ? "Inherited from:" : "Overrides:"}
          >
            {inherited ? <PreValue name={name} value={style} /> : null}
            {style.prevValues?.map((prevValue, i) => {
              return <PreValue name={name} key={i} value={prevValue} />;
            })}
          </styles.DeclInfoCard>
        </Portal>
      ) : null}
    </styles.DeclInheritanceInfo>
  );
};

type PreValueProps = {
  value: ComputedStyle;
  name: string;
};

const PreValue = ({ name: declName, value }: PreValueProps) => {
  const history = useHistory();
  const graph = useSelector(getGraph);

  const owner = ast.getExprInfoById(value.ownerId, graph);
  const ownerDep = ast.getOwnerDependency(owner.expr.id, graph);

  let name = "element";
  let text = false;
  let element = false;
  let mixin = false;

  if (owner.kind === ast.ExprKind.Style) {
    const ownerParent = ast.getParentExprInfo(owner.expr.id, graph);
    if (ownerParent.kind === ast.ExprKind.Document) {
      name = owner.expr.name;
      mixin = true;
    } else if (ownerParent.kind === ast.ExprKind.Element) {
      name = owner.expr.name;
      element = true;
    } else if (ownerParent.kind === ast.ExprKind.TextNode) {
      name = owner.expr.name;
      element = true;
    }
  }

  const onMouseDown = () => {
    history.redirect(
      routes.editor({
        filePath: ownerDep.path,
        nodeId: owner.expr.id,
        declName: declName,
        variantIds: value.variantIds,
      })
    );
  };

  return (
    <styles.InheritedDeclInfo
      inheritedDeclInfo={{
        className: classNames({
          text,
          element,
          mixin,
        }),
        onMouseDown,
      }}
      name={
        name +
        (value.variantIds.length
          ? " / " +
            value.variantIds
              .map((variantId) => {
                const variant = ast.getExprInfoById(variantId, graph);
                return variant.expr.name;
              })
              .join("+")
          : "")
      }
      value={serializeDeclaration(value.value)}
    />
  );
};

const useDeclName = () => {
  const [change, setChange] = useState(false);

  const { anchorRef, targetRef } = usePositioner({
    x: "center",
    y: "bottom",
  });

  useEffect(() => {
    const close = () => setChange(false);
    const onResize = close;
    const onMouseDown = close;
    window.addEventListener("resize", onResize);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [change]);

  const onClick = () => {
    setChange(!change);
  };

  return { onClick, change, anchorRef, targetRef };
};
