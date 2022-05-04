import React, {useContext, useEffect, useRef, useState} from 'react';
import {EdstContext} from "../../contexts/contexts";
import {formatUtcMinutes, getClosestReferenceFix} from "../../lib";
import {LocalEdstEntryType} from "../../types";
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {aclManualPostingSelector, setAclManualPosting} from "../../redux/slices/aclSlice";
import {entriesSelector, updateEntry} from "../../redux/slices/entriesSlice";
import {aclCleanup, openWindowThunk} from "../../redux/thunks/thunks";
import {windowEnum} from "../../enums";
import {
  closeAllWindows,
  mcaCommandStringSelector,
  setInputFocused,
  setMcaCommandString,
  setMraMessage,
  windowPositionSelector,
  zStackSelector,
  setZStack
} from "../../redux/slices/appSlice";
import {toggleAltimeterThunk, toggleMetarThunk} from "../../redux/thunks/weatherThunks";
import {addAclEntryByFid, amendEntryThunk} from "../../redux/thunks/entriesThunks";
import {printFlightStrip} from "../PrintableFlightStrip";
import {defaultFontFamily, defaultFontSize} from "../../styles/styles";
import styled from "styled-components";
import {FloatingWindowDiv} from "../../styles/floatingWindowStyles";
import {edstFontGrey} from "../../styles/colors";
import {referenceFixSelector} from "../../redux/slices/sectorSlice";
import {point} from "@turf/turf";

const MessageComposeAreaDiv = styled(FloatingWindowDiv)`
  height: 84px;
  width: 400px;
  background-color: #000000;
  border: 1px solid #ADADAD;
  font-family: ${defaultFontFamily};
`;

const MessageComposeInputAreaDiv = styled.div`
  line-height: 1;
  width: 100%;
  height: 40%;
  border-bottom: 1px solid #ADADAD;

  input {
    width: 98%;
    font-family: ${defaultFontFamily};
    font-size: ${defaultFontSize};
    color: ${edstFontGrey};
    outline: none;
    border: none;
    caret: underscore;
    background-color: #000000;
  }
`

const MessageComposeResponseAreaDiv = styled.div`
  line-height: 0.95;
  padding: 2px;
  display: flex;
  flex-grow: 1;
  white-space: pre-line;
`;

type MessageComposeAreaProps = {
  setMcaInputRef: (ref: React.RefObject<HTMLInputElement> | null) => void
}

const AcceptCheckmarkSpan = styled.span`
  color: #00AD00;

  ::before {
    content: "✓";
  }
`;

const RejectCrossSpan = styled.span`
  color: #AD0000;

  ::before {
    content: "X"; // apparently this is literally just the character X (xray)
  }
`;

export const MessageComposeArea: React.FC<MessageComposeAreaProps> = ({setMcaInputRef}) => {
  const [response, setResponse] = useState<string | null>(null);
  const [mcaFocused, setMcaFocused] = useState(false);
  const mcaCommandString = useAppSelector(mcaCommandStringSelector);
  const pos = useAppSelector(windowPositionSelector(windowEnum.messageComposeArea));
  const manualPosting = useAppSelector(aclManualPostingSelector);
  const referenceFixes = useAppSelector(referenceFixSelector);
  const entries = useAppSelector(entriesSelector);
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const zStack = useAppSelector(zStackSelector);

  const {startDrag} = useContext(EdstContext);

  useEffect(() => {
    setMcaInputRef(inputRef);
    return () => setMcaInputRef(null);
    // eslint-disable-next-line
  }, []);

  const toggleVci = (fid: string) => {
    const entry: LocalEdstEntryType | any = Object.values(entries ?? {})
      ?.find((e: LocalEdstEntryType) => String(e.cid) === fid || String(e.callsign) === fid || String(e.beacon) === fid);
    if (entry) {
      if (entry.vciStatus < 1) {
        dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 1}}));
      } else {
        dispatch(updateEntry({cid: entry.cid, data: {vciStatus: 0}}));
      }
    }
  };

  const toggleHighlightEntry = (fid: string) => {
    const entry: LocalEdstEntryType | any = Object.values(entries ?? {})
      ?.find((entry: LocalEdstEntryType) => String(entry?.cid) === fid || String(entry.callsign) === fid || String(entry.beacon) === fid);
    if (entry) {
      if (entry.aclDisplay) {
        dispatch(updateEntry({cid: entry.cid, data: {aclHighlighted: !entry.aclHighlighted}}));
      }
      if (entry.depDisplay) {
        dispatch(updateEntry({cid: entry.cid, data: {depHighlighted: !entry.depHighlighted}}));
      }
    }
  };

  const getEntryByFid = (fid: string): LocalEdstEntryType | undefined => {
    return Object.values(entries ?? {})
      ?.find((entry: LocalEdstEntryType) => String(entry?.cid) === fid || String(entry.callsign) === fid || String(entry.beacon) === fid);
  }

  const flightplanReadout = (fid: string) => {
    const now = new Date();
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const entry: LocalEdstEntryType | undefined = getEntryByFid(fid);
    if (entry) {
      let msg = formatUtcMinutes(utcMinutes) + '\n'
        + `${entry.cid} ${entry.callsign} ${entry.type}/${entry.equipment} ${entry.beacon} ${entry.flightplan.ground_speed} EXX00`
        + ` ${entry.altitude} ${entry.dep}./.`
        + `${entry.cleared_direct?.fix && entry._route?.startsWith(entry.cleared_direct?.fix) ? entry.cleared_direct?.frd + '..' : ''}`
        + `${entry._route?.replace(/^\.+/, '')}`;
      dispatch(setMraMessage(msg));
    }
  };

  const parseQU = (args: string[]) => {
    if (args.length === 2) {
      const entry = getEntryByFid(args[1]);
      if (entry && entry.aclDisplay && entry._route_data?.map(fix => fix.name).includes(args[0])) {
        const closestReferenceFix = referenceFixes ? getClosestReferenceFix(referenceFixes, point([entry.flightplan.lon, entry.flightplan.lat])) : null;
        const planData = {cid: entry.cid, fix: args[0], frd: closestReferenceFix}
        if (planData) {
          dispatch(amendEntryThunk({cid: entry.cid, planData: planData}));
          setResponse(`ACCEPT\nCLEARED DIRECT`);
          return;
        }
      }
    }
    setResponse(`REJECT\nFORMAT`);
  }

  const parseCommand = () => {
    // TODO: rename command variable
    const [command, ...args] = mcaCommandString.split(/\s+/);
    // console.log(command, args)
    if (command.match(/\/\/\w+/)) {
      toggleVci(command.slice(2));
      setResponse(`ACCEPT\nD POS KEYBD`);
    } else {
      // TODO: break down switch cases into functions (parseUU, parseFR, ...)
      switch (command) {
        case '//': // should turn vci on/off for a CID
          toggleVci(args[0]);
          setResponse(`ACCEPT\nD POS KEYBD`);
          break;//end case //
        case 'UU':
          switch (args.length) {
            case 0:
              dispatch(openWindowThunk(windowEnum.acl));
              setResponse(`ACCEPT\nD POS KEYBD`);
              break;
            case 1:
              switch (args[0]) {
                case 'C':
                  dispatch(aclCleanup);
                  break;
                case 'D':
                  dispatch(openWindowThunk(windowEnum.dep));
                  break;
                case 'P':
                  dispatch(openWindowThunk(windowEnum.acl));
                  dispatch(setAclManualPosting(!manualPosting));
                  break;
                case 'X':
                  dispatch(setInputFocused(false));
                  dispatch(closeAllWindows());
                  break;
                default:
                  dispatch(addAclEntryByFid(args[0]));
                  break;
              }
              setResponse(`ACCEPT\nD POS KEYBD`);
              break;
            case 2:
              if (args[0] === 'H') {
                toggleHighlightEntry(args[1]);
                setResponse(`ACCEPT\nD POS KEYBD`);
              } else {
                setResponse(`REJECT\n${mcaCommandString}`);
              }
              break;
            default: // TODO: give error msg
              setResponse(`REJECT\n${mcaCommandString}`);
          }
          break;//end case UU
        case 'QU': // cleared direct to fix: QU <fix> <fid>
          parseQU(args);
          break; //end case QU
        case 'QD': // altimeter request: QD <station>
          dispatch(toggleAltimeterThunk(args));
          dispatch(openWindowThunk(windowEnum.altimeter));
          setResponse(`ACCEPT\nALTIMETER REQ`);
          break; //end case QD
        case 'WR': // weather request: WR <station>
          dispatch(toggleMetarThunk(args));
          dispatch(openWindowThunk(windowEnum.metar));
          setResponse(`ACCEPT\nWEATHER STAT REQ\n${mcaCommandString}`);
          break; //end case WR
        case 'FR': // flightplan readout: FR <fid>
          if (args.length === 1) {
            flightplanReadout(args[0]);
            setResponse(`ACCEPT\nREADOUT\n${mcaCommandString}`);
          } else {
            setResponse(`REJECT: MESSAGE TOO LONG\nREADOUT\n${mcaCommandString}`);
          }
          break; //end case FR
        case 'SR':
          if (args.length === 1) {
            printFlightStrip(getEntryByFid(args[0]));
            setResponse(`ACCEPT\nD POS KEYBD`);
          }
          break;
        default: // TODO: give better error msg
          setResponse(`REJECT\n\n${mcaCommandString}`);
      }
    }
    dispatch(setMcaCommandString(''));
  };

  const handleInputChange = (event: React.ChangeEvent<any>) => {
    event.preventDefault();
    dispatch(setMcaCommandString(event.target.value.toUpperCase()));
  };

  const handleKeyDown = (event: React.KeyboardEvent<any>) => {
    if (event.shiftKey) {
      (inputRef.current as HTMLInputElement).blur();
    }
    switch (event.key) {
      case "Enter":
        if (mcaCommandString.length > 0) {
          parseCommand();
        } else {
          setResponse('');
        }
        break;
      case "Escape":
        setMcaCommandString('');
        break;
      default:
        break;
    }
  };

  return pos && (<MessageComposeAreaDiv
    ref={ref}
    id="edst-mca"
    pos={pos}
    zIndex={zStack.indexOf(windowEnum.messageComposeArea)}
    onMouseDown={(event) => {
      startDrag(event, ref, windowEnum.messageComposeArea)
      if (zStack.indexOf(windowEnum.messageComposeArea) > 0) {
        dispatch(setZStack(windowEnum.messageComposeArea));
      }
    }}
  // onMouseEnter={() => setInputFocus()}
  >
    <MessageComposeInputAreaDiv>
      <input
        ref={inputRef}
        onFocus={() => {
          dispatch(setInputFocused(true));
          setMcaFocused(true);
        }}
        onBlur={() => {
          dispatch(setInputFocused(false));
          setMcaFocused(false);
        }}
        tabIndex={mcaFocused ? -1 : undefined}
        value={mcaCommandString}
        onChange={handleInputChange}
        onKeyDownCapture={handleKeyDown}
      />
    </MessageComposeInputAreaDiv>
    <MessageComposeResponseAreaDiv>
      {response?.startsWith('ACCEPT') && <AcceptCheckmarkSpan />}
      {response?.startsWith('REJECT') && <RejectCrossSpan />}
      {response}
    </MessageComposeResponseAreaDiv>
  </MessageComposeAreaDiv >
  );
};
