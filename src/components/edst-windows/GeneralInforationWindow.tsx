import React, { useMemo, useState } from "react";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { airmetSelector, setSigmetAcknowledged } from "../../redux/slices/weatherSlice";
import { FloatingWindowRow } from "../../styles/floatingWindowStyles";
import { ScrollContainer } from "../../styles/optionMenuStyles";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { FloatingWindow } from "../utils/FloatingWindow";

export const GIWindow = () => {
  const dispatch = useRootDispatch();
  const airmetMap = useRootSelector(airmetSelector);
  const [selectedAirmet, setSelectedAirmet] = useState<string | null>(null);

  const [showOptions, setShowOptions] = useState(false);
  const extraOptions = useMemo(
    () => ({
      printAll: { value: "PRINT ALL", backgroundColor: "#000000" }
    }),
    []
  );

  const handleEntryMouseDown = (event: React.MouseEvent<HTMLDivElement>, airmetId: string) => {
    setShowOptions(false);
    if (selectedAirmet !== airmetId) {
      if (!airmetMap[airmetId].acknowledged) {
        dispatch(setSigmetAcknowledged({ id: airmetId, value: true }));
      }
      setSelectedAirmet(airmetId);
    } else {
      setSelectedAirmet(null);
    }
  };

  const setShowOptionsHandler = (value: boolean) => {
    setSelectedAirmet(null);
    setShowOptions(value);
  };

  return (
    <FloatingWindow
      title="General Information"
      optionsHeaderTitle="GI"
      width="1100px"
      window={EdstWindow.GI}
      extraOptions={extraOptions}
      showOptions={showOptions}
      setShowOptions={setShowOptionsHandler}
    >
      {Object.values(airmetMap).length > 0 && (
        <ScrollContainer maxHeight="600px">
          {Object.entries(airmetMap).map(([airmetId, airmetEntry]) => (
            <span style={{ margin: "6px 0" }} key={airmetId}>
              <FloatingWindowRow selected={selectedAirmet === airmetId} onMouseDown={event => handleEntryMouseDown(event, airmetId)}>
                {airmetEntry.text}
              </FloatingWindowRow>
            </span>
          ))}
        </ScrollContainer>
      )}
    </FloatingWindow>
  );
};
