import styled from "styled-components";
import {defaultFontFamily, defaultFontSize, NoSelectDiv} from "./styles";
import cursor from './cursors/aero_arrow.cur';

export const StyledEdstDiv = styled(NoSelectDiv)`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0;
  margin: 0;
  background-color: #000000;
  font-family: ${defaultFontFamily};
  font-size: ${defaultFontSize};
  caret-color: transparent;
  -webkit-font-smoothing: none;
`;

export const StyledEdstBodyDiv = styled.div`
  overflow: hidden;
  flex-flow: column;
  position: absolute;
  top: 36px;
  left: 0;
  height: calc(100vh - 36px);
  width: 100vw;
  flex-grow: 1;
  display: flex;

  &.hide-cursor {
    cursor: none;
  }
`;

export const EdstDraggingOutlineDiv = styled.div`
  z-index: 1001;
  background-color: transparent;
  border: 1px solid #FFFFFF;
`;

export const DraggingCursorDiv = styled.div`
  z-index: 1001;
  width: 25px;
  height: 25px;
  content: url(${cursor});
`;