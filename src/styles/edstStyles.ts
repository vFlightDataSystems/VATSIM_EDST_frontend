import styled, { css } from "styled-components";
import { NoSelectDiv } from "./NoSelectDiv";

export const EdstDiv = styled(NoSelectDiv)`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0;
  margin: 0;
  background-color: #000000;
  font-family: ${props => props.theme.fontProps.eramFontFamily};
  font-size: ${props => props.theme.fontProps.fontSize};
  //caret-color: transparent;
  //scroll-behavior: auto;
  -webkit-font-smoothing: subpixel-antialiased;
`;
type EdstWindowHeaderRowDivProps = { bottomRow?: boolean };
export const EdstWindowHeaderRowDiv = styled.div<EdstWindowHeaderRowDivProps>`
  border-bottom: 1px solid #adadad;

  ${props =>
    props.bottomRow &&
    css`
      align-items: center;
      justify-content: start;
      display: flex;
      padding: 0 10px;
    `};
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

  button,
  input,
  textarea {
    font-family: ${props => props.theme.fontProps.edstFontFamily};
    text-transform: uppercase;
    //font-weight: bold;
    cursor: default;
    overflow-wrap: anywhere;
    //caret: underscore;
  }
`;
