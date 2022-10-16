import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { zStackSelector } from "../../redux/slices/appSlice";
import { FloatingWindowOptionContainer } from "../utils/FloatingWindowOptionContainer";
import { FloatingWindowRow } from "../../styles/floatingWindowStyles";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { useMetar } from "../../api/weatherApi";
import { delMetar, metarAirportsSelector } from "../../redux/slices/weatherSlice";
import { FloatingWindow } from "../utils/FloatingWindow";
import { windowOptionsSelector } from "../../redux/slices/windowOptionsSlice";

type MetarRowProps = {
  airport: string;
  selected: boolean;
  handleMouseDown: React.MouseEventHandler<HTMLDivElement>;
  onDelete: () => void;
};
const MetarRow = ({ airport, selected, handleMouseDown, onDelete }: MetarRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const windowOptions = useRootSelector(windowOptionsSelector(EdstWindow.METAR));
  const { data: airportMetar, isFetching } = useMetar(airport);

  useEffect(() => {
    if (!airportMetar && !isFetching) {
      dispatch(delMetar(airport));
    }
  }, [isFetching, airportMetar, dispatch, airport]);

  const zIndex = zStack.indexOf(EdstWindow.METAR);
  const rect = ref.current?.getBoundingClientRect();

  return !airportMetar ? null : (
    <>
      <FloatingWindowRow ref={ref} brightness={windowOptions.brightness} selected={selected} onMouseDown={handleMouseDown}>
        {airportMetar ?? "..."}
      </FloatingWindowRow>
      {selected && rect && (
        <FloatingWindowOptionContainer
          parentWidth={rect.width}
          parentPos={rect}
          zIndex={zIndex}
          options={{
            delete: {
              value: `DELETE ${airport}`,
              backgroundColor: "#575757",
              onMouseDown: onDelete
            }
          }}
        />
      )}
    </>
  );
};

export const MetarWindow = () => {
  const dispatch = useRootDispatch();
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);
  const airports = useRootSelector(metarAirportsSelector);

  const [showOptions, setShowOptions] = useState(false);
  const extraOptions = useMemo(
    () => ({
      printAll: { value: "PRINT ALL", backgroundColor: "#000000" }
    }),
    []
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, airport: string) => {
      setShowOptions(false);
      if (selectedAirport !== airport) {
        setSelectedAirport(airport);
      } else {
        setSelectedAirport(null);
      }
    },
    [selectedAirport]
  );

  const setShowOptionsHandler = (value: boolean) => {
    if (value) {
      setSelectedAirport(null);
    }
    setShowOptions(value);
  };

  return (
    <FloatingWindow
      title="WX"
      optionsHeaderTitle="WX"
      width="40ch"
      window={EdstWindow.METAR}
      extraOptions={extraOptions}
      showOptions={showOptions}
      setShowOptions={setShowOptionsHandler}
    >
      {airports.length > 0 && (
        <>
          {airports.map(airport => (
            <MetarRow
              key={airport}
              airport={airport}
              selected={selectedAirport === airport}
              handleMouseDown={event => handleMouseDown(event, airport)}
              onDelete={() => {
                dispatch(delMetar(airport));
                setSelectedAirport(null);
              }}
            />
          ))}
        </>
      )}
    </FloatingWindow>
  );
};
