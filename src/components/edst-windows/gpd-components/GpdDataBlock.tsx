import React from "react";
import styled from "styled-components";
import {LocalEdstEntryType} from "../../../types";
import {aclRowFieldEnum} from "../../../enums";

type GpdDataBlockProps = {
  entry: LocalEdstEntryType,
  selectedField: aclRowFieldEnum | null
}

const DataBlockElement = styled.span`
  color: ${(props: { selected?: boolean }) => props.selected ? '#000000' : '#ADADAD'}
  background-color: ${(props: { selected?: boolean }) => props.selected ? '#ADADAD' : '#000000'}
  width: auto;
  display: inline-flex;
  border: 1px solid transparent;
  padding: 0 2px;

  :hover {
    border: 1px solid #ADADAD;
  }
`;

export const GpdDataBlock: React.FC<GpdDataBlockProps> = ({entry, selectedField}) => {
  return (<div>
    <DataBlockElement selected={selectedField === aclRowFieldEnum.fid}>
      {entry.callsign}
    </DataBlockElement><br/>
    <DataBlockElement selected={selectedField === aclRowFieldEnum.alt}>
      {entry.interim ? entry.interim + 'T' + entry.altitude : entry.altitude + 'C'}</DataBlockElement><br/>
    <DataBlockElement selected={selectedField === aclRowFieldEnum.route}>{entry.dest}</DataBlockElement>
    <DataBlockElement
      selected={selectedField === aclRowFieldEnum.fid}>{entry.flightplan.ground_speed}</DataBlockElement>
  </div>);
};