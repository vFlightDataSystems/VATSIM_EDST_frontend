import React, { useMemo } from "react";
import styled from "styled-components";
import { DepRow } from "./DepRow";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { NoSelectDiv } from "../../../styles/NoSelectDiv";
import { ScrollContainer } from "../../../styles/optionMenuStyles";
import { BodyRowDiv, BodyRowHeaderDiv, RowSeparator } from "../../../styles/styles";
import { DepCol2, DepFidCol, RadioCol } from "./DepStyled";
import { entriesSelector } from "../../../redux/slices/entrySlice";
import { depHiddenColumnsSelector, depManualPostingSelector, depSortOptionSelector, toggleDepHideColumn } from "../../../redux/slices/depSlice";
import { EdstEntry } from "../../../typeDefinitions/types/edstEntry";
import { AircraftTypeCol, AltCol, CodeCol, RouteCol, SpecialBox } from "../../../styles/sharedColumns";
import { DepRowField } from "../../../typeDefinitions/enums/dep/depRowField";
import { COMPLETED_CHECKMARK_SYMBOL } from "../../../utils/constants";
import { DepSortOption } from "../../../typeDefinitions/enums/dep/depSortOption";

const DepBodyStyleDiv = styled(NoSelectDiv)`
  white-space: nowrap;
  overflow: hidden;
  flex-flow: column;
  display: flex;
  color: ${props => props.theme.colors.grey};
`;

const sortFunc = (selectedSortOption: DepSortOption) => (u: EdstEntry, v: EdstEntry) => {
  switch (selectedSortOption) {
    case DepSortOption.ACID:
      return u.aircraftId.localeCompare(v.aircraftId);
    case DepSortOption.DESTINATION:
      return u.destination.localeCompare(v.destination);
    case DepSortOption.ORIGIN:
      return u.departure?.localeCompare(v.departure);
    default:
      return u.aircraftId.localeCompare(v.aircraftId);
  }
};

export const DepTable = () => {
  const dispatch = useRootDispatch();
  const selectedSortOption = useRootSelector(depSortOptionSelector);
  const manualPosting = useRootSelector(depManualPostingSelector);
  const entries = useRootSelector(entriesSelector);
  const hiddenColumns = useRootSelector(depHiddenColumnsSelector);

  const entryList = useMemo(() => Object.values(entries).filter(entry => entry.status === "Proposed" && !entry.deleted), [entries]);
  const spaEntryList = useMemo(() => entryList.filter(entry => entry.spa), [entryList]);
  const ackListSorted = useMemo(
    () => entryList.filter(entry => !entry.spa && (entry.depStatus > -1 || !manualPosting)).sort(sortFunc(selectedSortOption)),
    [entryList, selectedSortOption, manualPosting]
  );
  const unAckList = useMemo(() => entryList.filter(entry => !entry.spa && entry.depStatus === -1), [entryList]);

  return (
    <DepBodyStyleDiv>
      <BodyRowHeaderDiv>
        <RadioCol header>{COMPLETED_CHECKMARK_SYMBOL}</RadioCol>
        <DepCol2>P-Time</DepCol2>
        <DepFidCol>Flight ID</DepFidCol>
        <SpecialBox disabled />
        <SpecialBox disabled />
        <AircraftTypeCol hover hidden={hiddenColumns.includes(DepRowField.TYPE)} onMouseDown={() => dispatch(toggleDepHideColumn(DepRowField.TYPE))}>
          T{!hiddenColumns.includes(DepRowField.TYPE) && "ype"}
        </AircraftTypeCol>
        <AltCol headerCol>Alt.</AltCol>
        <CodeCol hover hidden={hiddenColumns.includes(DepRowField.CODE)} onMouseDown={() => dispatch(toggleDepHideColumn(DepRowField.CODE))}>
          C{!hiddenColumns.includes(DepRowField.CODE) && "ode"}
        </CodeCol>
        <RouteCol>Route</RouteCol>
      </BodyRowHeaderDiv>
      <ScrollContainer>
        {spaEntryList.map((entry, i) => (
          <>
            <DepRow key={entry.aircraftId} entry={entry} />
            {i % 3 === 2 && <RowSeparator />}
          </>
        ))}
        {spaEntryList.length > 0 && <BodyRowDiv separator />}
        {ackListSorted.map((entry, i) => (
          <>
            <DepRow key={entry.aircraftId} entry={entry} />
            {i % 3 === 2 && <RowSeparator />}
          </>
        ))}
        {manualPosting && <BodyRowDiv separator />}
        {manualPosting &&
          unAckList.map((entry, i) => (
            <>
              <DepRow key={entry.aircraftId} entry={entry} />
              {i % 3 === 2 && <RowSeparator />}
            </>
          ))}
      </ScrollContainer>
    </DepBodyStyleDiv>
  );
};
