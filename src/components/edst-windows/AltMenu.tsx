import React, {useEffect, useRef, useState} from 'react';
import _ from 'lodash';
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {menuEnum, windowEnum} from "../../enums";
import {aselEntrySelector} from "../../redux/slices/entriesSlice";
import {
  aselSelector,
  AselType, closeMenu,
  menuPositionSelector,
  setInputFocused,
} from "../../redux/slices/appSlice";
import {LocalEdstEntryType} from "../../types";
import {addTrialPlanThunk} from "../../redux/thunks/thunks";
import {amendEntryThunk} from "../../redux/thunks/entriesThunks";
import styled from "styled-components";
import {NoSelectDiv} from "../../styles/styles";
import {edstFontYellow} from "../../styles/colors";
import {useCenterCursor} from "../../hooks";
import {PlanQueryType} from "../../redux/slices/planSlice";

const AltMenuDiv = styled(NoSelectDiv)<{ width?: number, pos: { x: number, y: number } }>`
  z-index: 11000;
  background-color: #888888;
  position: absolute;
  width: ${props => props.width ? props.width + 'px' : '100px'};
  color: #D6D6D6;

  ${props => ({ left: props.pos.x + 'px', top: props.pos.y + 'px' })}
`;

const AltMenuHeaderDiv = styled.div`
  display: flex;
  height: 20px;
`;

const AltMenuHeaderCol = styled.div<{ flexGrow?: number, width?: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ADADAD;
  width: ${props => props.width ? props.width + 'px' : 'auto'};
  flex-grow: ${props => props.flexGrow ?? 0};

  &:hover {
    border: 1px solid #F0F0F0;
  }
`;

const AltMenuSelectContainer = styled.div`
  padding: 2px;
  display: flex;
  flex-flow: column;
  background-color: #000000;
  border: 1px solid #ADADAD;
`;

const AltMenuRow = styled.div<{ bgBlack?: boolean, color?: string, hover?: boolean, selected?: boolean }>`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  border: 1px solid #ADADAD;
  ${props => props.bgBlack && {'background-color': '#000000'}};

  ${props => props.color && {color: props.color}}
  &[disabled] {
    pointer-events: none;
    color: #ADADAD;
  }

  ${props => props.hover && {
    "&:hover": {
      border: "1px solid #F0F0F0"
    }
  }}
  ${props => props.selected && {
    "border": "1px solid #FFFFFF",
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
  color: #ADADAD;
  /*border: none;*/
  border: 1px solid #000000;

  ${props => props.hover && {
    "&:hover": {
      border: "1px solid #F0F0F0"
    }
  }}
`;

const AltMenuScrollCol = styled.div<{ tempAlt?: boolean, borderHover?: boolean, selected?: boolean }>`
  display: flex;
  padding-left: 4px;
  padding-right: 4px;
  justify-content: left;
  align-items: center;
  color: #ADADAD;
  //border: 1px solid #000000;
  &:hover {
    outline: 1px solid #F0F0F0;
  }

  ${props => props.borderHover && {
    "&:hover": {
      border: "1px solid #F0F0F0"
    }
  }}
  ${props => props.selected && {
    "background-color": "#AD6C6C",
    "color": "#D6D6D6"
  }}
`;

const AltMenuScrollTempAltCol = styled.div`
  display: flex;
  /*margin-left: 6px;*/
  padding-left: 8px;
  padding-right: 2px;
  justify-content: left;
  align-items: center;
  /*height: 10px;*/
  color: #ADADAD;

  &[disabled] {
    pointer-events: none;
    color: #575757;
  }
`;

type AltMenuProps = {
  setAltMenuInputRef: (ref: React.RefObject<HTMLInputElement> | null) => void,
  showInput: boolean
}

export const AltMenu: React.FC<AltMenuProps> = ({setAltMenuInputRef, showInput}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const asel = useAppSelector(aselSelector) as AselType;
  const entry = useAppSelector(aselEntrySelector) as LocalEdstEntryType;
  const pos = useAppSelector(menuPositionSelector(menuEnum.altitudeMenu));
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState(asel.window !== windowEnum.dep ? 'trial' : 'amend');
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
      setManualInput('');
      dispatch(setInputFocused(true));
    } // eslint-disable-next-line
  }, [showInput]);

  const handleAltClick = (alt: string | number) => {
    if (selected === 'amend') {
      dispatch(amendEntryThunk({cid: entry.cid, planData: {altitude: alt}}));
    } else {
      const trialPlanData = {
        cid: entry.cid,
        callsign: entry.callsign,
        planData: {
          altitude: alt,
          interim: null
        },
        queryType: PlanQueryType.alt,
        msg: `AM ${entry.callsign} ALT ${alt}`
      };
      dispatch(addTrialPlanThunk(trialPlanData));
    }
    dispatch(closeMenu(menuEnum.altitudeMenu));
  };

  const handleTempAltClick = (alt: number) => {
    if (selected === 'amend') {
      dispatch(amendEntryThunk({cid: entry.cid, planData: {interim: alt}}));
    } else {
      const trialPlanData = {
        cid: entry.cid,
        callsign: entry.callsign,
        planData: {
          interim: alt
        },
        queryType: PlanQueryType.tempAlt,
        msg: `QQ /TT ${alt} ${entry?.callsign}`
      };
      dispatch(addTrialPlanThunk(trialPlanData));
    }
    dispatch(closeMenu(menuEnum.altitudeMenu));
  };

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    const newDeltaY = Math.min(Math.max((Number(entry.altitude) - 560) * 10, deltaY + e.deltaY), (Number(entry.altitude) - 40) * 10);
    setDeltaY(newDeltaY);
  };

  return pos && asel && (<AltMenuDiv
      ref={ref}
      width={manualInput !== null ? 160 : 100}
      pos={pos}
      id="alt-menu"
    >
      <AltMenuHeaderDiv>
        <AltMenuHeaderCol flexGrow={1}>
          {entry?.callsign}
        </AltMenuHeaderCol>
        <AltMenuHeaderCol width={20} onMouseDown={() => dispatch(closeMenu(menuEnum.altitudeMenu))}>
          X
        </AltMenuHeaderCol>
      </AltMenuHeaderDiv>
      {manualInput !== null && <span>
        <AltMenuRow>
        FP{entry.altitude}
      </AltMenuRow>
        <AltMenuRow bgBlack={true}>
          <input
              tabIndex={0}
              ref={inputRef}
              value={manualInput}
              onChange={(event) => setManualInput(event.target.value.toUpperCase())}
              onKeyDownCapture={(event) => {
                if (event.key === 'Enter') {
                  // check if input is a number and length matches valid input
                  // +"string" will convert the string to a number or NaN
                  // it is called the unary plus operator
                  const numberInput = +manualInput;
                  if (_.isFinite(numberInput) && 10 < numberInput && numberInput < 590 && manualInput.length === 3) {
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
        {showInvalid && <AltMenuRow bgBlack={true} color={edstFontYellow}>
            INVALID
        </AltMenuRow>}
      </span>}
      {manualInput === null && <span>
        <EdstTooltip title={Tooltips.altMenuPlanData}>
          <AltMenuRow
              hover={true}
              selected={selected === 'trial'}
              onMouseDown={() => setSelected('trial')}
            // @ts-ignore
              disabled={asel.window === windowEnum.dep}
          >
            TRIAL PLAN
          </AltMenuRow>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.altMenuAmend}>
          <AltMenuRow hover={true}
                      selected={selected === 'amend'}
                      onMouseDown={() => setSelected('amend')}
          >
            AMEND
          </AltMenuRow>
        </EdstTooltip>
      <AltMenuRow // @ts-ignore
          disabled={true}>
        {(asel.window !== windowEnum.dep) ? 'PROCEDURE' : 'NO ALT'}
      </AltMenuRow>
      <AltMenuSelectContainer onWheel={handleScroll}>
        {_.range(30, -40, -10).map(i => {
          const centerAlt = Number(entry.altitude) - (deltaY / 100 | 0) * 10 + i;
          return <AltMenuScrollRow
            hover={(selected === 'amend') && (tempAltHover === centerAlt)}
            key={`alt-${i}`}
          >
            <AltMenuScrollCol selected={centerAlt === Number(entry.altitude)}
                              onMouseDown={() => handleAltClick(centerAlt)}
            >
              {String(centerAlt).padStart(3, '0')}
            </AltMenuScrollCol>
            {(asel.window !== windowEnum.dep) &&
                <EdstTooltip title={Tooltips.altMenuT}>
                    <AltMenuScrollTempAltCol // @ts-ignore
                        disabled={!(selected === 'amend')}
                        onMouseEnter={() => (selected === 'amend') && setTempAltHover(centerAlt)}
                        onMouseLeave={() => (selected === 'amend') && setTempAltHover(null)}
                        onMouseDown={() => handleTempAltClick(centerAlt)}>
                        T
                    </AltMenuScrollTempAltCol>
                </EdstTooltip>}
          </AltMenuScrollRow>;
        })}
      </AltMenuSelectContainer>
      </span>}
    </AltMenuDiv>
  );
};
