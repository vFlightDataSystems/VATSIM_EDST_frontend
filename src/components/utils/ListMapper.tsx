import type { ComponentType } from "react";
import React from "react";
import tableStyles from "css/table.module.scss";
import type { AircraftId } from "types/aircraftId";

type MapRowProps = {
  list: string[];
  Component: ComponentType<{ aircraftId: AircraftId }>;
  showSep?: boolean;
};
export const ListMapper = React.memo(({ list, Component, showSep }: MapRowProps) => {
  return (
    <>
      {list.map((aircraftId, i) => (
        <React.Fragment key={aircraftId}>
          <Component key={aircraftId} aircraftId={aircraftId} />
          {i % 3 === 2 && <div className={tableStyles.rowSeparator} />}
        </React.Fragment>
      ))}
      {showSep && list.length > 0 && <div className={tableStyles.separator} />}
    </>
  );
});
