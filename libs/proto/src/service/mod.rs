pub mod designer {
    use crate::add_inner_wrapper;

    include!(concat!(env!("OUT_DIR"), "/service.designer.rs"));

    add_inner_wrapper!(design_server_event::Inner, DesignServerEvent);
}
