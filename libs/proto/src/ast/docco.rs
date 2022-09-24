include!(concat!(env!("OUT_DIR"), "/ast.docco.rs"));

impl property_value::Value {
    pub fn wrap(self) -> PropertyValue {
        PropertyValue { value: Some(self) }
    }
}

impl parameter_value::Value {
    pub fn wrap(self) -> ParameterValue {
        ParameterValue { value: Some(self) }
    }
}

impl comment_body_item::Value {
    pub fn wrap(self) -> CommentBodyItem {
        CommentBodyItem { value: Some(self) }
    }
}
