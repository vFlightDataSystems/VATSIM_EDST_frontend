import styled from "styled-components";
import {defaultFontFamily, defaultFontSize, NoSelectDiv} from "./styles";

export const EdstDiv = styled(NoSelectDiv)`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0;
  margin: 0;
  background-color: #000000;
  font-family: ${defaultFontFamily};
  font-size: ${defaultFontSize};
  caret-color: transparent;
  scroll-behavior: auto;
  -webkit-font-smoothing: none;

  button, input, textarea {
    font-family: ${defaultFontFamily};
    //font-weight: bold;
    -webkit-font-smoothing: none;
    cursor: default;
    overflow-wrap: anywhere;
    caret: underscore;
  }
`;

export const EdstBodyDiv = styled.div<{hideCursor?: boolean}>`
  overflow: hidden;
  flex-flow: column;
  position: absolute;
  top: 36px;
  left: 0;
  height: calc(100vh - 36px);
  width: 100vw;
  flex-grow: 1;
  display: flex;
  
  ${props => props.hideCursor && {cursor: "none"}};
`;