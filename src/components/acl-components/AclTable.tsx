import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aclListSelector, anyAssignedHdgSelector, anyAssignedSpdSelector, anyHoldingSelector } from "~redux/selectors";
import { aselSelector, setAsel } from "~redux/slices/appSlice";
import { NoSelectDiv } from "styles/NoSelectDiv";
import { ScrollContainer } from "styles/optionMenuStyles";
import { BodyRowDiv, BodyRowHeaderDiv, InnerRow } from "styles/styles";
import { aclHiddenColumnsSelector, aclManualPostingSelector, toggleAclHideColumn, toolsOptionsSelector } from "~redux/slices/aclSlice";
import { AircraftTypeCol, AltCol, CodeCol, FidCol, RouteCol, SpecialBox } from "styles/sharedColumns";
import { VCI_SYMBOL } from "~/utils/constants";
import { colors } from "~/edstTheme";
import { AclCol1, HdgCol, HdgSpdSlashCol, PointOutCol, RadioCol, SpdCol } from "components/AclStyled";
import { AclRow } from "components/AclRow";
import { ListMapper } from "components/utils/ListMapper";

const AclBodyDiv = styled(NoSelectDiv)`
  white-space: nowrap;
  overflow: hidden;
  flex-flow: column;
  display: flex;
  color: ${(props) => props.theme.colors.grey};
`;

export const AclTable = () => {
  const dispatch = useRootDispatch();
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const toolOptions = useRootSelector(toolsOptionsSelector);

  const asel = useRootSelector(aselSelector);
  const anyHolding = useRootSelector(anyHoldingSelector);
  const anyAssignedHeading = useRootSelector(anyAssignedHdgSelector);
  const anyAssignedSpeed = useRootSelector(anyAssignedSpdSelector);
  const hiddenColumns = useRootSelector(aclHiddenColumnsSelector);

  const [spaList, ackList, unAckList] = useRootSelector(aclListSelector);
  const [, setAltMouseDown] = useState(false);

  const handleClickSlash = useCallback(() => {
    if (hiddenColumns.includes("SPD_ACL_ROW_FIELD") && hiddenColumns.includes("HDG_ACL_ROW_FIELD")) {
      dispatch(toggleAclHideColumn(["SPD_ACL_ROW_FIELD", "HDG_ACL_ROW_FIELD"]));
      if (asel?.field === "SPD_ACL_ROW_FIELD" || asel?.field === "HDG_ACL_ROW_FIELD") {
        dispatch(setAsel(null));
      }
    } else {
      if (!hiddenColumns.includes("HDG_ACL_ROW_FIELD")) {
        dispatch(toggleAclHideColumn("HDG_ACL_ROW_FIELD"));
        if (asel?.field === "HDG_ACL_ROW_FIELD") {
          dispatch(setAsel(null));
        }
      }
      if (!hiddenColumns.includes("SPD_ACL_ROW_FIELD")) {
        dispatch(toggleAclHideColumn("SPD_ACL_ROW_FIELD"));
        if (asel?.field === "SPD_ACL_ROW_FIELD") {
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
          <PointOutCol title={Tooltips.aclHeaderPa}>PA</PointOutCol>
          {toolOptions.displayCoordinationColumn && <SpecialBox disabled />}
          {/* spa indicator column */}
          <SpecialBox disabled />
          {/* hotbox column */}
          <SpecialBox disabled />
          <AircraftTypeCol
            hover
            hidden={hiddenColumns.includes("TYPE_ACL_ROW_FIELD")}
            onMouseDown={() => dispatch(toggleAclHideColumn("TYPE_ACL_ROW_FIELD"))}
          >
            T{!hiddenColumns.includes("TYPE_ACL_ROW_FIELD") && "ype"}
          </AircraftTypeCol>
          <AltCol hover headerCol onMouseDown={() => setAltMouseDown(true)} onMouseUp={() => setAltMouseDown(false)}>
            Alt.
          </AltCol>
          <CodeCol
            hover
            hidden={hiddenColumns.includes("CODE_ACL_ROW_FIELD")}
            onMouseDown={() => dispatch(toggleAclHideColumn("CODE_ACL_ROW_FIELD"))}
          >
            C{!hiddenColumns.includes("CODE_ACL_ROW_FIELD") && "ode"}
          </CodeCol>
          <SpecialBox disabled />
          <HdgCol
            title={Tooltips.aclHeaderHdg}
            hover
            hidden={hiddenColumns.includes("HDG_ACL_ROW_FIELD")}
            onMouseDown={() => dispatch(toggleAclHideColumn("HDG_ACL_ROW_FIELD"))}
          >
            {hiddenColumns.includes("HDG_ACL_ROW_FIELD") && anyAssignedHeading && "*"}H{!hiddenColumns.includes("HDG_ACL_ROW_FIELD") && "dg"}
          </HdgCol>
          <HdgSpdSlashCol title={Tooltips.aclHeaderSlash} hover onMouseDown={handleClickSlash}>
            /
          </HdgSpdSlashCol>
          <SpdCol
            title={Tooltips.aclHeaderSpd}
            hover
            hidden={hiddenColumns.includes("SPD_ACL_ROW_FIELD")}
            onMouseDown={() => dispatch(toggleAclHideColumn("SPD_ACL_ROW_FIELD"))}
          >
            S{!hiddenColumns.includes("SPD_ACL_ROW_FIELD") && "pd"}
            {hiddenColumns.includes("SPD_ACL_ROW_FIELD") && anyAssignedSpeed && "*"}
          </SpdCol>
          <SpecialBox disabled />
          <SpecialBox disabled />
          {anyHolding && <SpecialBox disabled>H</SpecialBox>}
          {/* toggle remarks column */}
          <SpecialBox disabled />
          <RouteCol padding="0 4px">Route</RouteCol>
        </InnerRow>
      </BodyRowHeaderDiv>
      <ScrollContainer>
        <ListMapper key="aclSpaList" list={spaList} Component={AclRow} showSep />
        <ListMapper key="aclAckList" list={ackList} Component={AclRow} />
        {manualPosting && (
          <>
            <BodyRowDiv separator />
            <ListMapper key="aclUnAckList" list={unAckList} Component={AclRow} />
          </>
        )}
      </ScrollContainer>
    </AclBodyDiv>
  );
};
