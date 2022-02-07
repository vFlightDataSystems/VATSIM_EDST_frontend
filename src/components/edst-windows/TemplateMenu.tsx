import React, {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {computeFrd} from "../../lib";
import {EdstButton} from "../resources/EdstButton";
import {EdstEntryProps} from "../../types";

interface TemplateMenuProps {
  pos: {x: number, y: number};
  closeWindow: () => void;
}

export const TemplateMenu: React.FC<TemplateMenuProps> = ({pos, closeWindow}) => {
  const {
    edst_data,
    asel,
    startDrag,
    stopDrag,
    setInputFocused
  } = useContext(EdstContext);
  const [dep, setDep] = useState(asel?.window === 'dep');
  const [entry, setEntry] = useState<EdstEntryProps | null>(asel?.cid ? edst_data[asel.cid] : null);
  const [focused, setFocused] = useState(false);
  const [display_raw_route, setDisplayRawRoute] = useState(false);
  const [route, setRoute] = useState((dep ? entry?.route : entry?._route?.replace(/^\.*/, '')) ?? '');
  const [frd, setFrd] = useState(entry?.reference_fix ? computeFrd(entry.reference_fix) : '');

  const [aid_input, setAidInput] = useState(entry?.callsign ?? '');
  const [num_input, setNumInput] = useState(entry ? 1 : '');
  const [sai_input, setSaiInput] = useState('');
  const [type_input, setTypeInput] = useState(entry?.type ?? '');
  const [equip_input, setEquipInput] = useState(entry?.equipment ?? '');
  const [beacon_input, setBeaconInput] = useState(entry?.beacon ?? '');
  const [speed_input, setSpeedInput] = useState(entry?.flightplan?.ground_speed ?? '');
  const [frd_input, setFrdInput] = useState(frd);
  const [time_input, setTimeInput] = useState('EXX00');
  const [alt_input, setAltInput] = useState(entry?.altitude ?? '');
  const [route_input, setRouteInput] = useState((dep ? entry?.dep + route : (frd ? frd + '..' : '') + route) ?? '');
  const [rmk_input, setRmkInput] = useState(entry?.remarks ?? '');

  const ref = useRef(null);

  useEffect(() => {
    const dep = asel?.window === 'dep';
    const entry = asel?.cid ? edst_data[asel.cid] : null;
    const route = (dep ? entry?.route : entry?._route?.replace(/^\.*/, '')) ?? '';
    const frd = entry?.reference_fix ? computeFrd(entry.reference_fix) : '';
    const aid_input = entry?.callsign ?? '';
    const type_input = entry?.type ?? '';
    const equip_input = entry?.equipment ?? '';
    const beacon_input = entry?.beacon ?? '';
    const speed_input = entry?.flightplan?.ground_speed ?? '';
    const time_input = 'EXX00';
    const alt_input = entry?.altitude ?? '';
    const route_input = (dep ? entry?.dep + route : (frd ? frd + '..' : '') + route) ?? '';
    const rmk_input = entry?.remarks ?? '';
    setDep(dep);
    setEntry(entry);
    setDisplayRawRoute(false);
    setRoute(route);
    setFrd(frd);
    setFrdInput(frd);
    setAidInput(aid_input);
    setNumInput(entry ? 1 : '');
    setSaiInput('');
    setTypeInput(type_input);
    setEquipInput(equip_input);
    setBeaconInput(beacon_input);
    setSpeedInput(speed_input);
    setTimeInput(time_input);
    setAltInput(alt_input);
    setRouteInput(route_input);
    setRmkInput(rmk_input);
  }, [asel, edst_data]);


  return (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu template no-select"
      ref={ref}
      id="template-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref)}
           onMouseUp={(event) => stopDrag(event)}
      >
        {asel ? 'Amendment' : 'Flight Plan'} Menu
      </div>
      <div className="options-body template-body">
        <div className="template-row">
          <div className="template-col col-6">
            AID
          </div>
          <div className="template-col">
            NUM
          </div>
          <div className="template-col">
            SAI
          </div>
          <div className="template-col col-5">
            TYP
          </div>
          <div className="template-col col-6">
            <EdstButton disabled={true} content="EQP..."/>
          </div>
          <div className="template-col col-5">
            BCN
          </div>
          <div className="template-col col-1">
            SPD
          </div>
          <div className="template-col col-8">
            FIX
          </div>
          <div className="template-col col-2">
            TIM
          </div>
          <div className="template-col">
            ALT
          </div>
          <div className="template-col right">
            <EdstButton disabled={true} content="MORE..."/>
          </div>
        </div>
        <div className="template-row">
          <div className="template-col col-6 input-col">
            <div className="input-container">
              <input
                value={aid_input}
                onChange={(event) => setAidInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </div>
          </div>
          <div className="template-col input-col">
            <div className="input-container">
              <input
                value={num_input}
                onChange={(event) => setNumInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </div>
          </div>
          <div className="template-col input-col">
            <div className="input-container">
              <input
                value={sai_input}
                onChange={(event) => setSaiInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </div>
          </div>
          <div className="template-col col-5 input-col">
            <div className="input-container">
              <input
                value={type_input}
                onChange={(event) => setTypeInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </div>
          </div>
          <div className="template-col col-6 input-col">
            <div className="input-container">
              <input
                value={equip_input}
                onChange={(event) => setEquipInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </div>
          </div>
          <div className="template-col col-5 input-col">
            <div className="input-container">
              <input
                value={beacon_input}
                onChange={(event) => setBeaconInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </div>
          </div>
          <div className="template-col col-1 input-col">
            <div className="input-container">
              <input
                value={speed_input}
                onChange={(event) => setSpeedInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </div>
          </div>
          <div className="template-col col-8 input-col">
            <div className="input-container">
              <input
                value={frd_input}
                onChange={(event) => setFrdInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </div>
          </div>
          <div className="template-col col-2 input-col">
            <div className="input-container">
              <input
                value={time_input}
                onChange={(event) => setTimeInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </div>
          </div>
          <div className="template-col input-col col-7">
            <div className="input-container">
              <input
                value={alt_input}
                onChange={(event) => setAltInput(event.target.value.toUpperCase())}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </div>
          </div>
        </div>
        <div className="template-row">
          <div className="template-col">
            RTE
          </div>
        </div>
        <div className="template-row">
          <div className="input-container">
            <textarea
              value={route_input}
              onChange={(event) => setRouteInput(event.target.value.toUpperCase())}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              rows={3}
            />
          </div>
        </div>
        <div className="template-row">
          <div className="template-col">
            RMK
          </div>
          <div className="template-col right">
            <EdstButton disabled={true} content="Create FP..."/>
          </div>
        </div>
        <div className="template-row">
          <div className="input-container">
            <textarea
              value={rmk_input}
              onChange={(event) => setRmkInput(event.target.value.toUpperCase())}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              rows={3}
            />
          </div>
        </div>
        <div className="template-row">
          <div className="template-col bottom">
            <EdstButton disabled={true} content="Send"/>
          </div>
          <div className="template-col bottom right">
            <EdstButton content="Exit" onMouseDown={() => closeWindow()}/>
          </div>
        </div>
      </div>
    </div>
  );
}
