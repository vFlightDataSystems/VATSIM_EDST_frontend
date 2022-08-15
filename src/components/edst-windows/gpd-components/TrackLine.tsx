import styled from "styled-components";
import React from "react";
import { WindowPosition } from "../../../types/windowPosition";

type TrackLineDivProps = {
  pos: WindowPosition;
  angle: number;
  length: number;
};
const TrackLineDiv = styled.div<TrackLineDivProps>`
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
type TrackLineProps = { start: WindowPosition; end: WindowPosition; toggleShowRoute(): void };
export const TrackLine = ({ start, end, toggleShowRoute }: TrackLineProps) => {
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
  const length = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);

  return <TrackLineDiv angle={angle} length={length} pos={start} onMouseDown={event => event.button === 1 && toggleShowRoute()} />;
};
