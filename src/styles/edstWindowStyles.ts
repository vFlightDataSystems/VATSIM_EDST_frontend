import styled from "styled-components";

export const WindowHeaderRowDiv = styled.div<{ bottomRow?: boolean }>`
  border-bottom: 1px solid #adadad;

  ${props =>
    props.bottomRow && {
      "align-items": "center",
      "justify-content": "start",
      display: "flex",
      padding: "0 10px"
    }}
`;
