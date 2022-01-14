import {useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';

const useFocus = () => {
  const htmlElRef = useRef(null);
  const setFocus = () => {
    htmlElRef.current && htmlElRef.current.focus();
  }

  return [htmlElRef, setFocus];
}

export function MessageComposeArea(props) {
  const [command_str, setCommandStr] = useState('');
  const ref = useRef(null);
  const [inputRef, setInputFocus] = useFocus();
  const {pos} = props;

  return (<div className="floating-window mca"
               ref={ref}
               id="edst-mca"
               style={{left: pos.x + "px", top: pos.y + "px"}}
               onMouseDown={(event) => props.startDrag(event, ref)}
               onMouseEnter={() => setInputFocus()}
    >
      <div className="mca-input-area">
        <input ref={inputRef}
               value={command_str}
               onChange={(event) => setCommandStr(event.target.value.toUpperCase())}/>
      </div>
    </div>
  );
}