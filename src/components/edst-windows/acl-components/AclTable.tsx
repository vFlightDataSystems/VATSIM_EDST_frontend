import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { AclRow } from "./AclRow";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { anyAssignedHdgSelector, anyAssignedSpdSelector, anyHoldingSelector } from "../../../redux/selectors";
import { aselSelector, setAsel } from "../../../redux/slices/appSlice";
import { NoSelectDiv } from "../../../styles/styles";
import { edstFontGrey, edstFontOrange, edstFontRed, edstFontYellow } from "../../../styles/colors";
import { ScrollContainer } from "../../../styles/optionMenuStyles";
import { BodyRowDiv, BodyRowHeaderDiv, InnerRow } from "../../../styles/bodyStyles";
import { AclCol1, HdgCol, HdgSpdSlashCol, PointOutCol, RadioCol, SpdCol } from "./AclStyled";
import {
  aclHiddenColumnsSelector,
  aclManualPostingSelector,
  aclSortDataSelector,
  toggleAclHideColumn,
  toolsOptionsSelector
} from "../../../redux/slices/aclSlice";
import { entriesSelector } from "../../../redux/slices/entrySlice";
import { EdstEntry } from "../../../typeDefinitions/types/edstEntry";
import { AircraftTypeCol, AltCol, CodeCol, FidCol, RouteCol, SpecialBox } from "../../../styles/sharedColumns";
import { AclRowField } from "../../../typeDefinitions/enums/acl/aclRowField";
import { VCI_SYMBOL } from "../../../utils/constants";
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
  const hiddenColumns = useRootSelector(aclHiddenColumnsSelector);
  const [altMouseDown, setAltMouseDown] = useState(false);
  const entries = useRootSelector(entriesSelector);

  const handleClickSlash = () => {
    if (hiddenColumns.includes(AclRowField.SPD) && hiddenColumns.includes(AclRowField.HDG)) {
      dispatch(toggleAclHideColumn([AclRowField.SPD, AclRowField.HDG]));
      if (asel?.field === AclRowField.SPD || asel?.field === AclRowField.HDG) {
        dispatch(setAsel(null));
      }
    } else {
      if (!hiddenColumns.includes(AclRowField.HDG)) {
        dispatch(toggleAclHideColumn(AclRowField.HDG));
        if (asel?.field === AclRowField.HDG) {
          dispatch(setAsel(null));
        }
      }
      if (!hiddenColumns.includes(AclRowField.SPD)) {
        dispatch(toggleAclHideColumn(AclRowField.SPD));
        if (asel?.field === AclRowField.SPD) {
          dispatch(setAsel(null));
        }
      }
    }
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
          <AircraftTypeCol hidden={hiddenColumns.includes(AclRowField.TYPE)}>
            <div onMouseDown={() => dispatch(toggleAclHideColumn(AclRowField.TYPE))}>T{!hiddenColumns.includes(AclRowField.TYPE) && "ype"}</div>
          </AircraftTypeCol>
          <AltCol hover headerCol onMouseDown={() => setAltMouseDown(true)} onMouseUp={() => setAltMouseDown(false)}>
            Alt.
          </AltCol>
          <CodeCol hover hidden={hiddenColumns.includes(AclRowField.CODE)} onMouseDown={() => dispatch(toggleAclHideColumn(AclRowField.CODE))}>
            C{!hiddenColumns.includes(AclRowField.CODE) && "ode"}
          </CodeCol>
          <SpecialBox disabled />
          <EdstTooltip title={Tooltips.aclHeaderHdg}>
            <HdgCol hover hidden={hiddenColumns.includes(AclRowField.HDG)} onMouseDown={() => dispatch(toggleAclHideColumn(AclRowField.HDG))}>
              {hiddenColumns.includes(AclRowField.HDG) && anyAssignedHeading && "*"}H{!hiddenColumns.includes(AclRowField.HDG) && "dg"}
            </HdgCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclHeaderSlash}>
            <HdgSpdSlashCol hover onMouseDown={handleClickSlash}>
              /
            </HdgSpdSlashCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclHeaderSpd}>
            <SpdCol hover hidden={hiddenColumns.includes(AclRowField.SPD)} onMouseDown={() => dispatch(toggleAclHideColumn(AclRowField.SPD))}>
              S{!hiddenColumns.includes(AclRowField.SPD) && "pd"}
              {hiddenColumns.includes(AclRowField.SPD) && anyAssignedSpeed && "*"}
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
          <AclRow key={entry.aircraftId} index={Number(i)} entry={entry} anyHolding={anyHolding} altMouseDown={altMouseDown} />
        ))}
        {spaEntryList.length > 0 && <BodyRowDiv separator />}
        {Object.entries(entryList?.filter((entry: EdstEntry) => !entry.spa && (entry.vciStatus > -1 || !manualPosting))?.sort(sortFunc))?.map(
          ([i, entry]: [string, EdstEntry]) => (
            <AclRow key={entry.aircraftId} index={Number(i)} entry={entry} anyHolding={anyHolding} altMouseDown={altMouseDown} />
          )
        )}
        {manualPosting && <BodyRowDiv separator />}
        {manualPosting &&
          Object.entries(entryList?.filter((entry: EdstEntry) => !entry.spa && entry.vciStatus === -1))?.map(([i, entry]: [string, EdstEntry]) => (
            <AclRow key={entry.aircraftId} index={Number(i)} entry={entry} anyHolding={anyHolding} altMouseDown={altMouseDown} />
          ))}
      </ScrollContainer>
    </AclBodyStyleDiv>
  );
}
