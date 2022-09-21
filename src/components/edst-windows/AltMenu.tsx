import React, { useRef, useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import { useEventListener } from "usehooks-ts";
import { EdstTooltip } from "../utils/EdstTooltip";
import { Tooltips } from "../../tooltips";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aselEntrySelector } from "../../redux/slices/entrySlice";
import { aselSelector, closeWindow, windowPositionSelector } from "../../redux/slices/appSlice";
import { defaultInputFontSize, NoSelectDiv } from "../../styles/styles";
import { edstFontGrey, edstFontYellow } from "../../styles/colors";
import { WindowPosition } from "../../typeDefinitions/types/windowPosition";
import { addPlanThunk } from "../../redux/thunks/addPlanThunk";
import { useCenterCursor } from "../../hooks/useCenterCursor";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { useHubActions } from "../../hooks/useHubActions";
import { ALTITUDE_VALIDATION_EXPRESSIONS, UPLINK_SYMBOL } from "../../utils/constants";
import { Plan } from "../../typeDefinitions/types/plan";

type AltMenuDivProps = { width?: string; pos: WindowPosition };
const AltMenuDiv = styled(NoSelectDiv).attrs((props: AltMenuDivProps) => ({
  width: props.width ?? "100px",
  left: `${props.pos.x}px`,
  top: `${props.pos.y}px`
}))<AltMenuDivProps>`
  z-index: 11000;
  background-color: #888888;
  position: fixed;
  width: ${props => props.width};
  color: #d6d6d6;
  left: ${props => props.left};
  top: ${props => props.top};
`;

const AltMenuHeaderDiv = styled.div`
  display: flex;
  height: 20px;
`;
type AltMenuHeaderColProps = { flexGrow?: number; width?: string };
const AltMenuHeaderCol = styled.div.attrs((props: AltMenuHeaderColProps) => ({
  width: props.width ?? "auto",
  flexGrow: props.flexGrow ?? 0
}))<AltMenuHeaderColProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #adadad;
  width: ${props => props.width};
  flex-grow: ${props => props.flexGrow};

  &:hover {
    border: 1px solid #f0f0f0;
  }
`;

const AltMenuSelectContainer = styled.div`
  padding: 2px;
  display: flex;
  flex-flow: column;
  background-color: #000000;
  border: 1px solid #adadad;
`;

type AltMenuRowProps = {
  bgBlack?: boolean;
  color?: string;
  hover?: boolean;
  selected?: boolean;
  disabled?: boolean;
};

const AltMenuRow = styled.div<AltMenuRowProps>`
  min-height: 1.1em;
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  border: 1px solid #adadad;
  ${props => props.bgBlack && { "background-color": "#000000" }};
  ${props => props.color && { color: props.color }};
  &[disabled] {
    pointer-events: none;
    color: #adadad;
  }
  ${props =>
    props.hover && {
      "&:hover": {
        border: "1px solid #F0F0F0"
      }
    }};
  ${props =>
    props.selected && {
      border: "1px solid #FFFFFF",
      "background-color": "#AD6C6C"
    }};
  input {
    font-size: ${defaultInputFontSize};
    outline: none;
    display: flex;
    overflow: hidden;
    color: ${edstFontGrey};
    resize: none;
    text-transform: uppercase;
    background-color: #000000;
    //height: 16px;
    width: 100%;
    border: none;
  }
`;
type AltMenuRowColProps = {
  width?: string;
  disabled?: boolean;
};
const AltMenuRowCol = styled(AltMenuRow).attrs((props: AltMenuRowColProps) => ({
  width: props.width ?? "auto"
}))<AltMenuRowColProps>`
  padding: 0;
  width: ${props => props.width};
`;

const AltMenuScrollRow = styled.div<{ hover?: boolean }>`
  width: 56px;
  display: flex;
  margin: 1px 6px;
  height: 20px;
  color: #adadad;
  /*border: none;*/
  border: 1px solid #000000;

  ${props =>
    props.hover && {
      "&:hover": {
        border: "1px solid #F0F0F0"
      }
    }};
`;

const AltMenuScrollCol = styled.div<{ tempAlt?: boolean; borderHover?: boolean; selected?: boolean }>`
  padding: 0 2px;
  display: flex;
  justify-content: left;
  align-items: center;
  color: #adadad;
  //border: 1px solid #000000;
  &:hover {
    outline: 1px solid #f0f0f0;
  }

  ${props =>
    props.borderHover && {
      "&:hover": {
        border: "1px solid #F0F0F0"
      }
    }};
  ${props =>
    props.selected && {
      "background-color": "#AD6C6C",
      color: "#D6D6D6"
    }};
`;
const AltMenuScrollTempAltCol = styled.div<{ disabled?: boolean }>`
  display: flex;
  /*margin-left: 6px;*/
  padding-left: 8px;
  padding-right: 2px;
  justify-content: left;
  align-items: center;
  /*height: 10px;*/
  color: #adadad;

  &[disabled] {
    pointer-events: none;
    color: #575757;
  }
`;

function validateAltitudeInput(input: string) {
  // check if input is a number and length matches valid input
  // +"string" will convert the string to a number or NaN
  // it is called the unary plus operator
  return Object.values(ALTITUDE_VALIDATION_EXPRESSIONS).some(regex => regex.test(input));
}

export const AltMenu = () => {
  const ref = useRef<HTMLDivElement>(null);
  const asel = useRootSelector(aselSelector)!;
  const entry = useRootSelector(aselEntrySelector)!;
  const pos = useRootSelector(windowPositionSelector(EdstWindow.ALTITUDE_MENU));
  const dispatch = useRootDispatch();
  const [selected, setSelected] = useState(asel.window !== EdstWindow.DEP ? "trial" : "amend");
  const [tempAltHover, setTempAltHover] = useState<number | null>(null);
  const [deltaY, setDeltaY] = useState(0);
  const [manualInput, setManualInput] = useState<string | null>(null);
  const [showInvalid, setShowInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { amendFlightplan } = useHubActions();

  const assignedAltitude = Number.isFinite(+entry.altitude) ? +entry.altitude : 200;

  useCenterCursor(ref, [asel.aircraftId]);

  const handleAltClick = (alt: string | number) => {
    const amendedFlightplan = { ...entry, altitude: alt.toString().toUpperCase() };
    if (selected === "amend") {
      amendFlightplan(amendedFlightplan).then();
    } else {
      const trialPlanData: Plan = {
        cid: entry.cid,
        aircraftId: entry.aircraftId,
        amendedFlightplan,
        commandString: `AM ${entry.aircraftId} ALT ${alt}`,
        expirationTime: new Date().getTime() / 1000 + 120
      };
      dispatch(addPlanThunk(trialPlanData));
    }
    dispatch(closeWindow(EdstWindow.ALTITUDE_MENU));
  };

  const handleTempAltClick = (alt: number) => {
    // dispatch(addTrialPlanThunk(trialPlanData));
    dispatch(closeWindow(EdstWindow.ALTITUDE_MENU));
  };

  const handleScroll: React.WheelEventHandler<HTMLDivElement> = e => {
    const newDeltaY = Math.min(Math.max((assignedAltitude - 560) * 10, deltaY + e.deltaY), (assignedAltitude - 40) * 10);
    setDeltaY(newDeltaY);
  };

  const keyDownHandler = () => {
    if (manualInput === null) {
      setManualInput("");
    }
    if (!(document.activeElement === inputRef.current) && inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEventListener("keydown", keyDownHandler);

  return (
    pos &&
    asel && (
      <AltMenuDiv ref={ref} width={manualInput !== null ? "auto" : "110px"} pos={pos} id="alt-menu">
        <AltMenuHeaderDiv>
          <AltMenuHeaderCol flexGrow={1}>{entry?.aircraftId}</AltMenuHeaderCol>
          <AltMenuHeaderCol width="1.6ch" onMouseDown={() => dispatch(closeWindow(EdstWindow.ALTITUDE_MENU))}>
            X
          </AltMenuHeaderCol>
        </AltMenuHeaderDiv>
        {manualInput !== null && (
          <span>
            <AltMenuRow>FP{entry.altitude}</AltMenuRow>
            <AltMenuRow bgBlack>
              <input
                tabIndex={0}
                ref={inputRef}
                value={manualInput}
                onChange={event => setManualInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === "Enter") {
                    if (validateAltitudeInput(manualInput)) {
                      handleAltClick(manualInput);
                    } else {
                      setShowInvalid(true);
                    }
                  }
                }}
              />
            </AltMenuRow>
            {showInvalid && (
              <AltMenuRow bgBlack color={edstFontYellow}>
                INVALID
              </AltMenuRow>
            )}
          </span>
        )}
        {manualInput === null && (
          <span>
            <EdstTooltip title={Tooltips.altMenuPlanData}>
              <AltMenuRow hover selected={selected === "trial"} onMouseDown={() => setSelected("trial")} disabled={asel.window === EdstWindow.DEP}>
                TRIAL PLAN
              </AltMenuRow>
            </EdstTooltip>
            <EdstTooltip title={Tooltips.altMenuAmend}>
              <AltMenuRow hover selected={selected === "amend"} onMouseDown={() => setSelected("amend")}>
                AMEND
              </AltMenuRow>
            </EdstTooltip>
            <AltMenuRow>FP{entry.altitude}</AltMenuRow>
            <AltMenuRow disabled>UPLINK</AltMenuRow>
            <AltMenuRow disabled>
              <AltMenuRowCol>PD</AltMenuRowCol>
              <AltMenuRowCol>TFC</AltMenuRowCol>
              <AltMenuRowCol width="0.4ch">{UPLINK_SYMBOL}</AltMenuRowCol>
            </AltMenuRow>
            <AltMenuRow disabled>{asel.window !== EdstWindow.DEP ? "PROCEDURE" : "NO ALT"}</AltMenuRow>
            <AltMenuSelectContainer onWheel={handleScroll}>
              {_.range(30, -40, -10).map(i => {
                const centerAlt = (Number.isFinite(+entry.altitude) ? +entry.altitude : 200) - Math.round(deltaY / 100) * 10 + i;
                return (
                  <AltMenuScrollRow hover={selected === "amend" && tempAltHover === centerAlt} key={i}>
                    <AltMenuScrollCol selected={centerAlt === +entry.altitude} onMouseDown={() => handleAltClick(centerAlt)}>
                      {String(centerAlt).padStart(3, "0")}
                    </AltMenuScrollCol>
                    {asel.window !== EdstWindow.DEP && (
                      <EdstTooltip title={Tooltips.altMenuT}>
                        <AltMenuScrollTempAltCol
                          disabled={!(selected === "amend")}
                          onMouseEnter={() => selected === "amend" && setTempAltHover(centerAlt)}
                          onMouseLeave={() => selected === "amend" && setTempAltHover(null)}
                          onMouseDown={() => handleTempAltClick(centerAlt)}
                        >
                          T
                        </AltMenuScrollTempAltCol>
                      </EdstTooltip>
                    )}
                  </AltMenuScrollRow>
                );
              })}
            </AltMenuSelectContainer>
          </span>
        )}
      </AltMenuDiv>
    )
  );
};
