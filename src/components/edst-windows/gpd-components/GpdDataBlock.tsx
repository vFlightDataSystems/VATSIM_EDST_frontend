import React, {useState} from "react";
import styled from "styled-components";
import {LocalEdstEntryType} from "../../../types";
import {aclRowFieldEnum, menuEnum, windowEnum} from "../../../enums";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {gpdAircraftSelect} from "../../../redux/thunks/thunks";
import {aselSelector} from "../../../redux/slices/appSlice";
import {defaultFontFamily} from "../../../styles/styles";

type GpdDataBlockProps = {
  entry: LocalEdstEntryType,
  pos: { x: number, y: number } | null
}

const DataBlockDiv = styled.div<{pos: {x: number, y: number}, offset: {x: number, y: number}}>`
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
  // datablock offset after it has been dragged by the user
  // to be implemented
  const [offset, setOffset] = useState({x: 0, y: 0});

  const selectedField = asel?.cid === entry.cid && asel?.window === windowEnum.graphicPlanDisplay
    ? asel.field as aclRowFieldEnum : null;

  return pos && (<DataBlockDiv pos={pos} offset={offset}>
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