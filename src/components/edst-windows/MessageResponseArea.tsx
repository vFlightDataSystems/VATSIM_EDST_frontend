import React, {useContext, useRef} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";

interface MessageResponseAreaProps {
  pos: {x: number, y: number};
  msg: string
}

export const MessageResponseArea: React.FC<MessageResponseAreaProps> = ({pos, msg}) => {
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);

  return (<div className="floating-window mra no-select"
               ref={ref}
               id="edst-mra"
               style={{left: pos.x + "px", top: pos.y + "px"}}
               onMouseDown={(event) => startDrag(event, ref)}
    >
      {msg}
    </div>
  );
}