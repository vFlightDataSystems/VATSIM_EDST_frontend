import styled from "styled-components";

export const defaultFontFamily = 'TERMINUS';
export const defaultFontSize = '17px';
export const defaultInputFontSize = '16px';

export const NoSelectDiv = styled.div`
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;
export const DraggingDiv = styled(NoSelectDiv)`
  pointer-events: none;
`;

export const FocusedWindowDiv = styled.div`
  background-color: #008585;
`;