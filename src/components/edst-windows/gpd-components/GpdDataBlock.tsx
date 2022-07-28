import React, { useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { aselSelector } from "../../../redux/slices/appSlice";
import { defaultFontFamily } from "../../../styles/styles";
import { formatAltitude } from "../../../lib";
import { EdstWindow, AclRowField } from "../../../namespaces";
import { WindowPosition } from "../../../types/windowPosition";
import { EdstEntry } from "../../../types/edstEntry";
import { gpdAircraftSelect } from "../../../redux/thunks/aircraftSelect";

type GpdDataBlockProps = {
  entry: EdstEntry;
  pos: { x: number; y: number } | null;
  toggleShowRoute(): void;
};

const DataBlockDiv = styled.div<{ pos: WindowPosition; offset: { x: number; y: number } }>`
  z-index: 999;
  ${props => ({
    left: props.pos.x + props.offset.x + 24,
    top: props.pos.y + props.offset.y - 30
  })}
  width: auto;
  position: absolute;
  font-family: ${defaultFontFamily};
  font-size: 16px;
  line-height: 16px;
  color: #adadad;
`;

const DataBlockElement = styled.span<{ selected?: boolean }>`
  color: ${props => (props.selected ? "#000000" : "#ADADAD")};
  background-color: ${props => (props.selected ? "#ADADAD" : "#000000")};
  width: auto;
  display: inline-flex;
  border: 1px solid transparent;
  margin: 0 1px;
  padding: 0 1px;

  :hover {
    border: 1px solid #adadad;
  }
`;

export const GpdDataBlock: React.FC<GpdDataBlockProps> = ({ entry, pos, toggleShowRoute }) => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector);
  // datablock offset after it has been dragged by the user
  // to be implemented
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const selectedField = asel?.aircraftId === entry.aircraftId && asel?.window === EdstWindow.GPD ? (asel.field as AclRowField) : null;

  const onCallsignMouseDown = (event: React.MouseEvent) => {
    switch (event.button) {
      case 0:
        dispatch(gpdAircraftSelect(event, entry.aircraftId, AclRowField.FID));
        break;
      case 1:
        toggleShowRoute();
        break;
      default:
        break;
    }
  };

  return (
    pos && (
      <DataBlockDiv pos={pos} offset={offset}>
        <DataBlockElement selected={selectedField === AclRowField.FID} onMouseDown={onCallsignMouseDown}>
          {entry.aircraftId}
        </DataBlockElement>
        <br />
        <DataBlockElement
          selected={selectedField === AclRowField.ALT}
          onMouseDown={event => dispatch(gpdAircraftSelect(event, entry.aircraftId, AclRowField.ALT, null, EdstWindow.ALTITUDE_MENU))}
        >
          {entry.interimAltitude ? `${entry.interimAltitude}T${formatAltitude(entry.altitude)}` : `${formatAltitude(entry.altitude)}C`}
        </DataBlockElement>
        <br />
        <DataBlockElement
          selected={selectedField === AclRowField.ROUTE}
          onMouseDown={event => dispatch(gpdAircraftSelect(event, entry.aircraftId, AclRowField.ROUTE, null, EdstWindow.ROUTE_MENU))}
        >
          {entry.destination}
        </DataBlockElement>
        <DataBlockElement
          selected={selectedField === AclRowField.SPD}
          onMouseDown={event => dispatch(gpdAircraftSelect(event, entry.aircraftId, AclRowField.SPD))}
        >
          {entry.speed}
        </DataBlockElement>
      </DataBlockDiv>
    )
  );
};
