import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import {
  aclAckListSelector,
  aclSpaListSelector,
  aclUnAckListSelector,
  anyAssignedHdgSelector,
  anyAssignedSpdSelector,
  anyHoldingSelector,
} from "~redux/selectors";
import { aselSelector, setAsel } from "~redux/slices/appSlice";
import { NoSelectDiv } from "styles/NoSelectDiv";
import { ScrollContainer } from "styles/optionMenuStyles";
import { BodyRowDiv, BodyRowHeaderDiv, InnerRow } from "styles/styles";
import { aclHiddenColumnsSelector, aclManualPostingSelector, toggleAclHideColumn, toolsOptionsSelector } from "~redux/slices/aclSlice";
import { AircraftTypeCol, AltCol, CodeCol, FidCol, RouteCol, SpecialBox } from "styles/sharedColumns";
import { AclRowField } from "enums/acl/aclRowField";
import { VCI_SYMBOL } from "~/utils/constants";
import { colors } from "~/edstTheme";
import { AclCol1, HdgCol, HdgSpdSlashCol, PointOutCol, RadioCol, SpdCol } from "./AclStyled";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { AclRow } from "./AclRow";
import { ListMapper } from "../../utils/ListMapper";

const AclBodyDiv = styled(NoSelectDiv)`
  white-space: nowrap;
  overflow: hidden;
  flex-flow: column;
  display: flex;
  color: ${(props) => props.theme.colors.grey};
`;

const SpaList = React.memo(() => <ListMapper selector={aclSpaListSelector} Component={AclRow} showSep />);

const AckList = React.memo(() => <ListMapper selector={aclAckListSelector} Component={AclRow} />);

const UnAckList = React.memo(() => <ListMapper selector={aclUnAckListSelector} Component={AclRow} />);

export const AclTable = () => {
  const dispatch = useRootDispatch();
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const toolOptions = useRootSelector(toolsOptionsSelector);

  const asel = useRootSelector(aselSelector);
  const anyHolding = useRootSelector(anyHoldingSelector);
  const anyAssignedHeading = useRootSelector(anyAssignedHdgSelector);
  const anyAssignedSpeed = useRootSelector(anyAssignedSpdSelector);
  const hiddenColumns = useRootSelector(aclHiddenColumnsSelector);
  const [, setAltMouseDown] = useState(false);

  const handleClickSlash = useCallback(() => {
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
  }, [asel?.field, dispatch, hiddenColumns]);

  return (
    <AclBodyDiv>
      <BodyRowHeaderDiv>
        <RadioCol header green>
          {VCI_SYMBOL}
        </RadioCol>
        <AclCol1 color={colors.red}>R</AclCol1>
        <AclCol1 color={colors.yellow}>Y</AclCol1>
        <AclCol1 color={colors.orange}>A</AclCol1>
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
          <AircraftTypeCol
            hover
            hidden={hiddenColumns.includes(AclRowField.TYPE)}
            onMouseDown={() => dispatch(toggleAclHideColumn(AclRowField.TYPE))}
          >
            T{!hiddenColumns.includes(AclRowField.TYPE) && "ype"}
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
        <SpaList />
        <AckList />
        {manualPosting && (
          <>
            <BodyRowDiv separator />
            <UnAckList />
          </>
        )}
      </ScrollContainer>
    </AclBodyDiv>
  );
};
