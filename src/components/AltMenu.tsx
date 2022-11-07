import React, { useRef, useState } from "react";
import _ from "lodash";
import type { CSSProperties } from "styled-components";
import styled from "styled-components";
import { useEventListener } from "usehooks-ts";
import { Tooltips } from "~/tooltips";
import type { WindowPosition } from "types/windowPosition";
import { EdstTooltip } from "components/utils/EdstTooltip";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import type { Nullable } from "types/utility-types";
import { colors } from "~/edstTheme";
import { borderHover } from "styles/styles";
import { aselSelector, closeWindow, windowPositionSelector } from "~redux/slices/appSlice";
import { NoSelectDiv } from "styles/NoSelectDiv";
import { addPlanThunk } from "~redux/thunks/addPlanThunk";
import { useCenterCursor } from "hooks/useCenterCursor";
import { EdstWindow } from "enums/edstWindow";
import { useHubActions } from "hooks/useHubActions";
import { ALTITUDE_VALIDATION_EXPRESSIONS, DOWNLINK_SYMBOL } from "~/utils/constants";
import type { Plan } from "types/plan";

type AltMenuDivProps = { width: CSSProperties["width"]; pos: WindowPosition };
const AltMenuDiv = styled(NoSelectDiv)<AltMenuDivProps>`
  z-index: 11000;
  background-color: #888888;
  position: fixed;
  width: ${(props) => props.width};
  color: #d6d6d6;
  ${(props) => ({
    left: `${props.pos.left}px`,
    top: `${props.pos.top}px`,
  })};
`;

const AltMenuHeaderDiv = styled.div`
  display: flex;
  height: 20px;
`;
type AltMenuHeaderColProps = Partial<Pick<CSSProperties, "flexGrow" | "width">>;
const AltMenuHeaderCol = styled.div<AltMenuHeaderColProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #adadad;
  width: ${(props) => props.width ?? "auto"};
  flex-grow: ${(props) => props.flexGrow ?? 0};

  ${borderHover}
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
  color?: CSSProperties["color"];
  hover?: boolean;
  selected?: boolean;
  disabled?: boolean;
};

const AltMenuRow = styled(EdstTooltip)<AltMenuRowProps>`
  min-height: 1em;
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  border: 1px solid #adadad;
  ${(props) => props.bgBlack && { "background-color": "#000000" }};
  ${(props) => props.color && { color: props.color }};
  &[disabled] {
    pointer-events: none;
    color: #adadad;
  }
  ${(props) => props.hover && borderHover};
  ${(props) =>
    props.selected && {
      border: "1px solid #FFFFFF",
      "background-color": "#AD6C6C",
    }};
`;
const AltMenuManualInput = styled.input.attrs(() => ({ spellCheck: false }))`
  font-size: ${(props) => props.theme.fontProps.inputFontSize};
  outline: none;
  display: flex;
  overflow: hidden;
  color: ${(props) => props.theme.colors.grey};
  resize: none;
  text-transform: uppercase;
  background-color: #000000;
  //height: 16px;
  width: 100%;
  border: none;
`;
type AltMenuRowColProps = {
  width?: CSSProperties["width"];
  disabled?: boolean;
};
const AltMenuRowCol = styled.div<AltMenuRowColProps>`
  height: 100%;
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  border-left: 1px solid #adadad;
  border-right: 1px solid #adadad;
  &[disabled] {
    pointer-events: none;
    color: #adadad;
  }
  padding: 0;
  width: ${(props) => props.width ?? "auto"};
`;
type AltMenuScrollRowProps = { hover?: boolean };
const AltMenuScrollRow = styled.div<AltMenuScrollRowProps>`
  max-width: 5.5ch;
  display: flex;
  margin: 1px 6px;
  height: 1em;
  color: #adadad;
  /*border: none;*/
  border: 1px solid #000000;

  ${(props) => props.hover && borderHover};
`;
type AltMenuScrollColProps = {
  tempAlt?: boolean;
  borderHover?: boolean;
  selected?: boolean;
};
const AltMenuScrollCol = styled.div<AltMenuScrollColProps>`
  padding: 0 2px;
  display: flex;
  justify-content: left;
  align-items: center;
  color: #adadad;
  //border: 1px solid #000000;
  &:hover {
    outline: 1px solid #f0f0f0;
  }

  ${(props) => props.borderHover && borderHover};
  ${(props) =>
    props.selected && {
      "background-color": "#AD6C6C",
      color: "#D6D6D6",
    }};
`;
type AltMenuScrollTempAltColProps = { disabled?: boolean };
const AltMenuScrollTempAltCol = styled(EdstTooltip)<AltMenuScrollTempAltColProps>`
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
  return Object.values(ALTITUDE_VALIDATION_EXPRESSIONS).some((regex) => regex.test(input));
}

export const AltMenu = () => {
  const ref = useRef<HTMLDivElement>(null);
  const asel = useRootSelector(aselSelector)!;
  const entry = useRootSelector(aselEntrySelector)!;
  const pos = useRootSelector((state) => windowPositionSelector(state, EdstWindow.ALTITUDE_MENU));
  const dispatch = useRootDispatch();
  const [selected, setSelected] = useState(asel.window !== EdstWindow.DEP ? "trial" : "amend");
  const [tempAltHover, setTempAltHover] = useState<Nullable<number>>(null);
  const [deltaY, setDeltaY] = useState(0);
  const [manualInput, setManualInput] = useState<Nullable<string>>(null);
  const [showInvalid, setShowInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { amendFlightplan } = useHubActions();

  const assignedAltitude = Number.isFinite(+entry.altitude) ? +entry.altitude : 200;

  useCenterCursor(ref, [asel.aircraftId]);

  const handleAltClick = (alt: string | number) => {
    const amendedFlightplan = {
      ...entry,
      altitude: alt.toString().toUpperCase(),
    };
    if (selected === "amend") {
      amendFlightplan(amendedFlightplan).then();
    } else {
      const trialPlanData: Plan = {
        cid: entry.cid,
        aircraftId: entry.aircraftId,
        amendedFlightplan,
        commandString: `AM ${entry.aircraftId} ALT ${alt}`,
        expirationTime: new Date().getTime() / 1000 + 120,
      };
      dispatch(addPlanThunk(trialPlanData));
    }
    dispatch(closeWindow(EdstWindow.ALTITUDE_MENU));
  };

  const handleTempAltClick = (alt: number) => {
    // dispatch(addTrialPlanThunk(trialPlanData));
    dispatch(closeWindow(EdstWindow.ALTITUDE_MENU));
  };

  const handleScroll: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const newDeltaY = Math.min(Math.max((assignedAltitude - 560) * 10, deltaY + e.deltaY), (assignedAltitude - 40) * 10);
    setDeltaY(newDeltaY);
  };

  const keyDownHandler = (event: KeyboardEvent) => {
    if (manualInput === null && event.key.length === 1) {
      setManualInput(event.key);
    }
    if (!(document.activeElement === inputRef.current) && inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEventListener("keydown", keyDownHandler);

  const centerAlt = Math.max(40, Math.min(560, (Number.isFinite(+entry.altitude) ? +entry.altitude : 200) - Math.round(deltaY / 100) * 10));

  return (
    pos &&
    asel && (
      <AltMenuDiv ref={ref} width={manualInput !== null ? "auto" : "11ch"} pos={pos} id="alt-menu">
        <AltMenuHeaderDiv>
          <AltMenuHeaderCol flexGrow={1}>{entry?.aircraftId}</AltMenuHeaderCol>
          <AltMenuHeaderCol width="1.6ch" onMouseDown={() => dispatch(closeWindow(EdstWindow.ALTITUDE_MENU))}>
            X
          </AltMenuHeaderCol>
        </AltMenuHeaderDiv>
        {manualInput !== null && (
          <>
            <AltMenuRow>FP{entry.altitude}</AltMenuRow>
            <AltMenuRow bgBlack>
              <AltMenuManualInput
                tabIndex={0}
                ref={inputRef}
                value={manualInput}
                onChange={(event) => setManualInput(event.target.value)}
                onKeyDown={(event) => {
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
              <AltMenuRow bgBlack color={colors.yellow}>
                INVALID
              </AltMenuRow>
            )}
          </>
        )}
        {manualInput === null && (
          <>
            <AltMenuRow
              title={Tooltips.altMenuPlanData}
              hover
              selected={selected === "trial"}
              onMouseDown={() => setSelected("trial")}
              disabled={asel.window === EdstWindow.DEP}
            >
              TRIAL PLAN
            </AltMenuRow>
            <AltMenuRow title={Tooltips.altMenuAmend} hover selected={selected === "amend"} onMouseDown={() => setSelected("amend")}>
              AMEND
            </AltMenuRow>
            <AltMenuRow>FP{entry.altitude}</AltMenuRow>
            <AltMenuRow disabled>UPLINK</AltMenuRow>
            <AltMenuRow disabled>
              <AltMenuRowCol>PD</AltMenuRowCol>
              <AltMenuRowCol>TFC</AltMenuRowCol>
              <AltMenuRowCol width="0.4ch">{DOWNLINK_SYMBOL}</AltMenuRowCol>
            </AltMenuRow>
            <AltMenuRow disabled>{asel.window !== EdstWindow.DEP ? "PROCEDURE" : "NO ALT"}</AltMenuRow>
            <AltMenuSelectContainer onWheel={handleScroll}>
              {_.range(30, -40, -10).map((i) => {
                const alt = centerAlt + i;
                return (
                  <AltMenuScrollRow hover={selected === "amend" && tempAltHover === alt} key={i}>
                    <AltMenuScrollCol selected={alt === +entry.altitude} onMouseDown={() => handleAltClick(alt)}>
                      {alt.toString().padStart(3, "0")}
                    </AltMenuScrollCol>
                    {asel.window !== EdstWindow.DEP && (
                      <AltMenuScrollTempAltCol
                        title={Tooltips.altMenuT}
                        disabled={!(selected === "amend")}
                        onMouseEnter={() => selected === "amend" && setTempAltHover(alt)}
                        onMouseLeave={() => selected === "amend" && setTempAltHover(null)}
                        onMouseDown={() => handleTempAltClick(alt)}
                      >
                        T
                      </AltMenuScrollTempAltCol>
                    )}
                  </AltMenuScrollRow>
                );
              })}
            </AltMenuSelectContainer>
          </>
        )}
      </AltMenuDiv>
    )
  );
};
