import {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {computeFrd, formatUtcMinutes} from "../../lib";

export function MessageComposeArea(props) {
  const [command_str, setCommandStr] = useState('');
  const [response, setResponse] = useState(null);
  const [mca_focused, setMcaFocused] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const {pos, acl_cid_list, dep_cid_list} = props;
  const {setMcaInputRef, setInputFocused, openWindow, updateEntry, edst_data, setMraMessage} = useContext(EdstContext);

  useEffect(() => {
    setMcaInputRef(inputRef);
    inputRef.current.focus();
    return () => setMcaInputRef(null);
    // eslint-disable-next-line
  }, []);

  const toggleHighlightEntry = (fid) => {
    const entry = Object.values(edst_data ?? {})?.find(e => String(e?.cid) === fid || String(e.callsign) === fid || String(e.beacon) === fid);
    if (entry) {
      if (acl_cid_list.has(entry.cid)) {
        updateEntry(entry.cid, {acl_highlighted: !entry.acl_highlighted});
      }
      if (dep_cid_list.has(entry.cid)) {
        updateEntry(entry.cid, {dep_highlighted: !entry.dep_highlighted});
      }
    }
  }

  const flightplanReadout = (fid) => {
    const now = new Date();
    const utc_minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const entry = Object.values(edst_data ?? {})?.find(e => String(e?.cid) === fid || String(e.callsign) === fid || String(e.beacon) === fid);
    if (entry) {
      let msg = formatUtcMinutes(utc_minutes) + '\n'
      + `${entry.cid} ${entry.callsign} ${entry.type}/${entry.equipment} ${entry.beacon} ${entry.flightplan.ground_speed} EXX00`
      + ` ${entry.altitude} ${entry.dep}./${'.' + computeFrd(entry?.reference_fix)}..${entry._route.replace(/^\.+/, '')}`;
      setMraMessage(msg);
    }
  }

  const parseCommand = () => {
    const [command, ...args] = command_str.split(/\s+/);
    // console.log(command, args)
    switch (command) {
      // case '//': // should turn wifi on/off for a CID
      case 'UU':
        switch (args.length) {
          case 0:
            openWindow('acl');
            setResponse(`ACCEPT\nD POS KEYBD`);
            break;
          case 1:
            switch (args[0]) {
              case 'C':
                props.aclCleanup();
                break;
              case 'D':
                openWindow('dep');
                break;
              case 'P':
                openWindow('acl');
                props.togglePosting('acl');
                break;
              case 'X':
                props.closeAllWindows();
                break;
              default:
                props.addEntry(null, args[0]);
                break;
            }
            setResponse(`ACCEPT\nD POS KEYBD`);
            break;
          case 2:
            if (args[0] === 'H') {
              toggleHighlightEntry(args[1]);
              setResponse(`ACCEPT\nD POS KEYBD`);
            }
            else {
              setResponse(`REJECT\n${command_str}`);
            }
            break;
          default: // TODO: give error msg
            setResponse(`REJECT\n${command_str}`);
        }
        break;
      case 'FR':
        if (args.length === 1) {
          flightplanReadout(args[0]);
          setResponse(`ACCEPT\nREADOUT\n${command_str}`);
        }
        else {
          setResponse(`REJECT: MESSAGE TOO LONG\nREADOUT\n${command_str}`);
        }
        break;
      default: // better error msg
        setResponse(`REJECT\n\n${command_str}`);
    }
    setCommandStr('');
  }

  const handleChange = (event) => {
    event.preventDefault();
    setCommandStr(event.target.value.toUpperCase());
  }

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "Enter":
        if (command_str.length > 0) {
          parseCommand();
        }
        else {
          setResponse('');
        }
        break;
      case "Escape":
        setCommandStr('');
        break;
      default: break;
    }
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
          onKeyDownCapture={handleKeyDown}
        />
      </div>
      <div className="mca-response-area">
        {response}
      </div>
    </div>
  );
}