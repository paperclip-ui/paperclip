import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  &.headerless {
    border-top: 2px solid var(--background-2);
  }
  > .header {
    background: var(--background-2);
    border-top: 1px solid var(--background-1);
    border-bottom: 1px solid var(--background-1);
    padding: 8px 12px;
    text-transform: uppercase;
    font-size: 1em;
    font-weight: 400;
  }

  &.secondary {
    > .header {
      border: none;
      background: transparent;
      padding: 8px;
    }
    .content-outer {
      border-bottom: 1px solid var(--background-2);
    }
  }

  .content-outer {
    flex: 1;
    overflow: scroll;
  }
`;
