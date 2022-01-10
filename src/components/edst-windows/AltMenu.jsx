import React, {useEffect, useState} from 'react';
import _ from 'lodash';
import '../../css/header-styles.scss';
import '../../css/windows/alt-menu-styles.scss';

export default function AltMenu(props) {
  const {data, pos} = props;
  const [dep, setDep] = useState(props.asel.window === 'dep');
  const [selected, setSelected] = useState(props.asel.window !== 'dep' ? 'trial' : 'amend');
  const [temp_alt_hover, setTempAltHover] = useState(null);
  const [deltaY, setDeltaY] = useState(0);
  useEffect(() => {
    setDep(props.asel.window === 'dep');
    setSelected(props.asel.window !== 'dep' ? 'trial' : 'amend');
    setTempAltHover(null);
    setDeltaY(0);
  }, [props.asel]);

  return (<div
      className="alt-menu no-select"
      id="alt-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`alt-menu-header no-select`}
      >
        <div className="alt-menu-header-left">
          {data?.callsign}
        </div>
        <div className="alt-menu-header-right"
             onMouseDown={props.closeWindow}
        >
          X
        </div>
      </div>
      <div className={`alt-menu-row hover ${selected === 'trial' ? 'selected' : ''}`}
           onMouseDown={() => setSelected('trial')}
           disabled={dep}
      >
        TRIAL PLAN
      </div>
      <div className={`alt-menu-row hover ${selected === 'amend' ? 'selected' : ''}`}
           onMouseDown={() => setSelected('amend')}
      >
        AMEND
      </div>
      <div className={`alt-menu-row hover ${selected === 'fp' ? 'selected' : ''}`}
           onMouseDown={() => setSelected('fp')}
      >
        FP {data.altitude}
      </div>
      <div className={`alt-menu-row`} disabled={true}>
        {!dep ? 'PROCEDURE' : 'NO ALT'}
      </div>
      <div className="alt-menu-select-container"
           onWheel={(e) => setDeltaY(deltaY + e.deltaY)}
      >
        {_.range(30, -40, -10).map(i => {
          const alt = Number(data.altitude) - (deltaY / 100 | 0) * 10 + i;
          return <div
            className={`alt-menu-container-row ${((selected === 'amend') && (temp_alt_hover === alt)) ? 'temp-alt-hover' : ''}`}
            key={`alt-${i}`}
          >
            <div className={`alt-menu-container-col ${alt === Number(data.altitude) ? 'selected' : ''}`}
                 onMouseDown={() => {
                   if (selected === 'amend') {
                     props.amendEntry(data.cid, {altitude: alt})
                   } else {
                     const trial_plan = {
                       cid: data.cid, callsign: data.callsign, plan_data: {
                         altitude: alt,
                         interim: null
                       },
                       msg: `AM ${data.cid} ALT ${alt}`
                     };
                     props.trialPlan(trial_plan);
                   }
                   props.closeWindow();
                 }}
            >
              {String(alt).padStart(3, '0')}
            </div>
            {!dep &&
            <div className={`alt-menu-container-col-t`}
                 disabled={!(selected === 'amend')}
                 onMouseEnter={() => (selected === 'amend') && setTempAltHover(alt)}
                 onMouseLeave={() => (selected === 'amend') && setTempAltHover(null)}
                 onMouseDown={() => {
                   if (selected === 'amend') {
                     props.amendEntry(data?.cid, {interim: alt})
                   } else {
                     const trial_plan = {
                       cid: data?.cid, callsign: data?.callsign, plan_data: {
                         interim: alt
                       },
                       msg: `QQ /TT ${alt} ${data?.cid}`
                     };
                     props.trialPlan(trial_plan);
                   }
                   props.closeWindow();
                 }}>
              T
            </div>}
          </div>;
        })}
      </div>
    </div>
  );
}