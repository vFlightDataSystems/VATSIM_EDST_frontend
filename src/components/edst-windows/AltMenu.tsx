import React, {useContext, useEffect, useState} from 'react';
import _ from 'lodash';
import '../../css/header-styles.scss';
import '../../css/windows/alt-menu-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";
import {EdstWindowType} from '../../types';

export const AltMenu: React.FC<EdstWindowType> = ({pos, asel, closeWindow}) => {
  const {
    entries,
    trialPlan,
    amendEntry,
    setInputFocused
  } = useContext(EdstContext);
  const [dep, setDep] = useState(asel?.window === 'dep');
  const [selected, setSelected] = useState(asel?.window !== 'dep' ? 'trial' : 'amend');
  const [tempAltHover, setTempAltHover] = useState<number | null>(null);
  const [deltaY, setDeltaY] = useState(0);
  const [manualInput, setManualInput] = useState<string | null>(null);
  const [showInvalid, setShowInvalid] = useState(false);
  const entry = entries[asel.cid];

  useEffect(() => {
    setDep(asel?.window === 'dep');
    setSelected(asel.window !== 'dep' ? 'trial' : 'amend');
    setTempAltHover(null);
    setDeltaY(0);
  }, [asel]);

  const handleAltClick = (alt: string | number) => {
    if (selected === 'amend') {
      amendEntry(entry.cid, {altitude: alt});
    } else {
      const planData = {
        cid: entry.cid, callsign: entry.callsign, plan_data: {
          altitude: alt,
          interim: null
        },
        msg: `AM ${entry.cid} ALT ${alt}`
      };
      trialPlan(planData);
    }
    closeWindow();
  };

  const handleTempAltClick = (alt: number) => {
    if (selected === 'amend') {
      amendEntry(entry?.cid, {interim: alt});
    } else {
      const planData = {
        cid: entry.cid, callsign: entry.callsign, plan_data: {
          interim: alt
        },
        msg: `QQ /TT ${alt} ${entry?.cid}`
      };
      trialPlan(planData);
    }
    closeWindow();
  };

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    const newDeltaY = Math.min(Math.max((Number(entry.altitude) - 560) * 10, deltaY + e.deltaY), (Number(entry.altitude) - 40) * 10);
    setDeltaY(newDeltaY);
  };

  const handleKeyDown = () => {
    if (manualInput === null) {
      setManualInput('');
      setInputFocused(true);
      // setSelected('trial');
    }
  };

  return (<div
      className={`alt-menu no-select ${manualInput !== null ? 'manual-input' : ''}`}
      id="alt-menu"
      tabIndex={0}
      style={{left: pos.x, top: pos.y}}
      onKeyDown={handleKeyDown}
    >
      <div className={`alt-menu-header no-select`}
      >
        <div className="alt-menu-header-left">
          {entry?.callsign}
        </div>
        <div className="alt-menu-header-right"
             onMouseDown={closeWindow}
        >
          X
        </div>
      </div>
      {manualInput !== null ? <span>
        <div className="alt-menu-row">
        FP{entry.altitude}
      </div>
        <div className="alt-menu-row input-container">
          <input value={manualInput}
                 onChange={(event) => setManualInput(event.target.value.toUpperCase())}
                 onKeyDown={(event) => {
                   if (event.key === 'Enter') {
                     // check if input is number and length matches valid input
                     if (!_.isNumber(manualInput) && manualInput.length === 3) {
                       handleAltClick(manualInput);
                     } else {
                       setShowInvalid(true);
                     }
                   }
                 }}
                 onFocus={() => setInputFocused(true)}
            // onBlur={() => setInputFocused(false)}
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
            disabled={dep}
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
        {!dep ? 'PROCEDURE' : 'NO ALT'}
      </div>
      <div className="alt-menu-select-container"
           onWheel={handleScroll}
      >
        {_.range(30, -40, -10).map(i => {
          const alt = Number(entry.altitude) - (deltaY / 100 | 0) * 10 + i;
          return <div
            className={`alt-menu-container-row ${((selected === 'amend') && (tempAltHover === alt)) ? 'temp-alt-hover' : ''}`}
            key={`alt-${i}`}
          >
            <div className={`alt-menu-container-col ${alt === Number(entry.altitude) ? 'selected' : ''}`}
                 onMouseDown={() => handleAltClick(alt)}
            >
              {String(alt).padStart(3, '0')}
            </div>
            {!dep &&
            <EdstTooltip title={Tooltips.altMenuT}>
              <div className={`alt-menu-container-col-t`}
                // @ts-ignore
                   disabled={!(selected === 'amend')}
                   onMouseEnter={() => (selected === 'amend') && setTempAltHover(alt)}
                   onMouseLeave={() => (selected === 'amend') && setTempAltHover(null)}
                   onMouseDown={() => handleTempAltClick(alt)}>
                T
              </div>
            </EdstTooltip>}
          </div>;
        })}
      </div>
      </span>}
    </div>
  );
}