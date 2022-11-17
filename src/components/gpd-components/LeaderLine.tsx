import styled, { css } from "styled-components";
import React from "react";
import type { DataBlockOffset } from "components/GpdMapElements";

type LeaderLineDivProps = {
  angle: number;
  length: number;
};
const LeaderLineDiv = styled.div<LeaderLineDivProps>`
  transform-origin: bottom left;
  ${(props) => css`
    transform: rotate(${props.angle}deg);
    width: ${props.length}px;
    background-color: ${props.theme.colors.grey};
  `}
  height: 1px;
`;
type LeaderLineProps = {
  offset: DataBlockOffset;
  toggleShowRoute: () => void;
};

export const LeaderLine = ({ offset, toggleShowRoute }: LeaderLineProps) => {
  const angle = Math.atan2(offset.y + 6, offset.x) * (180 / Math.PI);
  const length = Math.sqrt(offset.x ** 2 + (offset.y + 6) ** 2);

  return <LeaderLineDiv angle={angle} length={length} onMouseDown={(event) => event.button === 1 && toggleShowRoute()} />;
};
