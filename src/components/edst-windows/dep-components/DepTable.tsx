import React from "react";
import styled from "styled-components";
import { DepRow } from "./DepRow";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { NoSelectDiv } from "../../../styles/NoSelectDiv";
import { ScrollContainer } from "../../../styles/optionMenuStyles";
import { BodyRowDiv, BodyRowHeaderDiv, RowSeparator } from "../../../styles/styles";
import { DepPTimeCol, DepFidCol, RadioCol } from "./DepStyled";
import { depHiddenColumnsSelector, depManualPostingSelector, toggleDepHideColumn } from "../../../redux/slices/depSlice";
import { AircraftTypeCol, AltCol, CodeCol, RouteCol, SpecialBox } from "../../../styles/sharedColumns";
import { DepRowField } from "../../../typeDefinitions/enums/dep/depRowField";
import { COMPLETED_CHECKMARK_SYMBOL } from "../../../utils/constants";
import { AircraftId } from "../../../typeDefinitions/types/aircraftId";
import { depAckListSelector, depSpaListSelector, depUnAckListSelector } from "../../../redux/selectors";

const DepBodyDiv = styled(NoSelectDiv)`
  white-space: nowrap;
  overflow: hidden;
  flex-flow: column;
  display: flex;
  color: ${props => props.theme.colors.grey};
`;

const mapRow = (aircraftList: AircraftId[]) =>
  aircraftList.map((aircraftId, i) => (
    <React.Fragment key={aircraftId}>
      <DepRow aircraftId={aircraftId} />
      {i % 3 === 2 && <RowSeparator />}
    </React.Fragment>
  ));

const SpaList = () => {
  const spaList = useRootSelector(depSpaListSelector);
  return (
    <>
      {mapRow(spaList)}
      {spaList.length > 0 && <BodyRowDiv separator />}
    </>
  );
};

const AckList = () => {
  const ackList = useRootSelector(depAckListSelector);
  return <>{mapRow(ackList)}</>;
};

const UnAckList = () => {
  const unAckList = useRootSelector(depUnAckListSelector);
  return <>{mapRow(unAckList)}</>;
};

export const DepTable = () => {
  const dispatch = useRootDispatch();
  const manualPosting = useRootSelector(depManualPostingSelector);
  const hiddenColumns = useRootSelector(depHiddenColumnsSelector);

  return (
    <DepBodyDiv>
      <BodyRowHeaderDiv>
        <RadioCol header>{COMPLETED_CHECKMARK_SYMBOL}</RadioCol>
        <DepPTimeCol>P-Time</DepPTimeCol>
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
