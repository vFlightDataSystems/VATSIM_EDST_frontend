import {useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export function PreviousRouteMenu(props) {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    setFocused(false);
  }, [props.data]);
  const ref = useRef(null);
  const {pos, data} = props;

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
          {data.callsign} {data.type}/{data.equipment}
        </div>
        <div className="options-row prev-route-row">
          <div className="options-col">
            RTE {data.previous_route}
          </div>
        </div>
        <div className="options-row bottom">
          <div className="options-col left">
            <button
              onMouseDown={() => {
                props.amendEntry(data.cid, {
                  route: data.previous_route,
                  route_data: data.previous_route_data
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
