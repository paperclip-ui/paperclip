use crate::add_inner_wrapper;
use std::collections::BTreeMap;
use std::string::ToString;

include!(concat!(env!("OUT_DIR"), "/virt.html.rs"));

add_inner_wrapper!(node::Inner, Node);
add_inner_wrapper!(value::Inner, Value);
add_inner_wrapper!(metadata_value::Inner, MetadataValue);

impl ToString for Node {
    fn to_string(&self) -> String {
        "[Node]".to_string()
    }
}

impl Node {
    pub fn get_metadata(&self) -> &Option<MetadataValueMap> {
        match self.get_inner() {
            node::Inner::Element(element) => &element.metadata,
            node::Inner::TextNode(text) => &text.metadata,
        }
    }
}

impl Value {
    pub fn is_truthy(&self) -> bool {
        match self.get_inner() {
            value::Inner::Bool(value) => value.value,
            value::Inner::Str(value) => value.value != "",
            value::Inner::Num(value) => value.value != 0 as f32,
            value::Inner::Undef(_) => false,
            _ => true,
        }
    }
}

impl From<String> for Value {
    fn from(value: String) -> Self {
        Value {
            inner: Some(value::Inner::Str(Str {
                source_id: None,
                value,
            })),
        }
    }
}

impl Obj {
    pub fn new(
        source_id: Option<String>,
        properties: Vec<(Option<String>, String, Option<Value>)>,
    ) -> Self {
        Self {
            source_id: source_id.clone(),
            properties: properties
                .iter()
                .map(|(source_id, name, value)| ObjectProperty {
                    source_id: source_id.clone(),
                    name: name.clone(),
                    value: value.clone(),
                })
                .collect(),
        }
    }
    pub fn extend(&mut self, other: &mut Obj) {
        let mut combined = self.to_map();
        combined.extend(other.to_map());
        self.properties = vec![];
        for (_, property) in combined {
            self.properties.push(property);
        }
    }
    fn to_map(&mut self) -> BTreeMap<String, ObjectProperty> {
        let mut map = BTreeMap::new();
        for item in self.properties.drain(..) {
            map.insert(item.name.to_string(), item);
        }
        map
    }
    pub fn get(&self, name: &str) -> Option<&Value> {
        if let Some(property) = self.properties.iter().find(|prop| prop.name == name) {
            Some(&property.value.as_ref().expect("Value must exist"))
        } else {
            None
        }
    }
    pub fn get_deep(&self, path: &Vec<String>) -> Option<&Value> {
        let mut ret: Option<&Value> = None;
        let mut ctx = self;
        let mut parts = path.iter().peekable();
        while let Some(part) = parts.next() {
            if let Some(next) = ctx.get(part) {
                ret = Some(next);

                if !parts.peek().is_none() {
                    if let value::Inner::Obj(next_ctx) = next.get_inner() {
                        ctx = &next_ctx;
                    } else {
                        return None;
                    }
                }
            } else {
                return None;
            }
        }
        return ret;
    }
}

impl ToString for Ary {
    fn to_string(&self) -> String {
        "[Object object]".to_string()
    }
}

impl ToString for Obj {
    fn to_string(&self) -> String {
        "[Object object]".to_string()
    }
}

impl ToString for Str {
    fn to_string(&self) -> String {
        self.value.to_string()
    }
}

impl ToString for Num {
    fn to_string(&self) -> String {
        self.value.to_string()
    }
}

impl ToString for Bool {
    fn to_string(&self) -> String {
        self.value.to_string()
    }
}

impl ToString for Undefined {
    fn to_string(&self) -> String {
        "undefined".to_string()
    }
}

impl ToString for Value {
    fn to_string(&self) -> String {
        self.get_inner().to_string()
    }
}

impl ToString for value::Inner {
    fn to_string(&self) -> String {
        match self {
            Self::Ary(value) => value.to_string(),
            Self::Obj(value) => value.to_string(),
            Self::Str(value) => value.to_string(),
            Self::Bool(value) => value.to_string(),
            Self::Num(value) => value.to_string(),
            Self::Undef(value) => value.to_string(),
            Self::Node(node) => node.to_string(),
        }
    }
}
