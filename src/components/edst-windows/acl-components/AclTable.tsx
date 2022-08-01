import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { AclRow } from "./AclRow";
import VCI from "../../../resources/images/VCI_v4.png";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { anyAssignedHdgSelector, anyAssignedSpdSelector, anyHoldingSelector } from "../../../redux/selectors";
import { aselSelector, closeWindow, setAsel } from "../../../redux/slices/appSlice";
import { NoSelectDiv } from "../../../styles/styles";
import { edstFontGrey, edstFontOrange, edstFontRed, edstFontYellow } from "../../../styles/colors";
import { ScrollContainer } from "../../../styles/optionMenuStyles";
import { BodyRowDiv, BodyRowHeaderDiv, InnerRow } from "../../../styles/bodyStyles";
import { AclCol1, HdgCol, HdgSpdSlashCol, PointOutCol, RadioCol, SpdCol } from "./AclStyled";
import { aclManualPostingSelector, aclSortDataSelector } from "../../../redux/slices/aclSlice";
import { entriesSelector } from "../../../redux/slices/entrySlice";
import { EdstEntry } from "../../../types/edstEntry";
import { AircraftTypeCol, AltCol, CodeCol, FidCol, RouteCol, SpecialBox } from "../../../styles/sharedColumns";
import { EdstWindow } from "../../../enums/edstWindow";
import { AclRowField } from "../../../enums/acl/aclRowField";
import { SortOptions } from "../../../enums/sortOptions";

const AclBodyStyleDiv = styled(NoSelectDiv)`
  white-space: nowrap;
  overflow: hidden;
  flex-flow: column;
  display: flex;
  color: ${edstFontGrey};

  img {
    width: 8px;
    object-fit: contain;
  }

  .wifi-symbol {
    background-image: url(${VCI});
  }
`;

export function AclTable() {
  const sortData = useRootSelector(aclSortDataSelector);
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const dispatch = useRootDispatch();

  const asel = useRootSelector(aselSelector);
  const anyHolding = useRootSelector(anyHoldingSelector);
  const anyAssignedHeading = useRootSelector(anyAssignedHdgSelector);
  const anyAssignedSpeed = useRootSelector(anyAssignedSpdSelector);
  const [hiddenList, setHiddenList] = useState<AclRowField[]>([]);
  const [altMouseDown, setAltMouseDown] = useState(false);
  const entries = useRootSelector(entriesSelector);

  const toggleHideColumn = (field: AclRowField) => {
    const hiddenCopy = hiddenList.slice(0);
    const index = hiddenCopy.indexOf(field);
    if (index > -1) {
      hiddenCopy.splice(index, 1);
    } else {
      hiddenCopy.push(field);
      if (asel?.field === field) {
        dispatch(setAsel(null));
      }
    }
    setHiddenList(hiddenCopy);
  };

  const handleClickSlash = () => {
    const hiddenCopy = hiddenList.slice(0);
    if (hiddenCopy.includes(AclRowField.SPD) && hiddenCopy.includes(AclRowField.HDG)) {
      hiddenCopy.splice(hiddenCopy.indexOf(AclRowField.SPD), 1);
      hiddenCopy.splice(hiddenCopy.indexOf(AclRowField.HDG), 1);
      if ((asel?.field as AclRowField) === AclRowField.SPD) {
        dispatch(closeWindow(EdstWindow.SORT_MENU));
        dispatch(setAsel(null));
      }
      if ((asel?.field as AclRowField) === AclRowField.HDG) {
        dispatch(closeWindow(EdstWindow.HEADING_MENU));
        dispatch(setAsel(null));
      }
    } else {
      if (!hiddenCopy.includes(AclRowField.HDG)) {
        hiddenCopy.push(AclRowField.HDG);
        if ((asel?.field as AclRowField) === AclRowField.HDG) {
          dispatch(closeWindow(EdstWindow.HEADING_MENU));
          dispatch(setAsel(null));
        }
      }
      if (!hiddenCopy.includes(AclRowField.SPD)) {
        if ((asel?.field as AclRowField) === AclRowField.SPD) {
          dispatch(closeWindow(EdstWindow.SPEED_MENU));
          dispatch(setAsel(null));
        }
        hiddenCopy.push(AclRowField.SPD);
      }
    }
    setHiddenList(hiddenCopy);
  };

  const sortFunc = (u: EdstEntry, v: EdstEntry) => {
    switch (sortData.selectedOption) {
      case SortOptions.ACID:
        return u.aircraftId.localeCompare(v.aircraftId);
      case SortOptions.DESTINATION:
        return u.destination.localeCompare(v.destination);
      case SortOptions.ORIGIN:
        return u.departure.localeCompare(v.departure);
      case SortOptions.BOUNDARY_TIME:
        return u.boundaryTime - v.boundaryTime;
      default:
        return u.aircraftId.localeCompare(v.aircraftId);
    }
  };
  const entryList = useMemo(() => Object.values(entries)?.filter((entry: EdstEntry) => entry.aclDisplay), [entries]);
  const spaEntryList = useMemo(() => Object.entries(entryList.filter((entry: EdstEntry) => entry.spa)), [entryList]);

  return (
    <AclBodyStyleDiv>
      <BodyRowHeaderDiv key="acl-table-header">
        <RadioCol header>
          <img src={VCI} alt="wifi-symbol" />
        </RadioCol>
        <AclCol1 color={edstFontRed}>R</AclCol1>
        <AclCol1 color={edstFontYellow}>Y</AclCol1>
        <AclCol1 color={edstFontOrange}>A</AclCol1>
        <InnerRow>
          <SpecialBox disabled />
          <SpecialBox disabled />
          <FidCol>Flight ID</FidCol>
          <EdstTooltip title={Tooltips.aclHeaderPa}>
            <PointOutCol>PA</PointOutCol>
          </EdstTooltip>
          <SpecialBox disabled />
          <SpecialBox disabled />
          <AircraftTypeCol hidden={hiddenList.includes(AclRowField.TYPE)}>
            <div onMouseDown={() => toggleHideColumn(AclRowField.TYPE)}>T{!hiddenList.includes(AclRowField.TYPE) && "ype"}</div>
          </AircraftTypeCol>
          <AltCol hover headerCol onMouseDown={() => setAltMouseDown(true)} onMouseUp={() => setAltMouseDown(false)}>
            Alt.
          </AltCol>
          <CodeCol hover hidden={hiddenList.includes(AclRowField.CODE)} onMouseDown={() => toggleHideColumn(AclRowField.CODE)}>
            C{!hiddenList.includes(AclRowField.CODE) && "ode"}
          </CodeCol>
          <SpecialBox disabled />
          <EdstTooltip title={Tooltips.aclHeaderHdg}>
            <HdgCol hover hidden={hiddenList.includes(AclRowField.HDG)} onMouseDown={() => toggleHideColumn(AclRowField.HDG)}>
              {hiddenList.includes(AclRowField.HDG) && anyAssignedHeading && "*"}H{!hiddenList.includes(AclRowField.HDG) && "dg"}
            </HdgCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclHeaderSlash}>
            <HdgSpdSlashCol hover onMouseDown={handleClickSlash}>
              /
            </HdgSpdSlashCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclHeaderSpd}>
            <SpdCol hover hidden={hiddenList.includes(AclRowField.SPD)} onMouseDown={() => toggleHideColumn(AclRowField.SPD)}>
              S{!hiddenList.includes(AclRowField.SPD) && "pd"}
              {hiddenList.includes(AclRowField.SPD) && anyAssignedSpeed && "*"}
            </SpdCol>
          </EdstTooltip>
          <SpecialBox disabled />
          <SpecialBox disabled />
          <SpecialBox disabled={!anyHolding}>H</SpecialBox>
          <SpecialBox disabled />
          <SpecialBox disabled />
          <SpecialBox disabled />
          <SpecialBox disabled />
          <RouteCol>Route</RouteCol>
        </InnerRow>
      </BodyRowHeaderDiv>
      <ScrollContainer>
        {spaEntryList?.map(([i, entry]: [string, EdstEntry]) => (
          <AclRow
            key={`acl-table-row-spa-${entry.aircraftId}-${i}`}
            index={Number(i)}
            entry={entry}
            anyHolding={anyHolding}
            hidden={hiddenList}
            altMouseDown={altMouseDown}
          />
        ))}
        {spaEntryList.length > 0 && <BodyRowDiv separator />}
        {Object.entries(entryList?.filter((entry: EdstEntry) => !entry.spa && (entry.vciStatus > -1 || !manualPosting))?.sort(sortFunc))?.map(
          ([i, entry]: [string, EdstEntry]) => (
            <AclRow
              key={`acl-table-row-ack-${entry.aircraftId}-${i}`}
              index={Number(i)}
              entry={entry}
              anyHolding={anyHolding}
              hidden={hiddenList}
              altMouseDown={altMouseDown}
            />
          )
        )}
        {manualPosting && <BodyRowDiv separator />}
        {manualPosting &&
          Object.entries(entryList?.filter((entry: EdstEntry) => !entry.spa && entry.vciStatus === -1))?.map(([i, entry]: [string, EdstEntry]) => (
            <AclRow
              key={`acl-table-row-no-ack-${entry.aircraftId}-${i}`}
              index={Number(i)}
              entry={entry}
              anyHolding={anyHolding}
              hidden={hiddenList}
              altMouseDown={altMouseDown}
            />
          ))}
      </ScrollContainer>
    </AclBodyStyleDiv>
  );
}
