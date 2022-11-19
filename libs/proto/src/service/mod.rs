pub mod designer {
    use crate::add_inner_wrapper;

    include!(concat!(env!("OUT_DIR"), "/service.designer.rs"));

    add_inner_wrapper!(designer_event::Inner, DesignerEvent);
}
