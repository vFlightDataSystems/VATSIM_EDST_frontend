import React, { useRef, useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import { useEventListener } from "usehooks-ts";
import { EdstTooltip } from "../resources/EdstTooltip";
import { Tooltips } from "../../tooltips";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aselEntrySelector } from "../../redux/slices/entriesSlice";
import { aselSelector, closeWindow, windowPositionSelector } from "../../redux/slices/appSlice";
import { Flightplan, WindowPosition } from "../../types";
import { addTrialPlanThunk } from "../../redux/thunks/thunks";
import { NoSelectDiv } from "../../styles/styles";
import { edstFontGrey, edstFontYellow } from "../../styles/colors";
import { useCenterCursor } from "../../hooks/utils";
import { TrialPlan } from "../../redux/slices/planSlice";
import { formatAltitude } from "../../lib";
import { useHub } from "../../hooks/hub";
import { EdstWindow } from "../../namespaces";

const AltMenuDiv = styled(NoSelectDiv)<{ width?: number; pos: WindowPosition }>`
  z-index: 11000;
  background-color: #888888;
  position: fixed;
  width: ${props => (props.width ? `${props.width}px` : "100px")};
  color: #d6d6d6;

  ${props => ({ left: `${props.pos.x}px`, top: `${props.pos.y}px` })}
`;

const AltMenuHeaderDiv = styled.div`
  display: flex;
  height: 20px;
`;

const AltMenuHeaderCol = styled.div<{ flexGrow?: number; width?: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #adadad;
  width: ${props => (props.width ? `${props.width}px` : "auto")};
  flex-grow: ${props => props.flexGrow ?? 0};

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

const AltMenuRow = styled.div<{ bgBlack?: boolean; color?: string; hover?: boolean; selected?: boolean; disabled?: boolean }>`
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
    font-size: 16px;
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
  display: flex;
  padding-left: 4px;
  padding-right: 4px;
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

export const AltMenu: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);
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
  const hubConnection = useHub();

  useCenterCursor(ref, [asel]);

  const handleAltClick = (alt: string | number) => {
    const amendedFlightplan: Flightplan = { ...entry, altitude: String(Number(alt) * 100) };
    if (selected === "amend") {
      if (hubConnection) {
        hubConnection.invoke("AmendFlightPlan", amendedFlightplan).catch(e => console.log("error amending flightplan:", e));
      }
    } else {
      const trialPlanData: TrialPlan = {
        cid: entry.cid,
        aircraftId: entry.aircraftId,
        amendedFlightplan,
        commandString: `AM ${entry.aircraftId} ALT ${alt}`,
        expirationTime: new Date().getTime() / 1000 + 120
      };
      dispatch(addTrialPlanThunk(trialPlanData));
    }
    dispatch(closeWindow(EdstWindow.ALTITUDE_MENU));
  };

  const handleTempAltClick = (alt: number) => {
    // dispatch(addTrialPlanThunk(trialPlanData));
    dispatch(closeWindow(EdstWindow.ALTITUDE_MENU));
  };

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    const newDeltaY = Math.min(
      Math.max((Number(formatAltitude(entry.altitude)) - 560) * 10, deltaY + e.deltaY),
      (Number(formatAltitude(entry.altitude)) - 40) * 10
    );
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
      <AltMenuDiv ref={ref} width={manualInput !== null ? 160 : 100} pos={pos} id="alt-menu">
        <AltMenuHeaderDiv>
          <AltMenuHeaderCol flexGrow={1}>{entry?.aircraftId}</AltMenuHeaderCol>
          <AltMenuHeaderCol width={20} onMouseDown={() => dispatch(closeWindow(EdstWindow.ALTITUDE_MENU))}>
            X
          </AltMenuHeaderCol>
        </AltMenuHeaderDiv>
        {manualInput !== null && (
          <span>
            <AltMenuRow>FP{Number(formatAltitude(entry.altitude))}</AltMenuRow>
            <AltMenuRow bgBlack>
              <input
                tabIndex={0}
                ref={inputRef}
                value={manualInput}
                onChange={event => setManualInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === "Enter") {
                    // check if input is a number and length matches valid input
                    // +"string" will convert the string to a number or NaN
                    // it is called the unary plus operator
                    const numberInput = +manualInput;
                    if (_.isFinite(numberInput) && numberInput > 10 && numberInput < 590 && manualInput.length === 3) {
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
            <AltMenuRow disabled>{asel.window !== EdstWindow.DEP ? "PROCEDURE" : "NO ALT"}</AltMenuRow>
            <AltMenuSelectContainer onWheel={handleScroll}>
              {_.range(30, -40, -10).map(i => {
                const centerAlt = Number(formatAltitude(entry.altitude)) - Math.round(deltaY / 100) * 10 + i;
                return (
                  <AltMenuScrollRow hover={selected === "amend" && tempAltHover === centerAlt} key={`alt-${i}`}>
                    <AltMenuScrollCol selected={centerAlt === Number(formatAltitude(entry.altitude))} onMouseDown={() => handleAltClick(centerAlt)}>
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
