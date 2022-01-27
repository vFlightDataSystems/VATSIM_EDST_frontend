import {useRef} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';

export function Status(props) {
  const ref = useRef(null);
  const {pos} = props;

  return (<div className="floating-window status-window"
               ref={ref}
               id="edst-status"
               style={{left: pos.x + "px", top: pos.y + "px"}}
    >
      <div className="floating-window-header no-select">
        <div className="floating-window-header-left">
          M
        </div>
        <div className="floating-window-header-middle"
             onMouseDown={(event) => props.startDrag(event, ref)}
        >
          STATUS
        </div>
        <div className="floating-window-header-right" onMouseDown={props.closeWindow}>
          <div className="floating-window-header-block-8-2"/>
        </div>
      </div>
      <div className="floating-window-body">
        STATUS TEST
      </div>
    </div>
  );
}