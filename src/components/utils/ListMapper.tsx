import type { ComponentType } from "react";
import React from "react";
import { BodyRowDiv, RowSeparator } from "styles/styles";

type MapRowProps = {
  list: string[];
  Component: ComponentType<{ aircraftId: string }>;
  showSep?: boolean;
};
export const ListMapper = React.memo(({ list, Component, showSep }: MapRowProps) => {
  return (
    <>
      {list.map((aircraftId, i) => (
        <React.Fragment key={aircraftId}>
          <Component aircraftId={aircraftId} />
          {i % 3 === 2 && <RowSeparator />}
        </React.Fragment>
      ))}
      {showSep && list.length > 0 && <BodyRowDiv separator />}
    </>
  );
});
