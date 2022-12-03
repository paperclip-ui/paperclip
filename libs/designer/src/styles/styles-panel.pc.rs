/**
 * !! This file is AUTO GENERATED by the Paperclip Yew compiler.
 */

use yew::prelude::*;
use yew::{function_component, Children, html, Properties, Callback, MouseEvent};

#[path = "common.pc.rs"]
mod common;

#[path = "theme.pc.rs"]
mod theme;

#[path = "input.pc.rs"]
mod input;

#[derive(Properties, PartialEq)]
struct ColorPickerPopupProps {
    pub __scope_class_name: Option<String>,
}

#[function_component]
fn ColorPickerPopup(props: &ColorPickerPopupProps) -> Html {
    html! {
        <div class={if let Some(scope_class_name) = &props.__scope_class_name {
            format!("{} {}", "_ColorPickerPopup-bdf7c0fc-84", scope_class_name)
        } else {
            "_ColorPickerPopup-bdf7c0fc-84".to_string()
        }}>
            <div class={"_ColorPickerPopup-header-bdf7c0fc-36"}>
                <div>
                    
                </div>
                
                <div>
                    
                </div>
                
            </div>
            
            <div class={"_ColorPickerPopup-bdf7c0fc-59"}>
                <color-picker height={"130"} width={"220"}></color-picker>
                
                <div>
                    
                </div>
                
                <div>
                    
                </div>
                
                <div>
                    
                </div>
                
            </div>
            
            <div class={"_ColorPickerPopup-bdf7c0fc-83"}>
                <div>
                    
                </div>
                
                <div>
                    
                </div>
                
                <div>
                    
                </div>
                
            </div>
            
        </div>
    }
}

#[derive(Properties, PartialEq)]
pub struct PreviewProps {
    pub __scope_class_name: Option<String>,
}

#[function_component]
pub fn Preview(props: &PreviewProps) -> Html {
    html! {
        <common::SidebarPanel>
            <common::SidebarSection>
                <common::SidebarPanelContent>
                    <input::Field input={
                        <input::MultiSelect>
                            <input::MultiSelectItem>
                                
                            </input::MultiSelectItem>
                            
                            <input::MultiSelectItem>
                                
                            </input::MultiSelectItem>
                            
                        </input::MultiSelect>
                        
} name={
                        
}></input::Field>
                    
                </common::SidebarPanelContent>
                
            </common::SidebarSection>
            
            <common::SidebarSection>
                <common::SidebarPanelHeader>
                    
                    <div class={"_Preview-bdf7c0fc-104"}></div>
                    
                </common::SidebarPanelHeader>
                
                <common::SidebarPanelContent>
                    <input::Fields>
                        <input::Field input={
                            <input::Select value={
                                <input::Token class={"keyword"}>
                                    
                                </input::Token>
                                
}></input::Select>
                            
} name={
                            
}></input::Field>
                        
                        <input::Field input={
                            <input::TextInput class={"active"} placeholder={"0px"} value={""}></input::TextInput>
                            
} name={
                            
}></input::Field>
                        
                        <input::Field input={
                            <input::TextInput placeholder={"0px"} value={""}></input::TextInput>
                            
} name={
                            
}></input::Field>
                        
                        <input::Field input={
                            <input::Select value={
                                <input::Token class={"keyword"}>
                                    
                                </input::Token>
                                
}></input::Select>
                            
} name={
                            
}></input::Field>
                        
                        <input::Field input={
                            <input::Select value={
                                <input::Token class={"keyword"}>
                                    
                                </input::Token>
                                
}></input::Select>
                            
} name={
                            
}></input::Field>
                        
                    </input::Fields>
                    
                </common::SidebarPanelContent>
                
            </common::SidebarSection>
            
            <common::SidebarSection>
                <common::SidebarPanelHeader>
                    
                    <div class={"_Preview-bdf7c0fc-165"}></div>
                    
                </common::SidebarPanelHeader>
                
                <common::SidebarPanelContent>
                    <input::Fields>
                        <input::Field input={
                            <input::ColorInput>
                                <span>
                                    <input::Token class={"call"}>
                                        
                                    </input::Token>
                                    
                                    <input::Token class={"punc"}>
                                        
                                    </input::Token>
                                    
                                    <input::Token class={"number"}>
                                        
                                    </input::Token>
                                    
                                    <input::Token class={"punc"}>
                                        
                                    </input::Token>
                                    
                                    <input::Token class={"number"}>
                                        
                                    </input::Token>
                                    
                                    <input::Token class={"punc"}>
                                        
                                    </input::Token>
                                    
                                    <input::Token class={"number"}>
                                        
                                    </input::Token>
                                    
                                    <input::Token class={"punc"}>
                                        
                                    </input::Token>
                                    
                                </span>
                                
                            </input::ColorInput>
                            
} name={
                            
                            <ColorPickerPopup></ColorPickerPopup>
                            
}></input::Field>
                        
                        <input::Field input={
                            <input::ColorInput>
                                <span>
                                    <input::Token class={"keyword"}>
                                        
                                    </input::Token>
                                    
                                </span>
                                
                            </input::ColorInput>
                            
}></input::Field>
                        
                        <input::Field input={
                            <input::ColorInput>
                                <span>
                                    <input::Token class={"keyword"}>
                                        
                                    </input::Token>
                                    
                                </span>
                                
                            </input::ColorInput>
                            
}></input::Field>
                        
                        <input::Field input={
                            <input::TextInput placeholder={"0px"} value={""}>
                                
                            </input::TextInput>
                            
} name={
                            
}></input::Field>
                        
                    </input::Fields>
                    
                </common::SidebarPanelContent>
                
            </common::SidebarSection>
            
            <common::SidebarSection>
                <common::SidebarPanelContent>
                    <input::Fields>
                        <input::Field input={
                            <input::Select value={
                                
}></input::Select>
                            
} name={
                            <div class={"_Preview-bdf7c0fc-272"}>
                                <div class={"_Preview-bdf7c0fc-270"}></div>
                                
                                
                            </div>
                            
}></input::Field>
                        
                        <input::Field input={
                            <input::Select value={
                                
}></input::Select>
                            
}></input::Field>
                        
                        <input::Field input={
                            <input::Select value={
                                
}></input::Select>
                            
}></input::Field>
                        
                    </input::Fields>
                    
                </common::SidebarPanelContent>
                
            </common::SidebarSection>
            
            <div class={"_Preview-bdf7c0fc-329"}>
                <common::SidebarSection>
                    <common::SidebarPanelHeader>
                        
                        <div class={"_Preview-bdf7c0fc-303"}></div>
                        
                    </common::SidebarPanelHeader>
                    
                    <common::SidebarPanelContent>
                        <input::Fields>
                            <input::Field input={
                                <input::ColorInput>
                                    
                                </input::ColorInput>
                                
} name={
                                
}></input::Field>
                            
                            <input::Field input={
                                <input::TextInput value={"12px"}></input::TextInput>
                                
} name={
                                
}></input::Field>
                            
                        </input::Fields>
                        
                    </common::SidebarPanelContent>
                    
                </common::SidebarSection>
                
            </div>
            
        </common::SidebarPanel>
    }
}

