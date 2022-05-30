import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import { EdstTooltip } from "../resources/EdstTooltip";
import { Tooltips } from "../../tooltips";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { EdstMenu, EdstWindow } from "../../enums";
import { aselEntrySelector } from "../../redux/slices/entriesSlice";
import { aselSelector, Asel, closeMenu, menuPositionSelector, setInputFocused } from "../../redux/slices/appSlice";
import { LocalEdstEntry } from "../../types";
import { addTrialPlanThunk } from "../../redux/thunks/thunks";
import { amendEntryThunk } from "../../redux/thunks/entriesThunks";
import { NoSelectDiv } from "../../styles/styles";
import { edstFontYellow } from "../../styles/colors";
import { useCenterCursor } from "../../hooks";
import { PlanQuery } from "../../redux/slices/planSlice";

const AltMenuDiv = styled(NoSelectDiv)<{ width?: number; pos: { x: number; y: number } }>`
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

  ${props => props.color && { color: props.color }}
  &[disabled] {
    pointer-events: none;
    color: #adadad;
  }

  ${props =>
    props.hover && {
      "&:hover": {
        border: "1px solid #F0F0F0"
      }
    }}
  ${props =>
    props.selected && {
      border: "1px solid #FFFFFF",
      "background-color": "#AD6C6C"
    }}
  input {
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
    }}
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
    }}
  ${props =>
    props.selected && {
      "background-color": "#AD6C6C",
      color: "#D6D6D6"
    }}
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

type AltMenuProps = {
  setAltMenuInputRef: (ref: React.RefObject<HTMLInputElement> | null) => void;
  showInput: boolean;
};

export const AltMenu: React.FC<AltMenuProps> = ({ setAltMenuInputRef, showInput }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const asel = useRootSelector(aselSelector) as Asel;
  const entry = useRootSelector(aselEntrySelector) as LocalEdstEntry;
  const pos = useRootSelector(menuPositionSelector(EdstMenu.altitudeMenu));
  const dispatch = useRootDispatch();
  const [selected, setSelected] = useState(asel.window !== EdstWindow.dep ? "trial" : "amend");
  const [tempAltHover, setTempAltHover] = useState<number | null>(null);
  const [deltaY, setDeltaY] = useState(0);
  const [manualInput, setManualInput] = useState<string | null>(null);
  const [showInvalid, setShowInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useCenterCursor(ref, [asel]);

  useEffect(() => {
    setAltMenuInputRef(inputRef);
    return () => {
      dispatch(setInputFocused(false));
      setAltMenuInputRef(null);
    }; // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (manualInput === null && showInput) {
      setManualInput("");
      dispatch(setInputFocused(true));
    } // eslint-disable-next-line
  }, [showInput]);

  const handleAltClick = (alt: string | number) => {
    if (selected === "amend") {
      dispatch(amendEntryThunk({ cid: entry.cid, planData: { altitude: alt } }));
    } else {
      const trialPlanData = {
        cid: entry.cid,
        callsign: entry.callsign,
        planData: {
          altitude: alt,
          interim: null
        },
        queryType: PlanQuery.alt,
        msg: `AM ${entry.callsign} ALT ${alt}`
      };
      dispatch(addTrialPlanThunk(trialPlanData));
    }
    dispatch(closeMenu(EdstMenu.altitudeMenu));
  };

  const handleTempAltClick = (alt: number) => {
    if (selected === "amend") {
      dispatch(amendEntryThunk({ cid: entry.cid, planData: { interim: alt } }));
    } else {
      const trialPlanData = {
        cid: entry.cid,
        callsign: entry.callsign,
        planData: {
          interim: alt
        },
        queryType: PlanQuery.tempAlt,
        msg: `QQ /TT ${alt} ${entry?.callsign}`
      };
      dispatch(addTrialPlanThunk(trialPlanData));
    }
    dispatch(closeMenu(EdstMenu.altitudeMenu));
  };

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    const newDeltaY = Math.min(Math.max((Number(entry.altitude) - 560) * 10, deltaY + e.deltaY), (Number(entry.altitude) - 40) * 10);
    setDeltaY(newDeltaY);
  };

  return (
    pos &&
    asel && (
      <AltMenuDiv ref={ref} width={manualInput !== null ? 160 : 100} pos={pos} id="alt-menu">
        <AltMenuHeaderDiv>
          <AltMenuHeaderCol flexGrow={1}>{entry?.callsign}</AltMenuHeaderCol>
          <AltMenuHeaderCol width={20} onMouseDown={() => dispatch(closeMenu(EdstMenu.altitudeMenu))}>
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
                onChange={event => setManualInput(event.target.value.toUpperCase())}
                onKeyDownCapture={event => {
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
                onFocus={() => dispatch(setInputFocused(true))}
                onBlur={() => dispatch(setInputFocused(false))}
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
              <AltMenuRow hover selected={selected === "trial"} onMouseDown={() => setSelected("trial")} disabled={asel.window === EdstWindow.dep}>
                TRIAL PLAN
              </AltMenuRow>
            </EdstTooltip>
            <EdstTooltip title={Tooltips.altMenuAmend}>
              <AltMenuRow hover selected={selected === "amend"} onMouseDown={() => setSelected("amend")}>
                AMEND
              </AltMenuRow>
            </EdstTooltip>
            <AltMenuRow disabled>{asel.window !== EdstWindow.dep ? "PROCEDURE" : "NO ALT"}</AltMenuRow>
            <AltMenuSelectContainer onWheel={handleScroll}>
              {_.range(30, -40, -10).map(i => {
                const centerAlt = Number(entry.altitude) - Math.round(deltaY / 100) * 10 + i;
                return (
                  <AltMenuScrollRow hover={selected === "amend" && tempAltHover === centerAlt} key={`alt-${i}`}>
                    <AltMenuScrollCol selected={centerAlt === Number(entry.altitude)} onMouseDown={() => handleAltClick(centerAlt)}>
                      {String(centerAlt).padStart(3, "0")}
                    </AltMenuScrollCol>
                    {asel.window !== EdstWindow.dep && (
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
