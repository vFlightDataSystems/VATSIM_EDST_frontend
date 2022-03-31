import styled from "styled-components";
import cursor from "./cursors/aero_arrow.cur";

export const EdstDraggingOutline = styled.div`
  z-index: 1001;
  background-color: transparent;
  border: 1px solid #FFFFFF;
`;

export const DraggingCursor = styled.div`
  z-index: 1001;
  width: 25px;
  height: 25px;
  content: url(${cursor});
`;