import React, {FunctionComponent, useRef} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';

interface MessageResponseAreaProps {
  pos: {x: number, y: number};
  startDrag: (event: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<any>) => void;
  msg: string
}

export const MessageResponseArea: FunctionComponent<MessageResponseAreaProps> = (props) => {
  const ref = useRef(null);
  const {pos, msg} = props;

  return (<div className="floating-window mra no-select"
               ref={ref}
               id="edst-mra"
               style={{left: pos.x + "px", top: pos.y + "px"}}
               onMouseDown={(event) => props.startDrag(event, ref)}
    >
      {msg}
    </div>
  );
}