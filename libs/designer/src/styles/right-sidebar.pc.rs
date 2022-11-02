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

#[path = "styles-panel.pc.rs"]
mod stylesPanel;

#[derive(Properties, PartialEq)]
pub struct RightSidebarProps {
    pub __scope_class_name: Option<String>,
}

#[function_component]
pub fn RightSidebar(props: &RightSidebarProps) -> Html {
    html! {
        <common::Sidebar>
            <stylesPanel::StylesPanel></stylesPanel::StylesPanel>
            
            <common::SidebarPanel>
                <common::SidebarSection>
                    <common::SidebarPanelHeader>
                        
                        <div class={"_RightSidebar-fa34a0f5-12"}></div>
                        
                    </common::SidebarPanelHeader>
                    
                    <common::SidebarPanelContent>
                        <input::Fields>
                            <input::Field input={
                                <input::Select class={"error"}>
                                    
                                </input::Select>
                                
} name={
                                <input::Select>
                                    
                                </input::Select>
                                
}></input::Field>
                            
                            <input::Field input={
                                <input::Select>
                                    
                                </input::Select>
                                
} name={
                                <input::Select>
                                    
                                </input::Select>
                                
}></input::Field>
                            
                        </input::Fields>
                        
                    </common::SidebarPanelContent>
                    
                </common::SidebarSection>
                
                <common::SidebarSection>
                    <common::SidebarPanelContent>
                        <input::Field input={
                            <input::MultiSelect>
                                
                            </input::MultiSelect>
                            
} name={
                            
}></input::Field>
                        
                    </common::SidebarPanelContent>
                    
                </common::SidebarSection>
                
            </common::SidebarPanel>
            
        </common::Sidebar>
    }
}

