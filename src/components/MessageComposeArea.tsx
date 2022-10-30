import React, { useRef, useState } from "react";
import styled, { css } from "styled-components";
import { useResizeDetector } from "react-resize-detector";
import { useEventListener } from "usehooks-ts";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aclManualPostingSelector, setAclManualPosting, setAclSort } from "~redux/slices/aclSlice";
import { entriesSelector, updateEntry } from "~redux/slices/entrySlice";
import {
  closeAllWindows,
  defaultWindowPositions,
  FULLSCREEN_WINDOWS,
  mcaCommandStringSelector,
  mcaFeedbackSelector,
  pushZStack,
  setIsFullscreen,
  setMcaAcceptMessage,
  setMcaCommandString,
  setMcaRejectMessage,
  setMcaResponse,
  setMraMessage,
  setWindowPosition,
  windowPositionSelector,
  zStackSelector,
} from "~redux/slices/appSlice";
import { addAclEntryByFid } from "~redux/thunks/entriesThunks";
import { FloatingWindowDiv } from "styles/floatingWindowStyles";
import { aircraftTracksSelector } from "~redux/slices/trackSlice";
import type { ApiFlightplan } from "types/apiTypes/apiFlightplan";
import type { EdstEntry } from "types/edstEntry";
import { openWindowThunk } from "~redux/thunks/openWindowThunk";
import { aclCleanup } from "~redux/thunks/aclCleanup";
import { useDragging } from "hooks/useDragging";
import { EdstWindow } from "enums/edstWindow";
import { useHubActions } from "hooks/useHubActions";
import { useHubConnector } from "hooks/useHubConnector";
import { fetchRouteFixes } from "api/api";
import { useOnUnmount } from "hooks/useOnUnmount";
import { toggleAltimeter, toggleMetar } from "~redux/slices/weatherSlice";
import { useWindowOptions } from "hooks/useWindowOptions";
import { windowOptionsSelector } from "~redux/slices/windowOptionsSlice";
import { convertBeaconCodeToString } from "~/utils/stringManipulation";
import { getClearedToFixRouteFixes } from "~/utils/fixes";
import { formatUtcMinutes } from "~/utils/formatUtcMinutes";
import { GI_EXPR } from "~/utils/constants";
import { formatRoute } from "~/utils/formatRoute";
import { isAclSortKey, SORT_KEYS_NOT_IMPLEMENTED } from "types/aclSortData";
import socket from "~socket";
import { FloatingWindowOptionContainer } from "components/utils/FloatingWindowOptionContainer";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { printFlightStrip } from "components/PrintableFlightStrip";

function chunkString(str: string, length: number) {
  return str.match(new RegExp(`.{1,${length}}`, "g")) ?? [""];
}

type MessageComposeAreaDivProps = { brightness: number; fontSizeIndex: number };
const MessageComposeAreaDiv = styled(FloatingWindowDiv)<MessageComposeAreaDivProps>`
  ${(props) =>
    css`
      color: rgba(${props.theme.fontProps.baseRGB}, ${props.theme.fontProps.baseRGB}, ${props.theme.fontProps.baseRGB}, ${props.brightness});
    `};
  background-color: #000000;
  border: 1px solid #adadad;
  line-height: 1em;
  font-family: ${(props) => props.theme.fontProps.eramFontFamily};
  font-size: ${(props) => props.theme.fontProps.floatingFontSizes[props.fontSizeIndex - 1]};
`;

type McaInputAreaProps = { width: number; paLines: number };
const MessageComposeInputAreaDiv = styled.div<McaInputAreaProps>`
  height: calc(${(props) => `${props.paLines}em`} + 6px);
  width: auto;
  overflow: hidden;
  > pre {
    width: ${(props) => `${props.width}ch`};
    margin: 2px;
  }
  text-transform: uppercase;
  border-bottom: 1px solid #adadad;
`;

type McaCursorProps = { insertMode: boolean };
const MessageComposeCursor = styled.span<McaCursorProps>`
  display: inline-block;
  height: 1em;
  width: 1ch;
  border-bottom: 1px solid #adadad;
  // if not in insert mode, left and right borders are white
  ${(props) =>
    !props.insertMode &&
    css`
      box-shadow: -1px 0 #adadad, 1px 0 #adadad;
    `}
`;

const FeedbackContainerDiv = styled.div`
  min-height: calc(3em + 12px);
`;
const ResponseFeedbackRowDiv = styled.div`
  height: 1em;
  line-height: 1;
  padding: 2px;
  display: flex;
  flex-grow: 1;
`;

const AcceptCheckmarkSpan = styled.span`
  color: #00ad00;
  height: 1em;

  ::before {
    content: "\u2713";
  }
`;

const RejectCrossSpan = styled.span`
  color: #ad0000;
  height: 1em;

  ::before {
    content: "\u2715";
  }
`;

export const MessageComposeArea = () => {
  const [insertMode, setInsertMode] = useState(true);
  const mcaFeedbackString = useRootSelector(mcaFeedbackSelector);
  const mcaCommandString = useRootSelector(mcaCommandStringSelector);
  const pos = useRootSelector((state) => windowPositionSelector(state, EdstWindow.MESSAGE_COMPOSE_AREA));
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const entries = useRootSelector(entriesSelector);
  const aircraftTracks = useRootSelector(aircraftTracksSelector);
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);
  const [mcaInputValue, setMcaInputValue] = useState(mcaCommandString);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.MESSAGE_COMPOSE_AREA, "mousedown");
  const hubActions = useHubActions();
  const { connectHub, disconnectHub } = useHubConnector();
  const { width } = useResizeDetector({ targetRef: ref });
  const [cursorPosition, setCursorPosition] = useState(mcaCommandString.length);

  useOnUnmount(() => dispatch(setMcaCommandString(mcaInputValue)));

  const [showOptions, setShowOptions] = useState(false);
  const windowOptions = useRootSelector(windowOptionsSelector(EdstWindow.MESSAGE_COMPOSE_AREA));
  const options = useWindowOptions(EdstWindow.MESSAGE_COMPOSE_AREA);

  const accept = (message: string) => {
    dispatch(setMcaAcceptMessage(message));
  };

  const acceptDposKeyBD = () => {
    accept("D POS KEYBD");
  };

  const reject = (message: string) => {
    dispatch(setMcaRejectMessage(message));
  };

  const toggleVci = (fid: string) => {
    const entry: EdstEntry | undefined = Object.values(entries)?.find(
      (e) => e.cid === fid || e.aircraftId === fid || (e.assignedBeaconCode ?? 0).toString().padStart(4, "0") === fid
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
      (entry) => entry.cid === fid || entry.aircraftId === fid || convertBeaconCodeToString(entry.assignedBeaconCode) === fid
    );
    if (entry) {
      dispatch(
        updateEntry({
          aircraftId: entry.aircraftId,
          data: { highlighted: !entry.highlighted },
        })
      );
    }
  };

  const getEntryByFid = (fid: string): EdstEntry | undefined => {
    return Object.values(entries ?? {})?.find(
      (entry) => entry.cid === fid || entry.aircraftId === fid || convertBeaconCodeToString(entry.assignedBeaconCode) === fid
    );
  };

  const flightplanReadout = async (fid: string) => {
    const now = new Date();
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const entry = getEntryByFid(fid);
    if (entry) {
      const formattedRoute = formatRoute(entry.route, entry.departure, entry.destination);
      const msg =
        `${formatUtcMinutes(utcMinutes)}\n` +
        `${entry.aircraftId} ${entry.aircraftId} ${entry.aircraftType}/${entry.faaEquipmentSuffix} ${convertBeaconCodeToString(
          entry.assignedBeaconCode
        )} ${entry.speed} EXX00` +
        ` ${entry.altitude} ${entry.departure}./.` +
        `${formattedRoute.replace(/^\.+/, "")}` +
        `${entry.destination ?? ""}`;
      dispatch(setMraMessage(msg));
    }
  };

  const parseQU = async (args: string[]) => {
    if (args.length === 2) {
      const entry = getEntryByFid(args[1]);
      if (entry && entry.status === "Active") {
        const routeFixes = await fetchRouteFixes(entry.route, entry.departure, entry?.destination);
        if (routeFixes?.map((fix) => fix.name)?.includes(args[0])) {
          const aircraftTrack = aircraftTracks[entry.aircraftId];
          const frd = await hubActions.generateFrd(aircraftTrack.location);
          const formattedRoute = formatRoute(entry.route, entry.departure, entry.destination);
          const route = getClearedToFixRouteFixes(args[0], entry, routeFixes, formattedRoute, frd)?.route;
          if (route) {
            const amendedFlightplan: ApiFlightplan = {
              ...entry,
              route: route.split(/\.+/g).join(" ").trim(),
            };
            hubActions.amendFlightplan(amendedFlightplan).then(() => dispatch(setMcaAcceptMessage(`CLEARED DIRECT`)));
          }
        }
        reject("FORMAT");
      }
    }
  };

  const parseUU = (args: string[]) => {
    switch (args.length) {
      case 0:
        dispatch(openWindowThunk(EdstWindow.ACL));
        acceptDposKeyBD();
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
          case "G":
            dispatch(openWindowThunk(EdstWindow.GPD));
            break;
          case "R":
            FULLSCREEN_WINDOWS.forEach((window) => dispatch(setIsFullscreen({ window, value: true })));
            dispatch(
              setWindowPosition({
                window: EdstWindow.MESSAGE_COMPOSE_AREA,
                pos: defaultWindowPositions[EdstWindow.MESSAGE_COMPOSE_AREA]!,
              })
            );
            break;
          case "X":
            dispatch(closeAllWindows());
            break;
          default:
            if (isAclSortKey(args[0])) {
              if (!SORT_KEYS_NOT_IMPLEMENTED.includes(args[0])) {
                dispatch(openWindowThunk(EdstWindow.ACL));
                dispatch(setAclSort(args[0]));
              }
            } else {
              dispatch(addAclEntryByFid(args[0]));
            }
            break;
        }
        acceptDposKeyBD();
        break;
      case 2:
        if (args[0] === "H") {
          toggleHighlightEntry(args[1]);
          acceptDposKeyBD();
        } else {
          dispatch(setMcaRejectMessage(`REJECT\n${mcaInputValue}`));
        }
        break;
      default:
        // TODO: give error msg
        dispatch(setMcaRejectMessage(`REJECT\n${mcaInputValue}`));
    }
  };

  const parseGI = (recipient: string, message: string) => {
    const callback = (rejectReason?: string) => {
      if (rejectReason) {
        reject(rejectReason);
      } else {
        accept(mcaInputValue);
      }
    };
    socket.sendGIMessage(recipient, message, callback);
  };

  const parseCommand = (input: string) => {
    // TODO: rename command variable
    const [command, ...args] = input
      .trim()
      .split(/\s+/)
      .map((s) => s.toUpperCase());
    // console.log(command, args)
    let match;
    if (command.match(/\/\/\w+/)) {
      toggleVci(command.slice(2));
      acceptDposKeyBD();
    } else {
      // TODO: break down switch cases into functions (parseUU, parseFR, ...)
      switch (command) {
        case "//": // should turn vci on/off for a CID
          toggleVci(args[0]);
          acceptDposKeyBD();
          break; // end case //
        case "SI":
          connectHub()
            .then(() => accept("SIGN IN"))
            .catch((reason) => reject(`SIGN IN\n${reason?.message ?? "UNKNOWN ERROR"}`));
          break;
        case "SO":
          disconnectHub()
            .then(() => accept("SIGN OUT"))
            .catch(() => reject("SIGN OUT"));
          break;
        case "GI": // send GI message
          match = GI_EXPR.exec(input.toUpperCase());
          if (match?.length === 3) {
            parseGI(match[1], match[2]);
          } else {
            reject(`FORMAT\n${input}`);
          }
          break;
        case "UU":
          parseUU(args);
          break; // end case UU
        case "QU": // cleared direct to fix: QU <fix> <fid>
          parseQU(args).then();
          break; // end case QU
        case "QD": // altimeter request: QD <station>
          dispatch(toggleAltimeter(args));
          dispatch(openWindowThunk(EdstWindow.ALTIMETER));
          accept("ALTIMETER REQ");
          break; // end case QD
        case "WR": // weather request: WR <station>
          dispatch(toggleMetar(args));
          dispatch(openWindowThunk(EdstWindow.METAR));
          accept(`WEATHER STAT REQ\n${input}`);
          break; // end case WR
        case "FR": // flightplan readout: FR <fid>
          if (args.length === 0) {
            reject(`READOUT\n${input}`);
          } else if (args.length === 1) {
            flightplanReadout(args[0]).then(() => accept(`READOUT\n${input}`));
            dispatch(openWindowThunk(EdstWindow.MESSAGE_RESPONSE_AREA));
          } else {
            dispatch(setMcaResponse(`REJECT: MESSAGE TOO LONG\nREADOUT\n${input}`));
          }
          break; // end case FR
        case "SR":
          if (args.length === 1) {
            const entry = getEntryByFid(args[0]);
            if (entry) {
              printFlightStrip(entry);
              acceptDposKeyBD();
            } else {
              reject(input);
            }
          } else {
            reject(input);
          }
          break;
        default:
          // TODO: give better error msg
          reject(input);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (document.activeElement?.localName !== "input" && document.activeElement?.localName !== "textarea") {
      if (zStack.indexOf(EdstWindow.MESSAGE_COMPOSE_AREA) < zStack.length - 1) {
        dispatch(pushZStack(EdstWindow.MESSAGE_COMPOSE_AREA));
      }
      switch (event.key) {
        case "Enter":
          if (mcaInputValue.length > 0) {
            parseCommand(mcaInputValue);
            setMcaInputValue("");
            setCursorPosition(0);
          } else {
            dispatch(setMcaRejectMessage(""));
          }
          break;
        case "Escape":
          setMcaInputValue("");
          setCursorPosition(0);
          dispatch(setMcaResponse(""));
          break;
        case "ArrowLeft":
          setCursorPosition((prevPosition) => (prevPosition - 1 < 0 ? mcaInputValue.length : prevPosition - 1));
          break;
        case "ArrowRight":
          setCursorPosition((prevPosition) => (mcaInputValue.length > prevPosition ? prevPosition + 1 : 0));
          break;
        case "Backspace":
          if (cursorPosition > 0) {
            setMcaInputValue((prevValue) => prevValue.slice(0, cursorPosition - 1) + prevValue.slice(cursorPosition));
            setCursorPosition((prevPosition) => Math.max(0, prevPosition - 1));
          }
          break;
        case "Insert":
          setInsertMode((prevMode) => !prevMode);
          break;
        case "Delete":
          setMcaInputValue((prevValue) => prevValue.slice(0, cursorPosition) + prevValue.slice(cursorPosition + 1));
          break;
        default:
          if (event.key.length === 1) {
            setMcaInputValue((prevValue) => prevValue.slice(0, cursorPosition) + event.key + prevValue.slice(cursorPosition + (insertMode ? 1 : 0)));
            setCursorPosition((prevPosition) => prevPosition + 1);
          }
      }
    }
  };

  useEventListener("keydown", handleKeyDown);

  const feedbackRows = mcaFeedbackString.toUpperCase().split("\n");

  const onMcaMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    switch (event.button) {
      case 1:
        setShowOptions(true);
        event.stopPropagation();
        break;
      default:
        startDrag(event);
        if (zStack.indexOf(EdstWindow.MESSAGE_COMPOSE_AREA) < zStack.length - 1) {
          dispatch(pushZStack(EdstWindow.MESSAGE_COMPOSE_AREA));
        }
        break;
    }
  };

  const zIndex = zStack.indexOf(EdstWindow.MESSAGE_COMPOSE_AREA);

  return (
    pos && (
      <>
        <MessageComposeAreaDiv
          ref={ref}
          id="edst-mca"
          fontSizeIndex={windowOptions.fontSizeIndex}
          brightness={windowOptions.brightness}
          anyDragging={anyDragging}
          pos={pos}
          zIndex={zIndex}
          onMouseDownCapture={onMcaMouseDown}
        >
          {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
          <MessageComposeInputAreaDiv {...windowOptions}>
            {chunkString(`${mcaInputValue} `, windowOptions.width).map((chunk, i) => {
              const cursorIndex = cursorPosition - windowOptions.width * i;
              if (cursorIndex >= 0 && cursorIndex < windowOptions.width) {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <pre key={i}>
                    {chunk.slice(0, cursorIndex)}
                    <MessageComposeCursor insertMode={insertMode}>{chunk[cursorIndex]}</MessageComposeCursor>
                    {chunk.slice(cursorIndex + 1)}
                  </pre>
                );
              }
              // eslint-disable-next-line react/no-array-index-key
              return <pre key={i}>{chunk}</pre>;
            })}
          </MessageComposeInputAreaDiv>
          <FeedbackContainerDiv>
            <ResponseFeedbackRowDiv>
              {mcaFeedbackString.startsWith("ACCEPT") && <AcceptCheckmarkSpan />}
              {mcaFeedbackString.startsWith("REJECT") && <RejectCrossSpan />}
              {feedbackRows[0]}
            </ResponseFeedbackRowDiv>
            {feedbackRows.slice(1, 30).flatMap((s, i) =>
              chunkString(s, windowOptions.width).map((chunk, j) => (
                // eslint-disable-next-line react/no-array-index-key
                <ResponseFeedbackRowDiv key={`${i}-${j}`}>{chunk}</ResponseFeedbackRowDiv>
              ))
            )}
          </FeedbackContainerDiv>
        </MessageComposeAreaDiv>
        {showOptions && width && (
          <FloatingWindowOptionContainer
            parentWidth={width + 2}
            parentPos={pos}
            zIndex={zIndex}
            title="MCA"
            onClose={() => setShowOptions(false)}
            options={options}
          />
        )}
      </>
    )
  );
};
