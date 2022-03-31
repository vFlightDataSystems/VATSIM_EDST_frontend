import styled from "styled-components";


export const WindowHeaderRowDiv = styled.div<{bottomRow?: boolean}>`
  border-bottom: 1px solid #ADADAD;
  
  ${props => props.bottomRow && {
    "align-items": "center",
    "display": "flex",
    "padding": "0 10px"
  }}
`;