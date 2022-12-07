import React, { useEffect, useState } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getActiveVariant,
  getSelectedExpression,
} from "@paperclip-ui/designer/src/machine/state/pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { EditVariantPopup, SaveOptions } from "./EditVariantPopup";
import { Variant } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { editorEvents } from "@paperclip-ui/designer/src/machine/events";

export const VariantsSection = () => {
  const {
    variants,
    editVariantPopupOpen,
    onAddClick,
    onRemoveVariant,
    activeVariant,
    onSelectVariant,
    onCloseEditVariantPopup,
    onSaveCurrentVariant,
  } = useVariantsSection();

  const inputs = [
    ...variants.map((variant) => {
      return (
        <inputStyles.ListItemInput
          key={variant.id}
          onClick={() => onSelectVariant(variant)}
          class="removable"
          onRemoveClick={(event: React.MouseEvent<any>) => {
            event.stopPropagation();
            onRemoveVariant(variant);
          }}
        >
          {variant.name}
        </inputStyles.ListItemInput>
      );
    }),
    <inputStyles.AddListItemButton key="add-button" onClick={onAddClick} />,
  ];

  return (
    <>
      {editVariantPopupOpen && (
        <EditVariantPopup
          name={activeVariant?.name}
          onSave={onSaveCurrentVariant}
          onClose={onCloseEditVariantPopup}
          triggers={activeVariant?.triggers}
        />
      )}
      <inputStyles.Field name="Variants" input={inputs[0]} />
      {...inputs
        .slice(1)
        .map((input, i) => <inputStyles.Field key={i} input={input} />)}
    </>
  );
};

const useVariantsSection = () => {
  const component = useSelector(getSelectedExpression);
  const activeVariant = useSelector(getActiveVariant);
  const variants = ast.getComponentVariants(component);
  const [editVariantPopupOpen, setVariantPopupOpen] = useState(false);

  const dispatch = useDispatch();
  const onRemoveVariant = (variant: Variant) => {
    dispatch(
      editorEvents.removeVariantButtonClicked({ variantId: variant.id })
    );
  };
  const onSelectVariant = (variant: Variant) => {
    dispatch(editorEvents.editVariantClicked({ variantId: variant.id }));
    setVariantPopupOpen(true);
  };

  useEffect(() => {
    setVariantPopupOpen(activeVariant != null);
  }, [activeVariant]);

  const onAddClick = () => {
    setVariantPopupOpen(true);
  };

  const onCloseEditVariantPopup = () => {
    dispatch(editorEvents.editVariantPopupClosed());
    setVariantPopupOpen(false);
  };

  const onSaveCurrentVariant = ({ name, triggers }: SaveOptions) => {
    dispatch(
      editorEvents.variantEdited({
        componentId: component.id,
        newName: name,
        triggers,
      })
    );
  };

  return {
    component,
    onRemoveVariant,
    onSelectVariant,
    activeVariant,
    onSaveCurrentVariant,
    onCloseEditVariantPopup,
    editVariantPopupOpen,
    variants,
    onAddClick,
  };
};
