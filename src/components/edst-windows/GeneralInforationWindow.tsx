import React, { useMemo, useRef, useState } from "react";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { airmetSelector, delAirmet, setSigmetAcknowledged } from "../../redux/slices/weatherSlice";
import { FloatingWindowRow } from "../../styles/floatingWindowStyles";
import { ScrollContainer } from "../../styles/optionMenuStyles";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { FloatingWindow } from "../utils/FloatingWindow";
import { zStackSelector } from "../../redux/slices/appSlice";
import { FloatingWindowOptionContainer } from "../utils/FloatingWindowOptionContainer";

type GIRowProps = {
  text: string;
  selected: boolean;
  handleMouseDown: React.MouseEventHandler<HTMLDivElement>;
  onDelete: () => void;
};
const GIRow = ({ text, selected, handleMouseDown, onDelete }: GIRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);

  const zIndex = zStack.indexOf(EdstWindow.SIGMETS);
  const rect = ref.current?.getBoundingClientRect();

  return (
    <>
      <FloatingWindowRow ref={ref} selected={selected} onMouseDown={handleMouseDown}>
        {text}
      </FloatingWindowRow>
      {selected && rect && (
        <FloatingWindowOptionContainer
          pos={{
            x: rect.left + rect.width,
            y: rect.top
          }}
          zIndex={zIndex}
          options={{
            delete: {
              value: "DELETE",
              backgroundColor: "#575757",
              onMouseDown: onDelete
            },
            print: {
              value: "PRINT",
              backgroundColor: "#575757"
            }
          }}
        />
      )}
    </>
  );
};

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
    if (value) {
      setSelectedAirmet(null);
    }
    setShowOptions(value);
  };

  return (
    <FloatingWindow
      width="120ch"
      title="General Information"
      optionsHeaderTitle="GI"
      window={EdstWindow.GI}
      extraOptions={extraOptions}
      showOptions={showOptions}
      setShowOptions={setShowOptionsHandler}
    >
      {Object.values(airmetMap).length > 0 && (
        <ScrollContainer maxHeight="600px">
          {Object.entries(airmetMap).map(([airmetId, airmetEntry]) => (
            <GIRow
              key={airmetId}
              text={airmetEntry.text}
              selected={selectedAirmet === airmetId}
              handleMouseDown={event => handleEntryMouseDown(event, airmetId)}
              onDelete={() => {
                dispatch(delAirmet(airmetId));
                setSelectedAirmet(null);
              }}
            />
          ))}
        </ScrollContainer>
      )}
    </FloatingWindow>
  );
};
