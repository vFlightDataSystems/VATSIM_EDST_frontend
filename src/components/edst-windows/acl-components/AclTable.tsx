import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { AclRow } from "./AclRow";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { anyAssignedHdgSelector, anyAssignedSpdSelector, anyHoldingSelector } from "../../../redux/selectors";
import { aselSelector, closeWindow, setAsel } from "../../../redux/slices/appSlice";
import { NoSelectDiv } from "../../../styles/styles";
import { edstFontGrey, edstFontOrange, edstFontRed, edstFontYellow } from "../../../styles/colors";
import { ScrollContainer } from "../../../styles/optionMenuStyles";
import { BodyRowDiv, BodyRowHeaderDiv, InnerRow } from "../../../styles/bodyStyles";
import { AclCol1, HdgCol, HdgSpdSlashCol, PointOutCol, RadioCol, SpdCol } from "./AclStyled";
import { aclManualPostingSelector, aclSortDataSelector, toolsOptionsSelector } from "../../../redux/slices/aclSlice";
import { entriesSelector } from "../../../redux/slices/entrySlice";
import { EdstEntry } from "../../../typeDefinitions/types/edstEntry";
import { AircraftTypeCol, AltCol, CodeCol, FidCol, RouteCol, SpecialBox } from "../../../styles/sharedColumns";
import { EdstWindow } from "../../../typeDefinitions/enums/edstWindow";
import { AclRowField } from "../../../typeDefinitions/enums/acl/aclRowField";
import { VCI_SYMBOL } from "../../../constants";
import { AclSortOption } from "../../../typeDefinitions/enums/acl/aclSortOption";

const AclBodyStyleDiv = styled(NoSelectDiv)`
  white-space: nowrap;
  overflow: hidden;
  flex-flow: column;
  display: flex;
  color: ${edstFontGrey};
`;

export function AclTable() {
  const sortData = useRootSelector(aclSortDataSelector);
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const toolOptions = useRootSelector(toolsOptionsSelector);
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
      if (asel?.field === AclRowField.SPD) {
        dispatch(closeWindow(EdstWindow.ACL_SORT_MENU));
        dispatch(setAsel(null));
      }
      if (asel?.field === AclRowField.HDG) {
        dispatch(closeWindow(EdstWindow.HEADING_MENU));
        dispatch(setAsel(null));
      }
    } else {
      if (!hiddenCopy.includes(AclRowField.HDG)) {
        hiddenCopy.push(AclRowField.HDG);
        if (asel?.field === AclRowField.HDG) {
          dispatch(closeWindow(EdstWindow.HEADING_MENU));
          dispatch(setAsel(null));
        }
      }
      if (!hiddenCopy.includes(AclRowField.SPD)) {
        if (asel?.field === AclRowField.SPD) {
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
      case AclSortOption.ACID:
        return u.aircraftId.localeCompare(v.aircraftId);
      case AclSortOption.DESTINATION:
        return u.destination.localeCompare(v.destination);
      case AclSortOption.BOUNDARY_TIME:
        return u.boundaryTime - v.boundaryTime;
      default:
        return u.aircraftId.localeCompare(v.aircraftId);
    }
  };
  const entryList = useMemo(() => Object.values(entries)?.filter((entry: EdstEntry) => entry.aclDisplay), [entries]);
  const spaEntryList = useMemo(() => Object.entries(entryList.filter((entry: EdstEntry) => entry.spa)), [entryList]);

  return (
    <AclBodyStyleDiv>
      <BodyRowHeaderDiv>
        <RadioCol header green>
          {VCI_SYMBOL}
        </RadioCol>
        <AclCol1 color={edstFontRed}>R</AclCol1>
        <AclCol1 color={edstFontYellow}>Y</AclCol1>
        <AclCol1 color={edstFontOrange}>A</AclCol1>
        <InnerRow>
          <SpecialBox disabled />
          <FidCol>Flight ID</FidCol>
          <EdstTooltip title={Tooltips.aclHeaderPa}>
            <PointOutCol>PA</PointOutCol>
          </EdstTooltip>
          {toolOptions.displayCoordinationColumn && <SpecialBox disabled />}
          {/* spa indicator column */}
          <SpecialBox disabled />
          {/* hotbox column */}
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
          {anyHolding && <SpecialBox disabled>H</SpecialBox>}
          {/* toggle remarks column */}
          <SpecialBox disabled />
          <RouteCol padding="0 4px">Route</RouteCol>
        </InnerRow>
      </BodyRowHeaderDiv>
      <ScrollContainer>
        {spaEntryList?.map(([i, entry]: [string, EdstEntry]) => (
          <AclRow key={entry.aircraftId} index={Number(i)} entry={entry} anyHolding={anyHolding} hidden={hiddenList} altMouseDown={altMouseDown} />
        ))}
        {spaEntryList.length > 0 && <BodyRowDiv separator />}
        {Object.entries(entryList?.filter((entry: EdstEntry) => !entry.spa && (entry.vciStatus > -1 || !manualPosting))?.sort(sortFunc))?.map(
          ([i, entry]: [string, EdstEntry]) => (
            <AclRow key={entry.aircraftId} index={Number(i)} entry={entry} anyHolding={anyHolding} hidden={hiddenList} altMouseDown={altMouseDown} />
          )
        )}
        {manualPosting && <BodyRowDiv separator />}
        {manualPosting &&
          Object.entries(entryList?.filter((entry: EdstEntry) => !entry.spa && entry.vciStatus === -1))?.map(([i, entry]: [string, EdstEntry]) => (
            <AclRow key={entry.aircraftId} index={Number(i)} entry={entry} anyHolding={anyHolding} hidden={hiddenList} altMouseDown={altMouseDown} />
          ))}
      </ScrollContainer>
    </AclBodyStyleDiv>
  );
}
