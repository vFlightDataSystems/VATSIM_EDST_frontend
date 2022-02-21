import React, {useEffect, useRef, useState} from 'react';
import _ from 'lodash';
import '../../css/header-styles.scss';
import '../../css/windows/alt-menu-styles.scss';
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {windowEnum} from "../../enums";
import {aselEntrySelector} from "../../redux/slices/entriesSlice";
import {
  aselSelector,
  AselType,
  closeWindow,
  setInputFocused,
  windowPositionSelector
} from "../../redux/slices/appSlice";
import {EdstEntryType} from "../../types";
import {amendEntryThunk} from "../../redux/asyncThunks";
import {addTrialPlanThunk} from "../../redux/thunks";

type AltMenuProps = {
  setAltMenuInputRef: (ref: React.RefObject<HTMLInputElement> | null) => void,
  showInput: boolean
}

export const AltMenu: React.FC<AltMenuProps> = ({setAltMenuInputRef, showInput}) => {
  const asel = useAppSelector(aselSelector) as AselType;
  const entry = useAppSelector(aselEntrySelector) as EdstEntryType;
  const pos = useAppSelector(windowPositionSelector(windowEnum.altitudeMenu));
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState(asel.window !== windowEnum.dep ? 'trial' : 'amend');
  const [tempAltHover, setTempAltHover] = useState<number | null>(null);
  const [deltaY, setDeltaY] = useState(0);
  const [manualInput, setManualInput] = useState<string | null>(null);
  const [showInvalid, setShowInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAltMenuInputRef(inputRef);
    return () => {
      dispatch(setInputFocused(false));
      setAltMenuInputRef(null);
    } // eslint-disable-next-line
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
        cid: entry.cid, callsign: entry.callsign, planData: {
          altitude: alt,
          interim: null
        },
        msg: `AM ${entry.cid} ALT ${alt}`
      };
      dispatch(addTrialPlanThunk(trialPlanData));
    }
    dispatch(closeWindow(windowEnum.altitudeMenu));
  };

  const handleTempAltClick = (alt: number) => {
    if (selected === 'amend') {
      dispatch(amendEntryThunk({cid: entry.cid, planData: {interim: alt}}));
    } else {
      const trialPlanData = {
        cid: entry.cid, callsign: entry.callsign, planData: {
          interim: alt
        },
        msg: `QQ /TT ${alt} ${entry?.cid}`
      };
      dispatch(addTrialPlanThunk(trialPlanData));
    }
    dispatch(closeWindow(windowEnum.altitudeMenu));
  };

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    const newDeltaY = Math.min(Math.max((Number(entry.altitude) - 560)*10, deltaY + e.deltaY), (Number(entry.altitude) - 40)*10);
    setDeltaY(newDeltaY);
  };

  return pos && asel && (<div
      className={`alt-menu no-select ${manualInput !== null ? 'manual-input' : ''}`}
      id="alt-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`alt-menu-header no-select`}
      >
        <div className="alt-menu-header-left">
          {entry?.callsign}
        </div>
        <div className="alt-menu-header-right"
             onMouseDown={() => dispatch(closeWindow(windowEnum.altitudeMenu))}
        >
          X
        </div>
      </div>
      {manualInput !== null ? <span>
        <div className="alt-menu-row">
        FP{entry.altitude}
      </div>
        <div className="alt-menu-row input-container">
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
        </div>
          {showInvalid && <div className="alt-menu-row invalid-input">
            INVALID
          </div>}
      </span> :
        <span>
        <EdstTooltip title={Tooltips.altMenuPlanData}>
          <div
            className={`alt-menu-row hover ${selected === 'trial' ? 'selected' : ''}`}
            onMouseDown={() => setSelected('trial')}
            // @ts-ignore
            disabled={asel.window === windowEnum.dep}
          >
            TRIAL PLAN
          </div>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.altMenuAmend}>
          <div className={`alt-menu-row hover ${selected === 'amend' ? 'selected' : ''}`}
               onMouseDown={() => setSelected('amend')}
          >
            AMEND
          </div>
        </EdstTooltip>
      <div className={`alt-menu-row`}
        // @ts-ignore
           disabled={true}>
        {(asel.window !== windowEnum.dep) ? 'PROCEDURE' : 'NO ALT'}
      </div>
      <div className="alt-menu-select-container"
           onWheel={handleScroll}
      >
        {_.range(30, -40, -10).map(i => {
          const centerAlt = Number(entry.altitude) - (deltaY/100 | 0)*10 + i;
          return <div
            className={`alt-menu-container-row ${((selected === 'amend') && (tempAltHover === centerAlt)) ? 'temp-alt-hover' : ''}`}
            key={`alt-${i}`}
          >
            <div className={`alt-menu-container-col ${centerAlt === Number(entry.altitude) ? 'selected' : ''}`}
                 onMouseDown={() => handleAltClick(centerAlt)}
            >
              {String(centerAlt).padStart(3, '0')}
            </div>
            {(asel.window !== windowEnum.dep) &&
            <EdstTooltip title={Tooltips.altMenuT}>
              <div className={`alt-menu-container-col-t`} // @ts-ignore
                   disabled={!(selected === 'amend')}
                   onMouseEnter={() => (selected === 'amend') && setTempAltHover(centerAlt)}
                   onMouseLeave={() => (selected === 'amend') && setTempAltHover(null)}
                   onMouseDown={() => handleTempAltClick(centerAlt)}>
                T
              </div>
            </EdstTooltip>}
          </div>;
        })}
      </div>
      </span>}
    </div>
  );
};