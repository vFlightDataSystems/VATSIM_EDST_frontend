import {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";

export function MessageComposeArea(props) {
  const [command_str, setCommandStr] = useState('');
  const [mca_focused, setMcaFocused] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const {pos} = props;
  const {setMcaInputRef, setInputFocused, openWindow} = useContext(EdstContext);
  useEffect(() => {
    setMcaInputRef(inputRef)
    inputRef.current.focus();
    return () => setMcaInputRef(null);
  }, []);

  const parseCommand = () => {
    const [command, ...args] = command_str.split(/\s+/);
    // console.log(command, args)
    switch(command) {
      case 'UU':
        switch(args.length) {
          case 0:
            openWindow('acl');
            break;
          case 1:
            switch(args[0]) {
              case 'C':
                props.aclCleanup();
                break;
              case 'D':
                openWindow('dep');
                break;
              default:
                props.addEntry('acl', args[0]);
                break;
            }
            break;
          default: break;
        }
        break;
      default: break;
    }
    setCommandStr('');
  }

  const handleChange = (event) => {
    event.preventDefault();
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
        <input
          ref={inputRef}
          onFocus={() => {
            setInputFocused(true);
            setMcaFocused(true);
          }}
          onBlur={() => {
            setInputFocused(false);
            setMcaFocused(false);
          }}
          tabIndex={mca_focused ? '-1' : null}
          value={command_str}
          onChange={handleChange}
          onKeyDown={(event) => event.key === 'Enter' && parseCommand()}
        />
      </div>
    </div>
  );
}