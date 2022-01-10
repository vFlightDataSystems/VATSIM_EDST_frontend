import {forwardRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export const PlanOptions = forwardRef((props, ref) => {
  const [focused, setFocused] = useState(false);
  const {pos, data, asel} = props;
  const dep = asel?.window === 'dep';

  return (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu plan no-select"
      ref={ref}
      id="plan-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => props.startDrag(event, ref)}
           onMouseUp={(event) => props.stopDrag(event)}
      >
        Plan Options Menu
      </div>
      <div className="options-body">
        <div className="options-row fid">
          {data?.cid} {data?.callsign}
        </div>
        <div className="options-row">
          <div className="options-col hover"
               onMouseDown={() => props.openMenu(ref.current, 'alt-menu', true)}
          >
            Altitude...
          </div>
        </div>
        {!dep && <div className="options-row">
          <div className="options-col hover" disabled={true}>
            Speed...
          </div>
        </div>}
        <div className="options-row">
          <div className="options-col hover"
               onMouseDown={() => props.openMenu(ref.current, 'route-menu', true)}
          >
            Route...
          </div>
        </div>
        <div className="options-row">
          <div className="options-col hover" disabled={data?.previous_route === undefined}
               onMouseDown={() => props.openMenu(ref.current, 'prev-route-menu', true)}
          >
            Previous Route
          </div>
        </div>
        {!dep && <div className="options-row">
          <div className="options-col hover" disabled={true}>
            Stop Probe...
          </div>
        </div>}
        <div className="options-row">
          <div className="options-col hover" disabled={true}>
            Trial {dep ? 'Departure' : 'Restrictions'}...
          </div>
        </div>
        {!dep && <div className="options-row">
          <div className="options-col hover">
            Plans
          </div>
        </div>}
        <div className="options-row">
          <div className="options-col hover">
            Keep
          </div>
        </div>
        <div className="options-row">
          <div className="options-col hover"
               onMouseDown={() => {
                 props.deleteEntry(dep ? 'dep' : 'acl', asel?.cid);
                 props.clearAsel();
                 props.closeWindow();
               }}
          >
            Delete
          </div>
        </div>
        <div className="options-row bottom">
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