import React, {useContext, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {computeFrd} from "../../lib";
import {EdstButton} from "../resources/EdstButton";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {menuEnum, windowEnum} from "../../enums";
import {aselEntrySelector} from "../../redux/slices/entriesSlice";
import {aselSelector, closeMenu, menuPositionSelector, setInputFocused} from "../../redux/slices/appSlice";
import {openMenuThunk} from "../../redux/thunks/thunks";
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";

export const TemplateMenu: React.FC = () => {
  const {
    startDrag,
    stopDrag
  } = useContext(EdstContext);
  const dispatch = useAppDispatch();
  const asel = useAppSelector(aselSelector);
  const entry = useAppSelector(aselEntrySelector);
  const pos = useAppSelector(menuPositionSelector(menuEnum.templateMenu));
  const [focused, setFocused] = useState(false);
  // const [displayRawRoute, setDisplayRawRoute] = useState(false);
  const [route, setRoute] = useState((asel?.window === windowEnum.dep ? entry?.route : entry?._route?.replace(/^\.*/, '')) ?? '');
  const [frd, setFrd] = useState(entry?.referenceFix ? computeFrd(entry.referenceFix) : '');

  const [aidInput, setAidInput] = useState(entry?.callsign ?? '');
  const [numInput, setNumInput] = useState(entry ? 1 : '');
  const [saiInput, setSaiInput] = useState('');
  const [typeInput, setTypeInput] = useState(entry?.type ?? '');
  const [equipInput, setEquipInput] = useState(entry?.equipment ?? '');
  const [beaconInput, setBeaconInput] = useState(entry?.beacon ?? '');
  const [speedInput, setSpeedInput] = useState(entry?.flightplan?.ground_speed ?? '');
  const [frdInput, setFrdInput] = useState(frd);
  const [timeInput, setTimeInput] = useState('EXX00');
  const [altInput, setAltInput] = useState(entry?.altitude ?? '');
  const [routeInput, setRouteInput] = useState((asel?.window === windowEnum.dep ? entry?.dep + route : (frd ? frd + '..' : '') + route) ?? '');
  const [rmkInput, setRmkInput] = useState(entry?.remarks ?? '');

  const ref = useRef(null);

  // useEffect(() => {
  //   const route = (asel?.window === windowEnum.dep ? entry?.route : entry?._route?.replace(/^\.*/, '')) ?? '';
  //   const frd = entry?.reference_fix ? computeFrd(entry.reference_fix) : '';
  //   const aidInput = entry?.callsign ?? '';
  //   const typeInput = entry?.type ?? '';
  //   const equipInput = entry?.equipment ?? '';
  //   const beaconInput = entry?.beacon ?? '';
  //   const speedInput = entry?.flightplan?.ground_speed ?? '';
  //   const timeInput = 'EXX00';
  //   const altInput = entry?.altitude ?? '';
  //   const routeInput = (asel?.window === windowEnum.dep ? entry?.dep + route : (frd ? frd + '..' : '') + route) ??
  // ''; const rmkInput = entry?.remarks ?? ''; setDisplayRawRoute(false); setRoute(route); setFrd(frd);
  // setFrdInput(frd); setAidInput(aidInput); setNumInput(entry ? 1 : ''); setSaiInput(''); setTypeInput(typeInput);
  // setEquipInput(equipInput); setBeaconInput(beaconInput); setSpeedInput(speedInput); setTimeInput(timeInput);
  // setAltInput(altInput); setRouteInput(routeInput); setRmkInput(rmkInput); }, [asel, entry]);


  return pos && (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu template no-select"
      ref={ref}
      id="template-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref, menuEnum.templateMenu)}
           onMouseUp={(event) => stopDrag(event)}
      >
        {asel ? 'Amendment' : 'Flight Plan'} Menu
      </div>
      <div className="options-body template-body">
        <div className="template-row">
          <div className="template-col col-1 header">
            AID
          </div>
          <div className="template-col col-2 header">
            NUM
          </div>
          <div className="template-col col-3 header">
            SAI
          </div>
          <div className="template-col col-4 header">
            TYP
          </div>
          <div className="template-col col-5">
            <EdstButton content="EQP..."
                        onMouseDown={() => dispatch(openMenuThunk(menuEnum.equipmentTemplateMenu, ref.current))}
                        title={Tooltips.templateMenuEqpButton}
            />
          </div>
          <div className="template-col col-6 header">
            BCN
          </div>
          <div className="template-col col-7 header">
            SPD
          </div>
          <div className="template-col col-8 header">
            FIX
          </div>
          <div className="template-col col-9 header">
            TIM
          </div>
          <div className="template-col col-10 header">
            ALT
          </div>
          <div className="template-col">
            <EdstButton disabled={true} content="More..." title={Tooltips.templateMenuMore}/>
          </div>
        </div>
        <div className="template-row">
          <div className="template-col col-1">
            <EdstTooltip className="input-container" title={Tooltips.templateMenuAid}>
              <input
                value={aidInput}
                onChange={(event) => setAidInput(event.target.value.toUpperCase())}
                onFocus={() => dispatch(setInputFocused(true))}
                onBlur={() => dispatch(setInputFocused(false))}
              />
            </EdstTooltip>
          </div>
          <div className="template-col col-2">
            <EdstTooltip className="input-container" title={Tooltips.templateMenuNum}>
              <input
                value={numInput}
                onChange={(event) => setNumInput(event.target.value.toUpperCase())}
                onFocus={() => dispatch(setInputFocused(true))}
                onBlur={() => dispatch(setInputFocused(false))}
              />
            </EdstTooltip>
          </div>
          <div className="template-col col-3">
            <EdstTooltip className="input-container" title={Tooltips.templateMenuSai}>
              <input
                value={saiInput}
                onChange={(event) => setSaiInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </EdstTooltip>
          </div>
          <div className="template-col col-4">
            <EdstTooltip className="input-container" title={Tooltips.templateMenuTyp}>
              <input
                value={typeInput}
                onChange={(event) => setTypeInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </EdstTooltip>
          </div>
          <div className="template-col col-5">
            <EdstTooltip className="input-container" title={Tooltips.templateMenuEqpBox}>
              <input
                value={equipInput}
                onChange={(event) => setEquipInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </EdstTooltip>
          </div>
          <div className="template-col col-6">
            <EdstTooltip className="input-container" title={Tooltips.templateMenuBcn}>
              <input
                value={beaconInput}
                onChange={(event) => setBeaconInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </EdstTooltip>
          </div>
          <div className="template-col col-7">
            <EdstTooltip className="input-container" title={Tooltips.templateMenuSpd}>
              <input
                value={speedInput}
                onChange={(event) => setSpeedInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </EdstTooltip>
          </div>
          <div className="template-col col-8">
            <EdstTooltip className="input-container" title={Tooltips.templateMenuFix}>
              <input
                value={frdInput}
                onChange={(event) => setFrdInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </EdstTooltip>
          </div>
          <div className="template-col col-9">
            <EdstTooltip className="input-container" title={Tooltips.templateMenuTim}>
              <input
                value={timeInput}
                onChange={(event) => setTimeInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </EdstTooltip>
          </div>
          <div className="template-col col-10">
            <EdstTooltip className="input-container" title={Tooltips.templateMenuAlt}>
              <input
                value={altInput}
                onChange={(event) => setAltInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </EdstTooltip>
          </div>
        </div>
        <div className="template-row">
          <div className="template-col col-1 header">
            RTE
          </div>
        </div>
        <div className="template-row">
          <EdstTooltip className="template-col input-container" title={Tooltips.templateMenuRte}>
            <textarea
              value={routeInput}
              onChange={(event) => setRouteInput(event.target.value.toUpperCase())}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              rows={3}
            />
          </EdstTooltip>
        </div>
        <div className="template-row">
          <div className="template-col col-1 header">
            RMK
          </div>
          <div className="template-col right"/>
          <div className="template-col">
            <EdstButton disabled={true} content="Create FP..." title={Tooltips.templateMenuCreateFp}/>
          </div>
        </div>
        <div className="template-row">
          <EdstTooltip className="template-col input-container" title={Tooltips.templateMenuRmk}>
            <textarea
              value={rmkInput}
              onChange={(event) => setRmkInput(event.target.value.toUpperCase())}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              rows={3}
            />
          </EdstTooltip>
        </div>
        <div className="template-row">
          <div className="template-col bottom">
            <EdstButton disabled={true} content="Send" title={Tooltips.templateMenuSend}/>
          </div>
          <div className="template-col bottom right">
            <EdstButton className="exit-button" content="Exit" title={Tooltips.templateMenuExit}
                        onMouseDown={() => dispatch(closeMenu(menuEnum.templateMenu))}/>
          </div>
        </div>
      </div>
    </div>
  );
};
