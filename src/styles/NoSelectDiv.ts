import styled from "styled-components";

export const NoSelectDiv = styled.div`
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

// TODO: rename this div
export const DraggableDiv = styled(NoSelectDiv)<{ anyDragging?: boolean }>(props => props.anyDragging && { "pointer-events": "none" });
