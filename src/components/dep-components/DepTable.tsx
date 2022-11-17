import React from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { NoSelectDiv } from "styles/NoSelectDiv";
import { ScrollContainer } from "styles/optionMenuStyles";
import { BodyRowDiv, BodyRowHeaderDiv } from "styles/styles";
import { depHiddenColumnsSelector, depManualPostingSelector, toggleDepHideColumn } from "~redux/slices/depSlice";
import { AircraftTypeCol, AltCol, CodeCol, FidCol, RouteCol, SpecialBox } from "styles/sharedColumns";
import { COMPLETED_CHECKMARK_SYMBOL } from "~/utils/constants";
import { DepPTimeCol, RadioCol } from "components/DepStyled";
import { DepRow } from "components/DepRow";
import { ListMapper } from "components/utils/ListMapper";
import { depListSelector } from "~redux/selectors";

const DepBodyDiv = styled(NoSelectDiv)`
  white-space: nowrap;
  overflow: hidden;
  flex-flow: column;
  display: flex;
  color: ${(props) => props.theme.colors.grey};
`;

export const DepTable = () => {
  const dispatch = useRootDispatch();
  const manualPosting = useRootSelector(depManualPostingSelector);
  const hiddenColumns = useRootSelector(depHiddenColumnsSelector);

  const [spaList, ackList, unAckList] = useRootSelector(depListSelector);

  return (
    <DepBodyDiv>
      <BodyRowHeaderDiv>
        <RadioCol header>{COMPLETED_CHECKMARK_SYMBOL}</RadioCol>
        <DepPTimeCol>P-Time</DepPTimeCol>
        <FidCol>Flight ID</FidCol>
        <SpecialBox disabled />
        <SpecialBox disabled />
        <SpecialBox disabled />
        <AircraftTypeCol
          hover
          hidden={hiddenColumns.includes("TYPE_DEP_ROW_FIELD")}
          onMouseDown={() => dispatch(toggleDepHideColumn("TYPE_DEP_ROW_FIELD"))}
        >
          T{!hiddenColumns.includes("TYPE_DEP_ROW_FIELD") && "ype"}
        </AircraftTypeCol>
        <AltCol headerCol>Alt.</AltCol>
        <CodeCol hover hidden={hiddenColumns.includes("CODE_DEP_ROW_FIELD")} onMouseDown={() => dispatch(toggleDepHideColumn("CODE_DEP_ROW_FIELD"))}>
          C{!hiddenColumns.includes("CODE_DEP_ROW_FIELD") && "ode"}
        </CodeCol>
        <SpecialBox disabled />
        <RouteCol>Route</RouteCol>
      </BodyRowHeaderDiv>
      <ScrollContainer>
        <ListMapper list={spaList} Component={DepRow} showSep />
        <ListMapper list={ackList} Component={DepRow} />
        {manualPosting && (
          <>
            <BodyRowDiv separator />
            <ListMapper list={unAckList} Component={DepRow} />
          </>
        )}
      </ScrollContainer>
    </DepBodyDiv>
  );
};
