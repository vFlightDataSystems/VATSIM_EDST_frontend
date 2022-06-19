import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { planQueueSelector, selectedPlanIndexSelector, TrialPlan, setSelectedTrialPlanIndex } from "../../../redux/slices/planSlice";
import { removeTrialPlanThunk } from "../../../redux/thunks/thunks";
import { BodyRowDiv } from "../../../styles/bodyStyles";
import { NoSelectDiv } from "../../../styles/styles";
import { edstFontGreen, edstFontGrey } from "../../../styles/colors";

const PlansDisplayBody = styled(NoSelectDiv)`
  overflow: hidden;
  display: block;
  flex-flow: column;
  border-top: 1px solid #adadad;
  /*scrollbar-width: none;  !* Firefox *!*/
  color: ${edstFontGrey};
`;
const Col = styled.div<{ hover?: boolean; disabled?: boolean; color?: string; width?: number; selected?: boolean }>`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  height: 18px;
  border: 1px solid transparent;

  &[disabled] {
    pointer-events: none;
    color: #000000;
  }

  width: ${props => (props.width ? `${props.width}px` : "auto")};
  ${props => props.color && { color: props.color }};
  ${props =>
    props.selected && {
      "background-color": props.color ?? "#ADADAD",
      color: "#000000"
    }};
  ${props => props.hover && { "&:hover": { border: "1px solid #F0F0F0" } }}
`;
const Col1 = styled(Col)`
  width: 200px;
  justify-content: left;
  padding: 0 4px;
`;
const Col2 = styled(Col)<{ expired: boolean }>`
  margin-left: auto;
  margin-right: 15vw;
  width: 40px;
  border: 1px solid #00ad00;
  color: #00ad00;
  padding: 0 4px;
`;

export const PlansDisplayTable: React.FC = () => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const selectedPlanIndex = useRootSelector(selectedPlanIndexSelector);

  const [time, setTime] = useState(new Date().getTime() / 1000);
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().getTime() / 1000), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    switch (event.button) {
      case 0:
        dispatch(setSelectedTrialPlanIndex(selectedPlanIndex === index ? null : index));
        break;
      case 2:
        dispatch(removeTrialPlanThunk(index));
        break;
      default:
        break;
    }
  };

  const formatTime = (expirationTime: number, currentTime: number) => {
    const max = Math.max(expirationTime - currentTime, 0);
    return `${Math.floor(max / 60).toString()}:${Math.floor(max % 60)
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <PlansDisplayBody>
      {planQueue?.map((p: TrialPlan, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <BodyRowDiv key={`plans-display-body-${p.aircraftId}-${i}`}>
          <Col1 selected={selectedPlanIndex === i} color={edstFontGreen} hover onMouseDown={(event: React.MouseEvent) => handleMouseDown(event, i)}>
            {p.cid} {p.aircraftId}
          </Col1>
          <Col>{p.commandString}</Col>
          <Col2 expired={p.expirationTime - time < 0}>{formatTime(p.expirationTime, time)}</Col2>
        </BodyRowDiv>
      ))}
    </PlansDisplayBody>
  );
};
