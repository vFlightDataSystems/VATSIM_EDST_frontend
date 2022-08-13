import styled from "styled-components";
import { edstFontFamily, defaultFontSize, NoSelectDiv, eramFontFamily } from "./styles";

export const EdstDiv = styled(NoSelectDiv)`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0;
  margin: 0;
  background-color: #000000;
  font-family: ${eramFontFamily};
  font-size: ${defaultFontSize};
  //caret-color: transparent;
  //scroll-behavior: auto;
  -webkit-font-smoothing: subpixel-antialiased;

  button,
  input,
  textarea {
    font-family: ${edstFontFamily};
    text-transform: uppercase;
    //font-weight: bold;
    cursor: default;
    overflow-wrap: anywhere;
    //caret: underscore;
  }
`;

export const EdstBodyDiv = styled.div`
  overflow: hidden;
  position: absolute;
  display: flex;
  top: 36px;
  left: 0;
  height: calc(100% - 36px);
  width: 100%;
  flex-grow: 1;
`;
