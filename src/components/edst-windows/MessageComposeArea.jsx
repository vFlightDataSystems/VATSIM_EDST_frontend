import {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";

export function MessageComposeArea(props) {
  const [command_str, setCommandStr] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);
  const {pos} = props;
  const {setMcaInputRef} = useContext(EdstContext);
  useEffect(() => {
    setMcaInputRef(inputRef)
    inputRef.current.focus();
    // setFocusedTarget(ref);
  });

  const handleChange = (event) => {
    setCommandStr(event.target.value.toUpperCase());
  }

  return (<div className="floating-window mca"
               ref={ref}
               id="edst-mca"
               style={{left: pos.x + "px", top: pos.y + "px"}}
               onMouseDown={(event) => props.startDrag(event, ref)}
      // onMouseEnter={() => setInputFocus()}
    >
      <div className="mca-input-area">
        <input ref={inputRef}
               value={command_str}
               onChange={handleChange}/>
      </div>
    </div>
  );
}