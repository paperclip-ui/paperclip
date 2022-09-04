use paperclip_parser::pc::ast;

pub fn get_style_namespace(
    element: &ast::Element,
    document_id: &str,
    current_component: Option<&ast::Component>,
) -> String {
    // Here we're taking the _prefered_ name for style rules to make
    // them more readable
    if let Some(name) = &element.name {
        // element names are scoped to either the document, or components. If a
        // component is present, then use that
        let ns = if let Some(component) = &current_component {
            format!("{}-{}", component.name, name)
        } else {
            name.to_string()
        };

        // Keep the CSS scoped to this document.
        format!("{}-{}", ns, document_id)
    } else {
        // No element name? Use the ID. We don't need the document ID
        // here since the element ID is unique.
        format!("{}", element.id)
    }
}
