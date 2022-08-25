import styled from "styled-components";
import React from "react";
import { WindowPosition } from "../../../typeDefinitions/types/windowPosition";

type TrackLineDivProps = {
  pos: WindowPosition;
  angle: number;
  length: number;
};
const LeaderLineDiv = styled.div<TrackLineDivProps>`
  transform-origin: bottom left;
  transform: ${props => `rotate(${props.angle}deg)`};
  position: absolute;
  ${props => ({
    left: `${props.pos.x}px`,
    top: `${props.pos.y}px`
  })}
  height: 1px;
  width: ${props => `${props.length}px`};
  background-color: #adadad;
`;
type LeaderLineProps = { pos: WindowPosition; offset: { x: number; y: number }; toggleShowRoute(): void };
export const LeaderLine = ({ pos, offset, toggleShowRoute }: LeaderLineProps) => {
  const angle = Math.atan2(offset.y, offset.x) * (180 / Math.PI);
  const length = Math.sqrt(offset.x ** 2 + offset.y ** 2);

  return <LeaderLineDiv angle={angle} length={length} pos={pos} onMouseDown={event => event.button === 1 && toggleShowRoute()} />;
};
