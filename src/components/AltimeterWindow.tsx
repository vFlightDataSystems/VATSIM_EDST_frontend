import React, { useCallback, useMemo, useRef, useState } from "react";
import type { Nullable } from "types/utility-types";
import { zStackSelector } from "~redux/slices/appSlice";
import { useAltimeter } from "api/weatherApi";
import { airportIdSelector, altimeterAirportsSelector, delAltimeter } from "~redux/slices/weatherSlice";
import { mod } from "~/utils/mod";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { windowOptionsSelector } from "~redux/slices/windowOptionsSlice";
import { FloatingWindow } from "components/utils/FloatingWindow";
import { FloatingWindowOptionContainer } from "components/utils/FloatingWindowOptionContainer";
import { getUtcMinutesAfterMidnight } from "~/utils/getUtcMinutesAfterMidnight";
import clsx from "clsx";
import floatingStyles from "css/floatingWindow.module.scss";

type AltimeterRowProps = {
  airport: string;
  selected: boolean;
  onDelete: () => void;
  handleMouseDown: React.MouseEventHandler<HTMLDivElement>;
};

const AltimeterRow = ({ airport, selected, handleMouseDown, onDelete }: AltimeterRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);
  const { data: airportAltimeterEntry } = useAltimeter(airport);
  const windowOptions = useRootSelector(windowOptionsSelector("ALTIMETER"));
  const [showOptions, setShowOptions] = useState(false);
  const airportId = useRootSelector((state) => airportIdSelector(state, airport));

  const utcMinutes = getUtcMinutesAfterMidnight();
  const observationTime = airportAltimeterEntry
    ? Number(airportAltimeterEntry.time.slice(0, 2)) * 60 + Number(airportAltimeterEntry.time.slice(2))
    : null;

  const zIndex = zStack.indexOf("ALTIMETER");
  const rect = ref.current?.getBoundingClientRect();

  const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleMouseDown(event);
    setShowOptions(true);
  };

  return (
    <>
      <div
        className={clsx(floatingStyles.altimRow, { selected })}
        ref={ref}
        style={{ "--brightness": windowOptions.brightness / 100 }}
        onMouseDown={onMouseDown}
      >
        {airportId && (
          <>
            <span className={floatingStyles.reportingStation}>{airportId}</span>
            <span
              className={clsx("altimTime", { [floatingStyles.underline]: observationTime ? mod(utcMinutes - observationTime, 1440) > 60 : false })}
            >
              {airportAltimeterEntry?.time ?? ""}
            </span>
            {!airportAltimeterEntry || (observationTime && mod(utcMinutes - observationTime, 1440) > 120) ? (
              "-M-"
            ) : (
              <span className={clsx({ [floatingStyles.underline]: Number(airportAltimeterEntry.altimeter) < 2992 })}>
                {airportAltimeterEntry.altimeter.slice(1)}
              </span>
            )}
          </>
        )}
      </div>
      {selected && showOptions && rect && (
        <FloatingWindowOptionContainer
          parentWidth={rect.width}
          zIndex={zIndex}
          parentPos={rect}
          onClose={() => setShowOptions(false)}
          options={{
            delete: {
              value: `DELETE ${airport}`,
              backgroundColor: "#575757",
              onMouseDown: onDelete,
            },
          }}
        />
      )}
    </>
  );
};

export const AltimeterWindow = () => {
  const dispatch = useRootDispatch();

  const [showOptions, setShowOptions] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Nullable<string>>(null);
  const airports = useRootSelector(altimeterAirportsSelector);
  const extraOptions = useMemo(
    () => ({
      template: { value: "TEMPLATE", backgroundColor: "#000000" },
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
      title="ALTIM SET"
      optionsHeaderTitle="AS"
      width="24ch"
      window="ALTIMETER"
      extraOptions={extraOptions}
      showOptions={showOptions}
      setShowOptions={setShowOptionsHandler}
    >
      {airports.length > 0 && (
        <>
          {airports.map((airport) => (
            <AltimeterRow
              key={airport}
              airport={airport}
              selected={selectedAirport === airport}
              handleMouseDown={(event) => handleMouseDown(event, airport)}
              onDelete={() => {
                dispatch(delAltimeter(airport));
                setSelectedAirport(null);
              }}
            />
          ))}
        </>
      )}
    </FloatingWindow>
  );
};
