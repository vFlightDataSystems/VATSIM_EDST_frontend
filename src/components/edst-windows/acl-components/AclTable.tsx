import React, {useMemo, useState} from 'react';
import {AclRow} from "./AclRow";
import VCI from '../../../resources/images/VCI_v4.png';
import {EdstTooltip} from "../../resources/EdstTooltip";
import {Tooltips} from "../../../tooltips";
import {LocalEdstEntryType} from "../../../types";
import {useAppDispatch, useAppSelector} from '../../../redux/hooks';
import {anyAssignedHdgSelector, anyAssignedSpdSelector, anyHoldingSelector} from "../../../redux/selectors";
import {aclRowFieldEnum, menuEnum, sortOptionsEnum} from "../../../enums";
import {aselSelector, closeMenu, setAsel} from "../../../redux/slices/appSlice";
import {NoSelectDiv} from "../../../styles/styles";
import styled from "styled-components";
import {edstFontGrey, edstFontOrange, edstFontRed, edstFontYellow} from "../../../styles/colors";
import {ScrollContainer} from "../../../styles/optionMenuStyles";
import {BodyRowDiv, BodyRowHeaderDiv, InnerRow} from "../../../styles/bodyStyles";
import {
  AclCol1,
  AircraftTypeCol,
  AltCol,
  CodeCol,
  FidCol,
  HdgCol, HdgSpdSlashCol,
  PointOutCol,
  RadioCol,
  RouteCol,
  SpdCol,
  SpecialBox
} from "./AclStyled";
import {aclManualPostingSelector, aclSortDataSelector} from "../../../redux/slices/aclSlice";
import {entriesSelector} from "../../../redux/slices/entriesSlice";

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
  const sortData = useAppSelector(aclSortDataSelector);
  const manualPosting = useAppSelector(aclManualPostingSelector);
  const dispatch = useAppDispatch();

  const asel = useAppSelector(aselSelector);
  const anyHolding = useAppSelector(anyHoldingSelector);
  const anyAssignedHeading = useAppSelector(anyAssignedHdgSelector);
  const anyAssignedSpeed = useAppSelector(anyAssignedSpdSelector);
  const [hiddenList, setHiddenList] = useState<aclRowFieldEnum[]>([]);
  const [altMouseDown, setAltMouseDown] = useState(false);
  const entries = useAppSelector(entriesSelector);

  const toggleHideColumn = (field: aclRowFieldEnum) => {
    let hiddenCopy = hiddenList.slice(0);
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
    let hiddenCopy = hiddenList.slice(0);
    if (hiddenCopy.includes(aclRowFieldEnum.spd) && hiddenCopy.includes(aclRowFieldEnum.hdg)) {
      hiddenCopy.splice(hiddenCopy.indexOf(aclRowFieldEnum.spd), 1);
      hiddenCopy.splice(hiddenCopy.indexOf(aclRowFieldEnum.hdg), 1);
      if (asel?.field as aclRowFieldEnum === aclRowFieldEnum.spd) {
        dispatch(closeMenu(menuEnum.speedMenu));
        dispatch(setAsel(null));
      }
      if (asel?.field as aclRowFieldEnum === aclRowFieldEnum.hdg) {
        dispatch(closeMenu(menuEnum.headingMenu));
        dispatch(setAsel(null));
      }
    } else {
      if (!hiddenCopy.includes(aclRowFieldEnum.hdg)) {
        hiddenCopy.push(aclRowFieldEnum.hdg);
        if (asel?.field as aclRowFieldEnum === aclRowFieldEnum.hdg) {
          dispatch(closeMenu(menuEnum.headingMenu));
          dispatch(setAsel(null));
        }
      }
      if (!hiddenCopy.includes(aclRowFieldEnum.spd)) {
        if (asel?.field as aclRowFieldEnum === aclRowFieldEnum.spd) {
          dispatch(closeMenu(menuEnum.speedMenu));
          dispatch(setAsel(null));
        }
        hiddenCopy.push(aclRowFieldEnum.spd);
      }
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
        return u.dep.localeCompare(v.dep);
      case sortOptionsEnum.boundaryTime:
        return u.boundaryTime - v.boundaryTime;
      default:
        return u.callsign.localeCompare(v.callsign);
    }
  };

  const entryList = useMemo(() => Object.values(entries)?.filter((entry: LocalEdstEntryType) => entry.aclDisplay), [entries]);
  const spaEntryList = useMemo(() => Object.entries(entryList.filter((entry: LocalEdstEntryType) => entry.spa)), [entryList]);

  return (<AclBodyStyleDiv>
    <BodyRowHeaderDiv key="acl-table-header">
      <RadioCol header={true}>
        <img src={VCI} alt="wifi-symbol"/>
      </RadioCol>
      <AclCol1 color={edstFontRed}>
        R
      </AclCol1>
      <AclCol1 color={edstFontYellow}>
        Y
      </AclCol1>
      <AclCol1 color={edstFontOrange}>
        A
      </AclCol1>
      <InnerRow>
        <SpecialBox disabled={true}/>
        <SpecialBox disabled={true}/>
        <FidCol>
          Flight ID
        </FidCol>
        <EdstTooltip title={Tooltips.aclHeaderPa}>
          <PointOutCol>
            PA
          </PointOutCol>
        </EdstTooltip>
        <SpecialBox disabled={true}/>
        <SpecialBox disabled={true}/>
        <AircraftTypeCol hidden={hiddenList.includes(aclRowFieldEnum.type)}>
          <div onMouseDown={() => toggleHideColumn(aclRowFieldEnum.type)}>
            T{!hiddenList.includes(aclRowFieldEnum.type) && 'ype'}
          </div>
        </AircraftTypeCol>
        <AltCol hover={true} headerCol={true}
                onMouseDown={() => setAltMouseDown(true)}
                onMouseUp={() => setAltMouseDown(false)}
        >
          Alt.
        </AltCol>
        <CodeCol hover={true} hidden={hiddenList.includes(aclRowFieldEnum.code)}
                 onMouseDown={() => toggleHideColumn(aclRowFieldEnum.code)}>
          C{!hiddenList.includes(aclRowFieldEnum.code) && 'ode'}
        </CodeCol>
        <SpecialBox disabled={true}/>
        <EdstTooltip title={Tooltips.aclHeaderHdg}>
          <HdgCol hover={true} hidden={hiddenList.includes(aclRowFieldEnum.hdg)}
                  onMouseDown={() => toggleHideColumn(aclRowFieldEnum.hdg)}
          >
            {hiddenList.includes(aclRowFieldEnum.hdg) && anyAssignedHeading && '*'}H{!hiddenList.includes(aclRowFieldEnum.hdg) && 'dg'}
          </HdgCol>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclHeaderSlash}>
          <HdgSpdSlashCol hover={true} onMouseDown={handleClickSlash}>
            /
          </HdgSpdSlashCol>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclHeaderSpd}>
          <SpdCol hover={true} hidden={hiddenList.includes(aclRowFieldEnum.spd)}
                  onMouseDown={() => toggleHideColumn(aclRowFieldEnum.spd)}
          >
            S{!hiddenList.includes(aclRowFieldEnum.spd) && 'pd'}{hiddenList.includes(aclRowFieldEnum.spd) && anyAssignedSpeed && '*'}
          </SpdCol>
        </EdstTooltip>
        <SpecialBox disabled={true}/>
        <SpecialBox disabled={true}/>
        <SpecialBox disabled={!anyHolding}>H</SpecialBox>
        <SpecialBox disabled={true}/>
        <SpecialBox disabled={true}/>
        <SpecialBox disabled={true}/>
        <SpecialBox disabled={true}/>
        <RouteCol>
          Route
        </RouteCol>
      </InnerRow>
    </BodyRowHeaderDiv>
    <ScrollContainer>
      {spaEntryList?.map(([i, entry]: [string, LocalEdstEntryType]) =>
        <AclRow
          key={`acl-table-row-spa-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          anyHolding={anyHolding}
          hidden={hiddenList}
          altMouseDown={altMouseDown}
        />)}
      {spaEntryList.length > 0 && <BodyRowDiv separator={true}/>}
      {Object.entries(entryList?.filter((entry: LocalEdstEntryType) => (!entry.spa && ((entry.vciStatus > -1) || !manualPosting)))
        ?.sort(sortFunc))?.map(([i, entry]: [string, LocalEdstEntryType]) =>
        <AclRow
          key={`acl-table-row-ack-${entry.cid}-${i}`}
          index={Number(i)}
          entry={entry}
          anyHolding={anyHolding}
          hidden={hiddenList}
          altMouseDown={altMouseDown}
        />)}
      {manualPosting && <BodyRowDiv separator={true}/>}
      {manualPosting && Object.entries(entryList?.filter((entry: LocalEdstEntryType) => (!entry.spa && entry.vciStatus === -1)))
        ?.map(([i, entry]: [string, LocalEdstEntryType]) =>
          <AclRow
            key={`acl-table-row-no-ack-${entry.cid}-${i}`}
            index={Number(i)}
            entry={entry}
            anyHolding={anyHolding}
            hidden={hiddenList}
            altMouseDown={altMouseDown}
          />)}
    </ScrollContainer>
  </AclBodyStyleDiv>);
}
