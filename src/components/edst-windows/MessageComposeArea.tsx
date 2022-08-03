import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { convertBeaconCodeToString, formatUtcMinutes, getClearedToFixRouteFixes } from "../../lib";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aclManualPostingSelector, setAclManualPosting } from "../../redux/slices/aclSlice";
import { entriesSelector, updateEntry } from "../../redux/slices/entrySlice";
import {
  closeAllWindows,
  mcaCommandStringSelector,
  pushZStack,
  setMcaCommandString,
  setMraMessage,
  windowPositionSelector,
  zStackSelector
} from "../../redux/slices/appSlice";
import { toggleAltimeterThunk, toggleMetarThunk } from "../../redux/thunks/weatherThunks";
import { addAclEntryByFid } from "../../redux/thunks/entriesThunks";
import { printFlightStrip } from "../PrintableFlightStrip";
import { defaultFontFamily, defaultFontSize } from "../../styles/styles";
import { FloatingWindowDiv } from "../../styles/floatingWindowStyles";
import { edstFontGrey } from "../../styles/colors";
import { EdstDraggingOutline } from "../EdstDraggingOutline";
import { aircraftTracksSelector } from "../../redux/slices/trackSlice";
import { ApiFlightplan } from "../../types/apiTypes/apiFlightplan";
import { EdstEntry } from "../../types/edstEntry";
import { openWindowThunk } from "../../redux/thunks/openWindowThunk";
import { aclCleanup } from "../../redux/thunks/aclCleanup";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../enums/edstWindow";
import { useHubActions } from "../../hooks/useHubActions";

const MessageComposeAreaDiv = styled(FloatingWindowDiv)`
  height: 84px;
  width: 400px;
  background-color: #000000;
  border: 1px solid #adadad;
  font-family: ${defaultFontFamily};
`;

const MessageComposeInputAreaDiv = styled.div`
  line-height: 1;
  width: 100%;
  height: 40%;
  border-bottom: 1px solid #adadad;

  input {
    width: 98%;
    font-family: ${defaultFontFamily};
    font-size: ${defaultFontSize};
    color: ${edstFontGrey};
    outline: none;
    border: none;
    //caret: underscore;
    background-color: #000000;
    text-transform: uppercase;
  }
`;

const MessageComposeResponseAreaDiv = styled.div`
  line-height: 0.95;
  padding: 2px;
  display: flex;
  flex-grow: 1;
  white-space: pre-line;
`;

type MessageComposeAreaProps = {
  setMcaInputRef: (ref: React.RefObject<HTMLInputElement> | null) => void;
};

const AcceptCheckmarkSpan = styled.span`
  color: #00ad00;

  ::before {
    content: "✓";
  }
`;

const RejectCrossSpan = styled.span`
  color: #ad0000;

  ::before {
    content: "X"; // apparently this is literally just the character X (xray)
  }
`;

export const MessageComposeArea = ({ setMcaInputRef }: MessageComposeAreaProps) => {
  const [response, setResponse] = useState<string | null>(null);
  const mcaCommandString = useRootSelector(mcaCommandStringSelector);
  const pos = useRootSelector(windowPositionSelector(EdstWindow.MESSAGE_COMPOSE_AREA));
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const entries = useRootSelector(entriesSelector);
  const aircraftTracks = useRootSelector(aircraftTracksSelector);
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const zStack = useRootSelector(zStackSelector);
  const [mcaInputValue, setMcaInputValue] = useState(mcaCommandString);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.MESSAGE_COMPOSE_AREA);
  const hubActions = useHubActions();

  useEffect(() => {
    setMcaInputRef(inputRef);
    return () => {
      dispatch(setMcaCommandString(mcaInputValue));
      setMcaInputRef(null);
    };
  }, []);

  const toggleVci = (fid: string) => {
    const entry: EdstEntry | undefined = Object.values(entries)?.find(
      e => String(e.cid) === fid || String(e.aircraftId) === fid || String(e.assignedBeaconCode ?? 0).padStart(4, "0") === fid
    );
    if (entry) {
      if (entry.vciStatus < 1) {
        dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { vciStatus: 1 } }));
      } else {
        dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { vciStatus: 0 } }));
      }
    }
  };

  const toggleHighlightEntry = (fid: string) => {
    const entry: EdstEntry | undefined = Object.values(entries)?.find(
      entry => String(entry?.cid) === fid || String(entry.aircraftId) === fid || convertBeaconCodeToString(entry.assignedBeaconCode) === fid
    );
    if (entry) {
      if (entry.aclDisplay) {
        dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { aclHighlighted: !entry.aclHighlighted } }));
      }
      if (entry.depDisplay) {
        dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { depHighlighted: !entry.depHighlighted } }));
      }
    }
  };

  const getEntryByFid = (fid: string): EdstEntry | undefined => {
    return Object.values(entries ?? {})?.find(
      (entry: EdstEntry) =>
        String(entry.cid) === fid || String(entry.aircraftId) === fid || convertBeaconCodeToString(entry.assignedBeaconCode) === fid
    );
  };

  const flightplanReadout = (fid: string) => {
    const now = new Date();
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const entry: EdstEntry | undefined = getEntryByFid(fid);
    if (entry) {
      // TODO: put speed instead of groundspeed
      const msg =
        `${formatUtcMinutes(utcMinutes)}\n` +
        `${entry.aircraftId} ${entry.aircraftId} ${entry.aircraftType}/${entry.faaEquipmentSuffix} ${convertBeaconCodeToString(
          entry.assignedBeaconCode
        )} ${entry.speed} EXX00` +
        ` ${entry.altitude} ${entry.departure}./.` +
        `${entry.currentRoute?.replace(/^\.+/, "")}` +
        `${entry.destination ?? ""}`;
      dispatch(setMraMessage(msg));
    }
  };

  const parseQU = async (args: string[]) => {
    if (args.length === 2) {
      const entry = getEntryByFid(args[1]);
      if (entry && entry.aclDisplay && entry.currentRouteFixes?.map(fix => fix.name).includes(args[0])) {
        const aircraftTrack = aircraftTracks[entry.aircraftId];
        const frd = await hubActions.generateFrd(aircraftTrack.location);
        const route = getClearedToFixRouteFixes(args[0], entry, frd)?.route;
        if (route) {
          const amendedFlightplan: ApiFlightplan = {
            ...entry,
            route: route
              .split(/\.+/g)
              .join(" ")
              .trim()
          };
          hubActions.amendFlightplan(amendedFlightplan).then(() => setResponse(`ACCEPT\nCLEARED DIRECT`));
        }
      }
    }
    setResponse(`REJECT\nFORMAT`);
  };

  const parseCommand = () => {
    // TODO: rename command variable
    const [command, ...args] = mcaInputValue.split(/\s+/).map(s => s.toUpperCase());
    // console.log(command, args)
    if (command.match(/\/\/\w+/)) {
      toggleVci(command.slice(2));
      setResponse(`ACCEPT\nD POS KEYBD`);
    } else {
      // TODO: break down switch cases into functions (parseUU, parseFR, ...)
      switch (command) {
        case "//": // should turn vci on/off for a CID
          toggleVci(args[0]);
          setResponse(`ACCEPT\nD POS KEYBD`);
          break; // end case //
        case "UU":
          switch (args.length) {
            case 0:
              dispatch(openWindowThunk(EdstWindow.ACL));
              setResponse(`ACCEPT\nD POS KEYBD`);
              break;
            case 1:
              switch (args[0]) {
                case "C":
                  dispatch(aclCleanup);
                  break;
                case "D":
                  dispatch(openWindowThunk(EdstWindow.DEP));
                  break;
                case "P":
                  dispatch(openWindowThunk(EdstWindow.ACL));
                  dispatch(setAclManualPosting(!manualPosting));
                  break;
                case "X":
                  dispatch(closeAllWindows());
                  break;
                default:
                  dispatch(addAclEntryByFid(args[0]));
                  break;
              }
              setResponse(`ACCEPT\nD POS KEYBD`);
              break;
            case 2:
              if (args[0] === "H") {
                toggleHighlightEntry(args[1]);
                setResponse(`ACCEPT\nD POS KEYBD`);
              } else {
                setResponse(`REJECT\n${mcaCommandString}`);
              }
              break;
            default:
              // TODO: give error msg
              setResponse(`REJECT\n${mcaCommandString}`);
          }
          break; // end case UU
        case "QU": // cleared direct to fix: QU <fix> <fid>
          parseQU(args).then();
          break; // end case QU
        case "QD": // altimeter request: QD <station>
          dispatch(toggleAltimeterThunk(args));
          dispatch(openWindowThunk(EdstWindow.ALTIMETER));
          setResponse(`ACCEPT\nALTIMETER REQ`);
          break; // end case QD
        case "WR": // weather request: WR <station>
          dispatch(toggleMetarThunk(args));
          dispatch(openWindowThunk(EdstWindow.METAR));
          setResponse(`ACCEPT\nWEATHER STAT REQ\n${mcaCommandString}`);
          break; // end case WR
        case "FR": // flightplan readout: FR <fid>
          if (args.length === 1) {
            flightplanReadout(args[0]);
            setResponse(`ACCEPT\nREADOUT\n${mcaCommandString}`);
          } else {
            setResponse(`REJECT: MESSAGE TOO LONG\nREADOUT\n${mcaCommandString}`);
          }
          break; // end case FR
        case "SR":
          if (args.length === 1) {
            printFlightStrip(getEntryByFid(args[0]));
            setResponse(`ACCEPT\nD POS KEYBD`);
          }
          break;
        default:
          // TODO: give better error msg
          setResponse(`REJECT\n\n${mcaCommandString}`);
      }
    }
    setMcaInputValue("");
  };

  const handleInputChange = (event: React.ChangeEvent<any>) => {
    event.preventDefault();
    setMcaInputValue(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<any>) => {
    if (event.shiftKey && inputRef.current) {
      inputRef.current.blur();
    }
    if (zStack.indexOf(EdstWindow.MESSAGE_COMPOSE_AREA) < zStack.length - 1) {
      dispatch(pushZStack(EdstWindow.MESSAGE_COMPOSE_AREA));
    }
    switch (event.key) {
      case "Enter":
        if (mcaInputValue.length > 0) {
          parseCommand();
        } else {
          setResponse("");
        }
        break;
      case "Escape":
        setMcaInputValue("");
        setMcaCommandString("");
        break;
      default:
        break;
    }
  };

  return (
    pos && (
      <MessageComposeAreaDiv
        ref={ref}
        anyDragging={anyDragging}
        id="edst-mca"
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.MESSAGE_COMPOSE_AREA)}
        onMouseDown={event => {
          startDrag(event);
          if (zStack.indexOf(EdstWindow.MESSAGE_COMPOSE_AREA) > 0) {
            dispatch(pushZStack(EdstWindow.MESSAGE_COMPOSE_AREA));
          }
        }}
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseDown={stopDrag} />}
        <MessageComposeInputAreaDiv>
          <input
            ref={inputRef}
            tabIndex={document.activeElement === inputRef.current ? -1 : undefined}
            value={mcaInputValue}
            onChange={handleInputChange}
            onKeyDownCapture={handleKeyDown}
          />
        </MessageComposeInputAreaDiv>
        <MessageComposeResponseAreaDiv>
          {response?.startsWith("ACCEPT") && <AcceptCheckmarkSpan />}
          {response?.startsWith("REJECT") && <RejectCrossSpan />}
          {response?.toUpperCase()}
        </MessageComposeResponseAreaDiv>
      </MessageComposeAreaDiv>
    )
  );
};
