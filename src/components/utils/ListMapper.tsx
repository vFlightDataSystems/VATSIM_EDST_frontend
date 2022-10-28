import React, { ComponentType } from "react";
import { RootState } from "../../redux/store";
import { useRootSelector } from "../../redux/hooks";
import { BodyRowDiv, RowSeparator } from "../../styles/styles";

type MapRowProps = { selector: (state: RootState) => string[]; Component: ComponentType<{ aircraftId: string }>; showSep?: boolean };
export const ListMapper = ({ selector, Component, showSep }: MapRowProps) => {
  const list = useRootSelector(selector);
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
};
