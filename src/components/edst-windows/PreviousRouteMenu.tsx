import {FunctionComponent, useContext, useEffect, useRef, useState} from 'react';
import {EdstContext} from "../../contexts/contexts";
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstButton} from "../resources/EdstButton";
import {EdstWindowProps} from "../../interfaces";

export const PreviousRouteMenu: FunctionComponent<EdstWindowProps> = (props) => {
  const {amendEntry, edst_data, startDrag, stopDrag} = useContext(EdstContext);
  const [focused, setFocused] = useState(false);
  const {pos, asel} = props;
  const entry = edst_data[asel.cid];
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
           onMouseDown={(event) => startDrag(event, ref)}
           onMouseUp={(event) => stopDrag(event)}
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
            <EdstButton content="Apply Previous Route"
                        onMouseDown={() => {
                          amendEntry(entry.cid, {
                            route: entry.previous_route,
                            route_data: entry.previous_route_data
                          });
                          props.closeWindow();
                        }}
            />
          </div>
          <div className="options-col right">
            <EdstButton content="Exit" onMouseDown={props.closeWindow}/>
          </div>
        </div>
      </div>
    </div>
  );
};
