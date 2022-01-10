import {forwardRef, useState,} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export const CancelHoldMenu = forwardRef((props, ref) => {
  const [focused, setFocused] = useState(false);
  const {pos, data} = props;

  return (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu cancel-hold no-select"
      ref={ref}
      id="cancel-hold-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => props.startDrag(event, ref)}
           onMouseUp={(event) => props.stopDrag(event)}
      >
        Cancel Hold Confirmation
      </div>
      <div className="options-body">
        <div className="options-row fid">
          {data.callsign} {data.type}/{data.equipment}
        </div>
        <div className="options-row">
          <div className="options-col left">
            <button onMouseDown={() => {
              props.amendEntry(data.cid, {hold_data: null});
              props.updateEntry(data.cid, {show_hold_info: false});
              props.closeWindow();
            }}>
              Cancel Hold
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
})