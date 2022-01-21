import { useContext, useEffect, useRef, useState } from 'react';
import { EdstContext } from "../../contexts/contexts";
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export function PreviousRouteMenu(props) {
  const { amendEntry } = useContext(EdstContext);
  const [focused, setFocused] = useState(false);
  const {pos, entry} = props;
  useEffect(() => {
    setFocused(false);
  }, [entry]);
  const ref = useRef(null);


  return (<div
      ref={ref}
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu prev-route no-select"
      id="route-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => props.startDrag(event, ref)}
           onMouseUp={(event) => props.stopDrag(event)}
      >
        Previous Route Menu
      </div>
      <div className="options-body">
        <div className="options-row fid">
          {entry.callsign} {entry.type}/{entry.equipment}
        </div>
        <div className="options-row prev-route-row">
          <div className="options-col">
            RTE {entry.previous_route.startsWith(entry.cleared_direct?.fix) && entry.cleared_direct?.frd + '..'}{entry.previous_route}
          </div>
        </div>
        <div className="options-row bottom">
          <div className="options-col left">
            <button
              onMouseDown={() => {
                amendEntry(entry.cid, {
                  route: entry.previous_route,
                  route_data: entry.previous_route_data
                });
                props.closeWindow();
              }}
            >
              Apply Previous Route
            </button>
          </div>
          <div className="options-col right">
            <button onMouseDown={props.closeWindow}>
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
