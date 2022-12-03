import React, { useState } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { getSelectedExpression } from "@paperclip-ui/designer/src/machine/state/pc";
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
          onRemoveClick={() => onRemoveVariant(variant)}
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
        />
      )}
      <inputStyles.Field name="Variants" input={inputs[0]} />
      {...inputs
        .slice(1)
        .map((input) => (
          <inputStyles.Field key={input.props.key} input={input} />
        ))}
    </>
  );
};

const useVariantsSection = () => {
  const component = useSelector(getSelectedExpression);
  const variants = ast.getComponentVariants(component);
  const [activeVariant, setActiveVariant] = useState<Variant>();
  const [editVariantPopupOpen, setVariantPopupOpen] = useState(false);
  const dispatch = useDispatch();
  const onRemoveVariant = (variant: Variant) => {
    // TODO
  };
  const onSelectVariant = (variant: Variant) => {
    setActiveVariant(variant);
    setVariantPopupOpen(true);
  };

  const onAddClick = () => {
    setVariantPopupOpen(true);
  };

  const onCloseEditVariantPopup = () => {
    setVariantPopupOpen(false);
  };
  const onSaveCurrentVariant = ({ name }: SaveOptions) => {
    dispatch(
      editorEvents.variantEdited({
        componentId: component.id,
        variantId: activeVariant?.id,
        newName: name,
        triggers: [],
      })
    );
    setVariantPopupOpen(false);
    setActiveVariant(null);
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
