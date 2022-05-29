import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { DepRow } from "./DepRow";
import { LocalEdstEntry } from "../../../types";
import { useRootSelector } from "../../../redux/hooks";
import { depRowField, sortOptions } from "../../../enums";
import { NoSelectDiv } from "../../../styles/styles";
import { edstFontGrey } from "../../../styles/colors";
import { ScrollContainer } from "../../../styles/optionMenuStyles";
import { BodyRowDiv, BodyRowHeaderDiv } from "../../../styles/bodyStyles";
import { AircraftTypeCol, AltCol, DepCol2, FidCol, RadioCol, SpecialBox, CodeCol, RouteCol } from "./DepStyled";
import { entriesSelector } from "../../../redux/slices/entriesSlice";
import { depManualPostingSelector, depSortDataSelector } from "../../../redux/slices/depSlice";

const COMPLETED_SYMBOL = "✓";

const DepBodyStyleDiv = styled(NoSelectDiv)`
  white-space: nowrap;
  overflow: hidden;
  flex-flow: column;
  display: flex;
  color: ${edstFontGrey};
`;

export function DepTable() {
  const sortData = useRootSelector(depSortDataSelector);
  const manualPosting = useRootSelector(depManualPostingSelector);
  const entries = useRootSelector(entriesSelector);
  const [hiddenList, setHiddenList] = useState<depRowField[]>([]);

  const toggleHideColumn = (field: depRowField) => {
    const hiddenCopy = hiddenList.slice(0);
    const index = hiddenCopy.indexOf(field);
    if (index > -1) {
      hiddenCopy.splice(index, 1);
    } else {
      hiddenCopy.push(field);
    }
    setHiddenList(hiddenCopy);
  };

  const sortFunc = (u: LocalEdstEntry, v: LocalEdstEntry) => {
    switch (sortData.selectedOption) {
      case sortOptions.acid:
        return u.callsign.localeCompare(v.callsign);
      case sortOptions.destination:
        return u.dest.localeCompare(v.dest);
      case sortOptions.origin:
        return u.dep?.localeCompare(v.dep);
      default:
        return u.callsign.localeCompare(v.callsign);
    }
  };

  const entryList = useMemo(() => Object.values(entries)?.filter((entry: LocalEdstEntry) => entry.depDisplay), [entries]);
  const spaEntryList = useMemo(() => Object.entries(entryList.filter((entry: LocalEdstEntry) => entry.spa)), [entryList]);

  return (
    <DepBodyStyleDiv>
      <BodyRowHeaderDiv key="dep-table-header">
        <RadioCol header>{COMPLETED_SYMBOL}</RadioCol>
        <DepCol2>P Time</DepCol2>
        <FidCol>Flight ID</FidCol>
        <SpecialBox />
        <SpecialBox />
        <AircraftTypeCol hidden={hiddenList.includes(depRowField.type)}>
          <div onMouseDown={() => toggleHideColumn(depRowField.type)}>T{!hiddenList.includes(depRowField.type) && "ype"}</div>
        </AircraftTypeCol>
        <AltCol headerCol>Alt.</AltCol>
        <CodeCol hover hidden={hiddenList.includes(depRowField.code)} onMouseDown={() => toggleHideColumn(depRowField.code)}>
          C{!hiddenList.includes(depRowField.code) && "ode"}
        </CodeCol>
        <RouteCol>Route</RouteCol>
      </BodyRowHeaderDiv>
      <ScrollContainer>
        {spaEntryList?.map(([i, entry]: [string, LocalEdstEntry]) => (
          <DepRow key={`dep-row-spa-${entry.cid}-${i}`} index={Number(i)} entry={entry} hidden={hiddenList} />
        ))}
        {spaEntryList.length > 0 && <BodyRowDiv separator />}
        {Object.entries(entryList?.filter((entry: LocalEdstEntry) => !entry.spa && (entry.depStatus > -1 || !manualPosting))?.sort(sortFunc))?.map(
          ([i, entry]: [string, LocalEdstEntry]) => (
            <DepRow key={`dep-row-ack-${entry.cid}-${i}`} index={Number(i)} entry={entry} hidden={hiddenList} />
          )
        )}
        {manualPosting && <BodyRowDiv separator />}
        {manualPosting &&
          Object.entries(
            entryList?.filter((entry: LocalEdstEntry) => !entry.spa && entry.depStatus === -1)
          )?.map(([i, entry]: [string, LocalEdstEntry]) => (
            <DepRow key={`dep-row-no-ack-${entry.cid}-${i}`} index={Number(i)} entry={entry} hidden={hiddenList} />
          ))}
      </ScrollContainer>
    </DepBodyStyleDiv>
  );
}
