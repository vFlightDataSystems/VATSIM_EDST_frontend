import React from "react";
import styled from "styled-components";
import { DepRow } from "./DepRow";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { NoSelectDiv } from "../../../styles/NoSelectDiv";
import { ScrollContainer } from "../../../styles/optionMenuStyles";
import { BodyRowDiv, BodyRowHeaderDiv } from "../../../styles/styles";
import { DepPTimeCol, RadioCol } from "./DepStyled";
import { depHiddenColumnsSelector, depManualPostingSelector, toggleDepHideColumn } from "../../../redux/slices/depSlice";
import { AircraftTypeCol, AltCol, CodeCol, FidCol, RouteCol, SpecialBox } from "../../../styles/sharedColumns";
import { DepRowField } from "../../../typeDefinitions/enums/dep/depRowField";
import { COMPLETED_CHECKMARK_SYMBOL } from "../../../utils/constants";
import { depAckListSelector, depSpaListSelector, depUnAckListSelector } from "../../../redux/selectors";
import { ListMapper } from "../../utils/ListMapper";

const DepBodyDiv = styled(NoSelectDiv)`
  white-space: nowrap;
  overflow: hidden;
  flex-flow: column;
  display: flex;
  color: ${props => props.theme.colors.grey};
`;

const SpaList = React.memo(() => <ListMapper selector={depSpaListSelector} Component={DepRow} showSep />);

const AckList = React.memo(() => <ListMapper selector={depAckListSelector} Component={DepRow} />);

const UnAckList = React.memo(() => <ListMapper selector={depUnAckListSelector} Component={DepRow} />);

export const DepTable = () => {
  const dispatch = useRootDispatch();
  const manualPosting = useRootSelector(depManualPostingSelector);
  const hiddenColumns = useRootSelector(depHiddenColumnsSelector);

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
          id="dep-table-aircraft-type-header"
          hover
          hidden={hiddenColumns.includes(DepRowField.TYPE)}
          onMouseDown={() => dispatch(toggleDepHideColumn(DepRowField.TYPE))}
        >
          T{!hiddenColumns.includes(DepRowField.TYPE) && "ype"}
        </AircraftTypeCol>
        <AltCol headerCol>Alt.</AltCol>
        <CodeCol hover hidden={hiddenColumns.includes(DepRowField.CODE)} onMouseDown={() => dispatch(toggleDepHideColumn(DepRowField.CODE))}>
          C{!hiddenColumns.includes(DepRowField.CODE) && "ode"}
        </CodeCol>
        <SpecialBox disabled />
        <RouteCol>Route</RouteCol>
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
    </DepBodyDiv>
  );
};
