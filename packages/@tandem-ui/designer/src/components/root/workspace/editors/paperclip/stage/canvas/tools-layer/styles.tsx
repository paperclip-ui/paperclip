import styled from "styled-components";

export const VisualToolsNodeOverlay = styled.div`
  position: absolute;
  opacity: 0;
  background: rgba(0, 0, 0, 0);
  &.hovering {
    opacity: 1;
  }
`;

export const ToolsLayer = styled.div`
  width: 100%;
  height: 100%;
`;
