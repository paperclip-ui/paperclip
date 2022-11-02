/**
 * !! This file is AUTO GENERATED by the Paperclip Yew compiler.
 */

use yew::prelude::*;
use yew::{function_component, Children, html, Properties, Callback, MouseEvent};

#[derive(Properties, PartialEq)]
pub struct FramesContainerProps {
    pub __scope_class_name: Option<String>,
    #[prop_or_default]
    pub children: Children,
    pub class: String,
    pub style: ,
}

#[function_component]
pub fn FramesContainer(props: &FramesContainerProps) -> Html {
    html! {
        <div class={format!("{} {}", props.class.clone(), if let Some(scope_class_name) = &props.__scope_class_name {
            format!("{} {}", "_FramesContainer-67e2e2a3-28", scope_class_name)
        } else {
            "_FramesContainer-67e2e2a3-28".to_string()
        })} data-label={"Frames container"} style={props.style.clone()}>
            { for props.children.iter() }
        </div>
    }
}

#[derive(Properties, PartialEq)]
pub struct FrameProps {
    pub __scope_class_name: Option<String>,
    #[prop_or_default]
    pub children: Children,
    pub class: String,
    pub style: ,
}

#[function_component]
pub fn Frame(props: &FrameProps) -> Html {
    html! {
        <div class={format!("{} {}", props.class.clone(), if let Some(scope_class_name) = &props.__scope_class_name {
            format!("{} {}", "_Frame-67e2e2a3-52", scope_class_name)
        } else {
            "_Frame-67e2e2a3-52".to_string()
        })} style={props.style.clone()}>
            { for props.children.iter() }
        </div>
    }
}

#[derive(Properties, PartialEq)]
pub struct FrameTitleProps {
    pub __scope_class_name: Option<String>,
    pub onClick: ,
    pub onDoubleClick: ,
    pub onMouseUp: ,
    pub style: ,
    pub value: Children,
}

#[function_component]
pub fn FrameTitle(props: &FrameTitleProps) -> Html {
    html! {
        <div class={if let Some(scope_class_name) = &props.__scope_class_name {
            format!("{} {}", "_FrameTitle-67e2e2a3-117", scope_class_name)
        } else {
            "_FrameTitle-67e2e2a3-117".to_string()
        }} onClick={props.onClick.clone()} onDoubleClick={props.onDoubleClick.clone()} onMouseUp={props.onMouseUp.clone()} style={props.style.clone()}>
            <span class={"_FrameTitle-title-67e2e2a3-116"}>
                { for props.value.iter() }
            </span>
            
        </div>
    }
}

