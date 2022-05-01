import React, {useMemo, useState} from 'react';
import {DepRow} from "./DepRow";
import {LocalEdstEntryType} from "../../../types";
import {useAppSelector} from '../../../redux/hooks';
import {depRowFieldEnum, sortOptionsEnum} from "../../../enums";
import {NoSelectDiv} from "../../../styles/styles";
import styled from "styled-components";
import {edstFontGrey} from "../../../styles/colors";
import {ScrollContainer} from "../../../styles/optionMenuStyles";
import {BodyRowDiv, BodyRowHeaderDiv} from "../../../styles/bodyStyles";
import {AircraftTypeCol, AltCol, DepCol2, FidCol, RadioCol, SpecialBox, CodeCol, RouteCol} from "./DepStyled";
import {entriesSelector} from "../../../redux/slices/entriesSlice";
import {depManualPostingSelector, depSortDataSelector} from "../../../redux/slices/depSlice";

const COMPLETED_SYMBOL = '✓';

const DepBodyStyleDiv = styled(NoSelectDiv)`
  white-space:nowrap;
  overflow: hidden;
  flex-flow: column;
  display: flex;
  color: ${edstFontGrey}
`;

export function DepTable() {
  const sortData = useAppSelector(depSortDataSelector);
  const manualPosting = useAppSelector(depManualPostingSelector);
  const entries = useAppSelector(entriesSelector);
  const [hiddenList, setHiddenList] = useState<depRowFieldEnum[]>([]);

  const toggleHideColumn = (field: depRowFieldEnum) => {
    let hiddenCopy = hiddenList.slice(0);
    const index = hiddenCopy.indexOf(field);
    if (index > -1) {
      hiddenCopy.splice(index, 1);
    } else {
      hiddenCopy.push(field);
    }
    setHiddenList(hiddenCopy);
  };

  const sortFunc = (u: LocalEdstEntryType, v: LocalEdstEntryType) => {
    switch (sortData.selectedOption) {
      case sortOptionsEnum.acid:
        return u.callsign.localeCompare(v.callsign);
      case sortOptionsEnum.destination:
        return u.dest.localeCompare(v.dest);
      case sortOptionsEnum.origin:
        return u.dep?.localeCompare(v.dep);
      default:
        return u.callsign.localeCompare(v.callsign);
    }
  };

  const entryList = useMemo(() => Object.values(entries)?.filter((entry: LocalEdstEntryType) => entry.depDisplay), [entries]);
  const spaEntryList = useMemo(() => Object.entries(entryList.filter((entry: LocalEdstEntryType) => entry.spa)), [entryList]);

  return (<DepBodyStyleDiv>
    <BodyRowHeaderDiv key="dep-table-header">
      <RadioCol header>
        {COMPLETED_SYMBOL}
      </RadioCol>
      <DepCol2>
        P Time
      </DepCol2>
      <FidCol>
        Flight ID
      </FidCol>
      <SpecialBox/>
      <SpecialBox/>
      <AircraftTypeCol hidden={hiddenList.includes(depRowFieldEnum.type)}>
        <div onMouseDown={() => toggleHideColumn(depRowFieldEnum.type)}>
          T{!hiddenList.includes(depRowFieldEnum.type) && 'ype'}
        </div>
      </AircraftTypeCol>
      <AltCol headerCol={true}>
        Alt.
      </AltCol>
      <CodeCol hover={true} hidden={hiddenList.includes(depRowFieldEnum.code)}
               onMouseDown={() => toggleHideColumn(depRowFieldEnum.code)}>
        C{!hiddenList.includes(depRowFieldEnum.code) && 'ode'}
      </CodeCol>
      <RouteCol>
        Route
      </RouteCol>
    </BodyRowHeaderDiv>
    <ScrollContainer>
      {spaEntryList?.map(([i, entry]: [string, LocalEdstEntryType]) =>
        <DepRow
          key={`dep-row-spa-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          hidden={hiddenList}
        />)}
      {spaEntryList.length > 0 && <BodyRowDiv separator={true}/>}
      {Object.entries(entryList?.filter((entry: LocalEdstEntryType) => (!entry.spa && ((entry.depStatus > -1) || !manualPosting)))
        ?.sort(sortFunc))?.map(([i, entry]: [string, LocalEdstEntryType]) =>
        <DepRow
          key={`dep-row-ack-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          hidden={hiddenList}
        />)}
      {manualPosting && <BodyRowDiv separator={true}/>}
      {manualPosting && Object.entries(entryList?.filter((entry: LocalEdstEntryType) => (!entry.spa && entry.depStatus === -1)))
        ?.map(([i, entry]: [string, LocalEdstEntryType]) =>
          <DepRow
            key={`dep-row-no-ack-${entry.cid}-${i}`}
            index={Number(i)}
            entry={entry}
            hidden={hiddenList}
          />)}
    </ScrollContainer>
  </DepBodyStyleDiv>);
}
