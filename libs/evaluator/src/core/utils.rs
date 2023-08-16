use paperclip_proto::ast::pc as ast;

pub fn get_style_namespace(
    name: &Option<String>,
    id: &str,
    current_component: Option<&ast::Component>,
) -> String {
    // Here we're taking the _prefered_ name for style rules to make
    // them more readable
    if let Some(name) = name {
        // element names are scoped to either the document, or components. If a
        // component is present, then use that
        let ns = if let Some(component) = &current_component {
            format!("{}-{}", component.name, name)
        } else {
            name.to_string()
        };

        // Keep the CSS scoped to this document.
        format!("_{}-{}", ns, id)
    } else {
        if let Some(component) = &current_component {
            format!("_{}-{}", component.name, id)
        } else {
            // No element name? Use the ID. We don't need the document ID
            // here since the element ID is unique.
            format!("_{}", id)
        }
    }
}

pub fn get_variant_namespace(variant: &ast::Variant) -> String {
    format!("_variant-{}", variant.id)
}
