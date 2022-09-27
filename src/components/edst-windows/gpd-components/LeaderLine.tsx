import styled from "styled-components";
import React from "react";
import { DataBlockOffset } from "./GpdMapElements";

type LeaderLineDivProps = {
  angle: number;
  length: number;
};
const LeaderLineDiv = styled.div<LeaderLineDivProps>`
  transform-origin: bottom left;
  transform: ${props => `rotate(${props.angle}deg)`};
  height: 1px;
  width: ${props => `${props.length}px`};
  background-color: #adadad;
`;
type LeaderLineProps = {
  offset: DataBlockOffset;
  toggleShowRoute: () => void;
};

export const LeaderLine = ({ offset, toggleShowRoute }: LeaderLineProps) => {
  const angle = Math.atan2(offset.y + 6, offset.x) * (180 / Math.PI);
  const length = Math.sqrt(offset.x ** 2 + (offset.y + 6) ** 2);

  return <LeaderLineDiv angle={angle} length={length} onMouseDown={event => event.button === 1 && toggleShowRoute()} />;
};
