import styled from "styled-components";
import { NoSelectDiv } from "./NoSelectDiv";

export const EdstDiv = styled(NoSelectDiv)`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0;
  margin: 0;
  background-color: #000000;
  font-family: ${props => props.theme.fontProperties.eramFontFamily};
  font-size: ${props => props.theme.fontProperties.fontSize};
  //caret-color: transparent;
  //scroll-behavior: auto;
  -webkit-font-smoothing: subpixel-antialiased;

  button,
  input,
  textarea {
    font-family: ${props => props.theme.fontProperties.edstFontFamily};
    text-transform: uppercase;
    //font-weight: bold;
    cursor: default;
    overflow-wrap: anywhere;
    //caret: underscore;
  }
`;
export const EdstWindowHeaderRowDiv = styled.div<{ bottomRow?: boolean }>`
  border-bottom: 1px solid #adadad;

  ${props =>
    props.bottomRow && {
      "align-items": "center",
      "justify-content": "start",
      display: "flex",
      padding: "0 10px"
    }}
`;
export const EdstBodyDiv = styled.div`
  overflow: hidden;
  position: absolute;
  display: flex;
  font-size: inherit;
  top: calc(2em + 4px);
  left: 0;
  height: calc(100% - 2em - 4px);
  width: 100%;
  flex-grow: 1;
`;
