import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { AclRow } from "./AclRow";
import VCI from "../../../resources/images/VCI_v4.png";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { LocalEdstEntry } from "../../../types";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { anyAssignedHdgSelector, anyAssignedSpdSelector, anyHoldingSelector } from "../../../redux/selectors";
import { AclRowField, EdstMenu, SortOptions } from "../../../enums";
import { aselSelector, closeMenu, setAsel } from "../../../redux/slices/appSlice";
import { NoSelectDiv } from "../../../styles/styles";
import { edstFontGrey, edstFontOrange, edstFontRed, edstFontYellow } from "../../../styles/colors";
import { ScrollContainer } from "../../../styles/optionMenuStyles";
import { BodyRowDiv, BodyRowHeaderDiv, InnerRow } from "../../../styles/bodyStyles";
import {
  AclCol1,
  AircraftTypeCol,
  AltCol,
  CodeCol,
  FidCol,
  HdgCol,
  HdgSpdSlashCol,
  PointOutCol,
  RadioCol,
  RouteCol,
  SpdCol,
  SpecialBox
} from "./AclStyled";
import { aclManualPostingSelector, aclSortDataSelector } from "../../../redux/slices/aclSlice";
import { entriesSelector } from "../../../redux/slices/entriesSlice";

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
    if (hiddenCopy.includes(AclRowField.spd) && hiddenCopy.includes(AclRowField.hdg)) {
      hiddenCopy.splice(hiddenCopy.indexOf(AclRowField.spd), 1);
      hiddenCopy.splice(hiddenCopy.indexOf(AclRowField.hdg), 1);
      if ((asel?.field as AclRowField) === AclRowField.spd) {
        dispatch(closeMenu(EdstMenu.speedMenu));
        dispatch(setAsel(null));
      }
      if ((asel?.field as AclRowField) === AclRowField.hdg) {
        dispatch(closeMenu(EdstMenu.headingMenu));
        dispatch(setAsel(null));
      }
    } else {
      if (!hiddenCopy.includes(AclRowField.hdg)) {
        hiddenCopy.push(AclRowField.hdg);
        if ((asel?.field as AclRowField) === AclRowField.hdg) {
          dispatch(closeMenu(EdstMenu.headingMenu));
          dispatch(setAsel(null));
        }
      }
      if (!hiddenCopy.includes(AclRowField.spd)) {
        if ((asel?.field as AclRowField) === AclRowField.spd) {
          dispatch(closeMenu(EdstMenu.speedMenu));
          dispatch(setAsel(null));
        }
        hiddenCopy.push(AclRowField.spd);
      }
    }
    setHiddenList(hiddenCopy);
  };

  const sortFunc = (u: LocalEdstEntry, v: LocalEdstEntry) => {
    switch (sortData.selectedOption) {
      case SortOptions.acid:
        return u.callsign.localeCompare(v.callsign);
      case SortOptions.destination:
        return u.dest.localeCompare(v.dest);
      case SortOptions.origin:
        return u.dep.localeCompare(v.dep);
      case SortOptions.boundaryTime:
        return u.boundaryTime - v.boundaryTime;
      default:
        return u.callsign.localeCompare(v.callsign);
    }
  };

  const entryList = useMemo(() => Object.values(entries)?.filter((entry: LocalEdstEntry) => entry.aclDisplay), [entries]);
  const spaEntryList = useMemo(() => Object.entries(entryList.filter((entry: LocalEdstEntry) => entry.spa)), [entryList]);

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
          <AircraftTypeCol hidden={hiddenList.includes(AclRowField.type)}>
            <div onMouseDown={() => toggleHideColumn(AclRowField.type)}>T{!hiddenList.includes(AclRowField.type) && "ype"}</div>
          </AircraftTypeCol>
          <AltCol hover headerCol onMouseDown={() => setAltMouseDown(true)} onMouseUp={() => setAltMouseDown(false)}>
            Alt.
          </AltCol>
          <CodeCol hover hidden={hiddenList.includes(AclRowField.code)} onMouseDown={() => toggleHideColumn(AclRowField.code)}>
            C{!hiddenList.includes(AclRowField.code) && "ode"}
          </CodeCol>
          <SpecialBox disabled />
          <EdstTooltip title={Tooltips.aclHeaderHdg}>
            <HdgCol hover hidden={hiddenList.includes(AclRowField.hdg)} onMouseDown={() => toggleHideColumn(AclRowField.hdg)}>
              {hiddenList.includes(AclRowField.hdg) && anyAssignedHeading && "*"}H{!hiddenList.includes(AclRowField.hdg) && "dg"}
            </HdgCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclHeaderSlash}>
            <HdgSpdSlashCol hover onMouseDown={handleClickSlash}>
              /
            </HdgSpdSlashCol>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.aclHeaderSpd}>
            <SpdCol hover hidden={hiddenList.includes(AclRowField.spd)} onMouseDown={() => toggleHideColumn(AclRowField.spd)}>
              S{!hiddenList.includes(AclRowField.spd) && "pd"}
              {hiddenList.includes(AclRowField.spd) && anyAssignedSpeed && "*"}
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
        {spaEntryList?.map(([i, entry]: [string, LocalEdstEntry]) => (
          <AclRow
            key={`acl-table-row-spa-${entry.cid}-${i}`}
            index={Number(i)}
            entry={entry}
            anyHolding={anyHolding}
            hidden={hiddenList}
            altMouseDown={altMouseDown}
          />
        ))}
        {spaEntryList.length > 0 && <BodyRowDiv separator />}
        {Object.entries(entryList?.filter((entry: LocalEdstEntry) => !entry.spa && (entry.vciStatus > -1 || !manualPosting))?.sort(sortFunc))?.map(
          ([i, entry]: [string, LocalEdstEntry]) => (
            <AclRow
              key={`acl-table-row-ack-${entry.cid}-${i}`}
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
          Object.entries(
            entryList?.filter((entry: LocalEdstEntry) => !entry.spa && entry.vciStatus === -1)
          )?.map(([i, entry]: [string, LocalEdstEntry]) => (
            <AclRow
              key={`acl-table-row-no-ack-${entry.cid}-${i}`}
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
