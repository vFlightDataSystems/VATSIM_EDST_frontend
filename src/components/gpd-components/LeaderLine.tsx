import React from "react";
import gpdStyles from "css/gpd.module.scss";
import type { DataBlockOffset } from "components/GpdMapElements";

type LeaderLineProps = {
  offset: DataBlockOffset;
  toggleShowRoute: () => void;
};

export const LeaderLine = ({ offset, toggleShowRoute }: LeaderLineProps) => {
  const angle = Math.atan2(offset.y, offset.x) * (180 / Math.PI);
  const length = Math.sqrt(offset.x ** 2 + (offset.y + 6) ** 2);

  return (
    <div
      className={gpdStyles.leaderline}
      style={{ width: `${length}px`, transform: `rotate(${angle}deg)` }}
      onMouseDownCapture={(event) => {
        console.log(event);
        if (event.button === 1) {
          toggleShowRoute();
        }
      }}
    />
  );
};
