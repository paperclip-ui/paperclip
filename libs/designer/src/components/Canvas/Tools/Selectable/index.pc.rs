/**
 * !! This file is AUTO GENERATED by the Paperclip Yew compiler.
 */

use yew::prelude::*;
use yew::{function_component, Children, html, Properties, Callback, MouseEvent};

#[path = "../../../../styles/theme.pc.rs"]
mod theme;

#[derive(Properties, PartialEq)]
pub struct KnobProps {
    pub __scope_class_name: Option<String>,
    pub class: ,
    pub onMouseDown: ,
    pub style: ,
}

#[function_component]
pub fn Knob(props: &KnobProps) -> Html {
    html! {
        <svg class={format!("{} {}", props.class.clone(), if let Some(scope_class_name) = &props.__scope_class_name {
            format!("{} {}", "_Knob-e1979310-56", scope_class_name)
        } else {
            "_Knob-e1979310-56".to_string()
        })} onMouseDown={props.onMouseDown.clone()} style={props.style.clone()}>
            <rect class={"_Knob-e1979310-55"}></rect>
            
        </svg>
    }
}

#[derive(Properties, PartialEq)]
pub struct OverlayProps {
    pub __scope_class_name: Option<String>,
    pub knobs: Children,
    pub onClick: ,
    pub onMouseDown: ,
    pub size: Children,
    pub style: ,
}

#[function_component]
pub fn Overlay(props: &OverlayProps) -> Html {
    html! {
        <div class={if let Some(scope_class_name) = &props.__scope_class_name {
            format!("{} {}", "_Overlay-e1979310-132", scope_class_name)
        } else {
            "_Overlay-e1979310-132".to_string()
        }} onClick={props.onClick.clone()} onMouseDown={props.onMouseDown.clone()} style={props.style.clone()}>
            { for props.knobs.iter() }
            <div class={"_Overlay-e1979310-131"}>
                { for props.size.iter() }
            </div>
            
        </div>
    }
}

