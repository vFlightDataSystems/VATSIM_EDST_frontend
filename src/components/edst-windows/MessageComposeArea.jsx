import {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";

export function MessageComposeArea(props) {
  const [command_str, setCommandStr] = useState('');
  const [mca_focused, setMcaFocused] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const {pos, acl_data, dep_data} = props;
  const {setMcaInputRef, setInputFocused, openWindow, updateEntry, edst_data} = useContext(EdstContext);
  useEffect(() => {
    setMcaInputRef(inputRef)
    inputRef.current.focus();
    return () => setMcaInputRef(null);
  }, []);

  const highlightEntry = (aid) => {
    const entry = Object.values(edst_data || {})?.find(e => String(e?.cid) === aid || String(e.callsign) === aid || String(e.beacon) === aid);
    console.log(aid)
    if (entry) {
      if (dep_data.cid_list.includes(entry.cid)) {
        updateEntry(entry.cid, {dep_highlighted: true});
      }
      if (acl_data.cid_list.includes(entry.cid)) {
        updateEntry(entry.cid, {acl_highlighted: true});
      }
    }
  }

  const parseCommand = () => {
    const [command, ...args] = command_str.split(/\s+/);
    // console.log(command, args)
    switch (command) {
      case 'UU':
        switch (args.length) {
          case 0:
            openWindow('acl');
            break;
          case 1:
            switch (args[0]) {
              case 'C':
                props.aclCleanup();
                break;
              case 'D':
                openWindow('dep');
                break;
              default:
                props.addEntry(null, args[0]);
                break;
            }
            break;
          case 2:
            if (args[0] === 'H') {
              highlightEntry(args[1]);
            }
            break;
          default:
            break;
        }
        break;
      default:
        break;
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