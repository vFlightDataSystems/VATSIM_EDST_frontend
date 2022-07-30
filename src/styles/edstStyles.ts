import styled from "styled-components";
import { defaultFontFamily, defaultFontSize, NoSelectDiv } from "./styles";

export const EdstDiv = styled(NoSelectDiv)`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0;
  margin: 0;
  background-color: #000000;
  font-family: ${defaultFontFamily};
  font-size: ${defaultFontSize};
  //caret-color: transparent;
  //scroll-behavior: auto;
  -webkit-font-smoothing: subpixel-antialiased;

  button,
  input,
  textarea {
    font-family: ${defaultFontFamily};
    text-transform: uppercase;
    //font-weight: bold;
    cursor: default;
    overflow-wrap: anywhere;
    //caret: underscore;
  }
`;

export const EdstBodyDiv = styled.div`
  overflow: hidden;
  //flex-flow: ;
  position: absolute;
  top: 36px;
  left: 0;
  height: calc(100% - 36px);
  width: 100%;
  flex-grow: 1;
  display: flex;
`;
