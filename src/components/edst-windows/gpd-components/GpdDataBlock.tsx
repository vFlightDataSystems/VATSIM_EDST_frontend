import React from "react";
import styled from "styled-components";
import {LocalEdstEntryType} from "../../../types";
import {aclRowFieldEnum, menuEnum, windowEnum} from "../../../enums";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {gpdAircraftSelect} from "../../../redux/thunks/thunks";
import {aselSelector} from "../../../redux/slices/appSlice";

type GpdDataBlockProps = {
  entry: LocalEdstEntryType,
  pos: { x: number, y: number } | null
}

const DataBlockDiv = styled.div`
  z-index: 999;
  width: auto;
  position: absolute;
  font-family: EDST;
  font-size: 16px;
  line-height: 16px;
  color: #ADADAD;
`;

const DataBlockElement = styled.span<{ selected?: boolean }>`
  color: ${(props) => props.selected ? '#000000' : '#ADADAD'};
  background-color: ${(props) => props.selected ? '#ADADAD' : '#000000'};
  width: auto;
  display: inline-flex;
  border: 1px solid transparent;
  margin: 0 1px;
  padding: 0 1px;

  :hover {
    border: 1px solid #ADADAD;
  }
`;

export const GpdDataBlock: React.FC<GpdDataBlockProps> = ({entry, pos}) => {
  const dispatch = useAppDispatch();
  const asel = useAppSelector(aselSelector);
  const selectedField = asel?.cid === entry.cid && asel?.window === windowEnum.graphicPlanDisplay
    ? asel.field as aclRowFieldEnum : null;
  return pos && (<DataBlockDiv style={{left: pos.x + 34, top: pos.y - 40}}>
    <DataBlockElement
      selected={selectedField === aclRowFieldEnum.fid}
      onMouseDown={(event) => dispatch(gpdAircraftSelect(event, entry.cid, aclRowFieldEnum.fid))}
    >
      {entry.callsign}
    </DataBlockElement><br/>
    <DataBlockElement
      selected={selectedField === aclRowFieldEnum.alt}
      onMouseDown={(event) => dispatch(gpdAircraftSelect(event, entry.cid, aclRowFieldEnum.alt, null, menuEnum.altitudeMenu))}
    >
      {entry.interim ? entry.interim + 'T' + entry.altitude : entry.altitude + 'C'}</DataBlockElement><br/>
    <DataBlockElement
      selected={selectedField === aclRowFieldEnum.route}
      onMouseDown={(event) => dispatch(gpdAircraftSelect(event, entry.cid, aclRowFieldEnum.route, null, menuEnum.routeMenu))}
    >
      {entry.dest}
    </DataBlockElement>
    <DataBlockElement
      selected={selectedField === aclRowFieldEnum.spd}
      onMouseDown={(event) => dispatch(gpdAircraftSelect(event, entry.cid, aclRowFieldEnum.spd))}
    >
      {entry.flightplan.ground_speed}
    </DataBlockElement>
  </DataBlockDiv>);
};