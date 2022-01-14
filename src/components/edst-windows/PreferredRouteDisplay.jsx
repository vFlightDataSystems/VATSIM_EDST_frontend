import {useEffect, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export default function PreferredRouteDisplay(props) {
  const [eligible_only, setEligibleOnly] = useState(false);
  const [deltaY, setDeltaY] = useState(0);

  useEffect(() => {
    setDeltaY(0);
  }, [props.data]);
  const {routes} = props;

  return (<div>
      <div className="options-row route-row bottom-border"/>
      <div className="options-row route-row underline">
        Apply ATC Preferred Route
      </div>
      <div className="options-row route-row"
      >
        <div className="options-col prefroute-col"
        >
          <div className="prefroute-button">
            <button className={eligible_only ? 'selected' : ''}
                    onMouseDown={() => setEligibleOnly(true)}
            >
              ELIGIBLE
            </button>
          </div>
          <div className="prefroute-button">
            <button className={!eligible_only ? 'selected' : ''}
                    onMouseDown={() => setEligibleOnly(false)}
            >
              ALL
            </button>
          </div>
        </div>
      </div>
      <div className="prefroute-container"
           onWheel={(e) => setDeltaY(Math.max(Math.min(((deltaY + e.deltaY) / 100 | 0), routes.length - 5), 0))}>
        {Object.entries(routes.slice(deltaY, deltaY + 5) || {}).map(([i, r]) => {
          return (!eligible_only || r.eligible) && (
            <div className="options-row prefroute-row" key={`route-menu-prefroute-row-${i}`}>
              <div className="options-col prefroute-col small hover"
                   onMouseDown={() => props.clearedReroute(r)}
              >
                {r.route || r.aar_amendment_route_string}{r.dest}
              </div>
            </div>)
        })}
      </div>
    </div>
  );
}
