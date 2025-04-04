import React, { useRef, useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import {
  closeAllWindows,
  defaultWindowPositions,
  FULLSCREEN_WINDOWS,
  mcaFeedbackSelector,
  pushZStack,
  setIsFullscreen,
  setMcaAcceptMessage,
  setMcaRejectMessage,
  setMcaResponse,
  setMraMessage,
  setWindowPosition,
  windowPositionSelector,
  windowsSelector,
  zStackSelector,
} from "~redux/slices/appSlice";
import { useDragging } from "hooks/useDragging";
import { useWindowOptions } from "hooks/useWindowOptions";
import { windowOptionsSelector } from "~redux/slices/windowOptionsSlice";
import { FloatingWindowOptionContainer } from "components/utils/FloatingWindowOptionContainer";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { aclManualPostingSelector, setAclManualPosting, setAclSort } from "~redux/slices/aclSlice";
import { entriesSelector, updateEntry } from "~redux/slices/entrySlice";
import { aircraftTracksSelector } from "~redux/slices/trackSlice";
import { useBoolean, useEventListener } from "usehooks-ts";
import { useHubActions } from "hooks/useHubActions";
import { useHubConnector } from "hooks/useHubConnector";
import type { EdstEntry } from "types/edstEntry";
import { convertBeaconCodeToString } from "~/utils/stringManipulation";
import { formatRoute } from "~/utils/formatRoute";
import { formatUtcMinutes } from "~/utils/formatUtcMinutes";
import { fetchRouteFixes } from "api/api";
import { getClearedToFixRouteFixes } from "~/utils/fixes";
import type { ApiFlightplan } from "types/apiTypes/apiFlightplan";
import { openWindowThunk } from "~redux/thunks/openWindowThunk";
import { aclCleanup } from "~redux/thunks/aclCleanup";
import { isAclSortKey, SORT_KEYS_NOT_IMPLEMENTED } from "types/aclSortData";
import { addAclEntryByFid } from "~redux/thunks/entriesThunks";
import socket from "~socket";
import { GI_EXPR } from "~/utils/constants";
import { toggleAltimeter, toggleMetar } from "~redux/slices/weatherSlice";
import { printFlightStrip } from "components/PrintableFlightStrip";
import { appWindow } from "@tauri-apps/api/window";
import mcaStyles from "css/mca.module.scss";
import clsx from "clsx";
import { ConsoleLogger } from "@microsoft/signalr/src/Utils";
import { EramMessageElement, EramPositionType, ProcessEramMessageDto } from "~/types/apiTypes/ProcessEramMessageDto";

function chunkString(str: string, length: number) {
  return str.match(new RegExp(`.{1,${length}}`, "g")) ?? [""];
}

export const MessageComposeArea = () => {
  const dispatch = useRootDispatch();
  const mcaFeedbackString = useRootSelector(mcaFeedbackSelector);
  const pos = useRootSelector((state) => windowPositionSelector(state, "MESSAGE_COMPOSE_AREA"));
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const entries = useRootSelector(entriesSelector);
  const aircraftTracks = useRootSelector(aircraftTracksSelector);
  const windows = useRootSelector(windowsSelector);
  const [mcaInputValue, setMcaInputValue] = useState("");
  const { value: insertMode, toggle: toggleInsertMode } = useBoolean(true);
  const hubActions = useHubActions();
  const { connectHub, disconnectHub } = useHubConnector();
  const [cursorPosition, setCursorPosition] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "MESSAGE_COMPOSE_AREA", "mousedown");
  const { width } = useResizeDetector({ targetRef: ref });

  const [showOptions, setShowOptions] = useState(false);
  const windowOptions = useRootSelector(windowOptionsSelector("MESSAGE_COMPOSE_AREA"));
  const options = useWindowOptions("MESSAGE_COMPOSE_AREA");

  const feedbackRows = mcaFeedbackString.toUpperCase().split("\n");

  const onMcaMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (zStack.indexOf("MESSAGE_COMPOSE_AREA") < zStack.length - 1) {
      dispatch(pushZStack("MESSAGE_COMPOSE_AREA"));
    }
    switch (event.button) {
      case 1:
        event.preventDefault();
        setShowOptions(true);
        break;
      default:
        startDrag(event);
        break;
    }
  };

  const zIndex = zStack.indexOf("MESSAGE_COMPOSE_AREA");

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
    const entry = Object.values(entries).find(
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
    return Object.values(entries).find(
      (entry) => entry.cid === fid || entry.aircraftId === fid || convertBeaconCodeToString(entry.assignedBeaconCode) === fid
    );
  };

  const flightplanReadout = async (fid: string) => {
    const entry = getEntryByFid(fid);
    if (entry) {
      const formattedRoute = formatRoute(entry.route, entry.departure, entry.destination);
      const msg =
        `${formatUtcMinutes()}\n` +
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
      const entry = getEntryByFid(args[0]);
      if (entry && entry.status === "Active") {
        const routeFixes = await fetchRouteFixes(entry.route, entry.departure, entry?.destination);
        if (routeFixes?.map((fix) => fix.name)?.includes(args[1])) {
          const aircraftTrack = aircraftTracks[entry.aircraftId];
          const frd = await hubActions.generateFrd(aircraftTrack.location);
          const formattedRoute = formatRoute(entry.route, entry.departure, entry.destination);
          const route = getClearedToFixRouteFixes(args[1], entry, routeFixes, formattedRoute, frd ?? "")?.route;
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
        dispatch(openWindowThunk("ACL"));
        acceptDposKeyBD();
        break;
      case 1:
        switch (args[0]) {
          case "C":
            dispatch(aclCleanup);
            break;
          case "D":
            dispatch(openWindowThunk("DEP"));
            break;
          case "P":
            dispatch(openWindowThunk("ACL"));
            dispatch(setAclManualPosting(!manualPosting));
            break;
          case "G":
            dispatch(openWindowThunk("GPD"));
            break;
          case "R":
            FULLSCREEN_WINDOWS.forEach((window) => dispatch(setIsFullscreen({ window, value: true })));
            dispatch(
              setWindowPosition({
                window: "MESSAGE_COMPOSE_AREA",
                pos: defaultWindowPositions.MESSAGE_COMPOSE_AREA!,
              })
            );
            break;
          case "X":
            dispatch(closeAllWindows());
            break;
          default:
            if (isAclSortKey(args[0])) {
              if (!SORT_KEYS_NOT_IMPLEMENTED.includes(args[0])) {
                dispatch(openWindowThunk("ACL"));
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
    console.log(command, args);

    // Construct ERAM message from command and args
    const elements: EramMessageElement[] = [{ token: command }];
    args.forEach((arg) => {
      elements.push({ token: arg });
    });

    const eramMessage: ProcessEramMessageDto = {
      source: EramPositionType.DSide,
      elements,
      invertNumericKeypad: false,
    };

    // Send the ERAM message using hubActions
    hubActions.sendEramMessage(eramMessage)
      .then((result) => {
        if(result) {
        if (result.isSuccess) {
          // If successful, accept the command with feedback
          const feedbackMessage = result.feedback.length > 0 
            ? result.feedback.join('\n')
            : mcaInputValue;
          dispatch(setMcaAcceptMessage(feedbackMessage));
          
          // If there's a response, show it in the response area
          if (result.response) {
            dispatch(setMraMessage(result.response));
            dispatch(openWindowThunk("MESSAGE_RESPONSE_AREA"));
          }
        } else {
          // If not successful, reject with feedback
          const rejectMessage = result?.feedback?.length > 0 
            ? `REJECT\n${result.feedback.join('\n')}` 
            : `REJECT\n${mcaInputValue}`;
          dispatch(setMcaRejectMessage(rejectMessage));
        }
      }})
      .catch((error) => {
        reject(`REJECT\n${error?.message || "Command failed"}`);
      });

    // let match;
    // if (command.match(/\/\/\w+/)) {
    //   toggleVci(command.slice(2));
    //   acceptDposKeyBD();
    // } else {
    //   switch (command) {
    //     case "//": // should turn vci on/off for a CID
    //       toggleVci(args[0]);
    //       acceptDposKeyBD();
    //       break; // end case //
    //     case "SI":
    //       connectHub()
    //         .then(() => accept("SIGN IN"))
    //         .catch((reason) => reject(`SIGN IN\n${reason?.message ?? "UNKNOWN ERROR"}`));
    //       break;
    //     case "SO":
    //       disconnectHub()
    //         .then(() => accept("SIGN OUT"))
    //         .catch(() => reject("SIGN OUT"));
    //       break;
    //     case "GI": // send GI message
    //       match = GI_EXPR.exec(input.toUpperCase());
    //       if (match?.length === 3) {
    //         parseGI(match[1], match[2]);
    //       } else {
    //         reject(`FORMAT\n${input}`);
    //       }
    //       break; // end case GI
    //     case "UU":
    //       parseUU(args);
    //       break; // end case UU
    //     case "QU": // cleared direct to fix: QU <fix> <fid>
    //       void parseQU(args);
    //       break; // end case QU
    //     case "QD": // altimeter request: QD <station>
    //       dispatch(toggleAltimeter(args));
    //       dispatch(openWindowThunk("ALTIMETER"));
    //       accept("ALTIMETER REQ");
    //       break; // end case QD
    //     case "WR": // weather request: WR <station>
    //       dispatch(toggleMetar(args));
    //       dispatch(openWindowThunk("METAR"));
    //       accept(`WEATHER STAT REQ\n${input}`);
    //       break; // end case WR
    //     case "FR": // flightplan readout: FR <fid>
    //       if (args.length === 0) {
    //         reject(`READOUT\n${input}`);
    //       } else if (args.length === 1) {
    //         flightplanReadout(args[0]).then(() => accept(`READOUT\n${input}`));
    //         dispatch(openWindowThunk("MESSAGE_RESPONSE_AREA"));
    //       } else {
    //         dispatch(setMcaResponse(`REJECT: MESSAGE TOO LONG\nREADOUT\n${input}`));
    //       }
    //       break; // end case FR
    //     case "SR":
    //       if (args.length === 1) {
    //         const entry = getEntryByFid(args[0]);
    //         if (entry) {
    //           printFlightStrip(entry);
    //           acceptDposKeyBD();
    //         } else {
    //           reject(input);
    //         }
    //       } else {
    //         reject(input);
    //       }
    //       break; // end case SR
    //     default:
    //       // TODO: give better error msg
    //       reject(input);
    //   }
    // }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    // event.preventDefault();
    if (event.key === "Enter" && event.altKey && window.__TAURI__) {
      appWindow.isDecorated().then((isDecorated) => {
        void appWindow.setDecorations(!isDecorated);
      });
    } else if (event.key === "Enter" && event.ctrlKey && window.__TAURI__) {
      appWindow.isFullscreen().then((isFullscreen) => {
        void appWindow.setFullscreen(!isFullscreen);
      });
    } else if (document.activeElement?.localName !== "input" && document.activeElement?.localName !== "textarea" && !windows.ALTITUDE_MENU.open) {
      if (!windows.MESSAGE_COMPOSE_AREA.open) {
        dispatch(openWindowThunk("MESSAGE_COMPOSE_AREA"));
      } else if (zStack.indexOf("MESSAGE_COMPOSE_AREA") < zStack.length - 1) {
        dispatch(pushZStack("MESSAGE_COMPOSE_AREA"));
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
          toggleInsertMode();
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

  return windows.MESSAGE_COMPOSE_AREA.open ? (
    <>
      <div
        className={clsx(mcaStyles.root, `fontSize${windowOptions.fontSizeIndex}`, { noPointerEvents: anyDragging })}
        style={{ "--brightness": windowOptions.brightness / 100, ...pos, zIndex: 10000 + zIndex }}
        ref={ref}
        onMouseDown={onMcaMouseDown}
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <div className={mcaStyles.inputArea} style={{ "--width": `${windowOptions.width}ch`, "--height": `${windowOptions.paLines}em` }}>
          {chunkString(`${mcaInputValue} `, windowOptions.width).map((chunk, i) => {
            const cursorIndex = cursorPosition - windowOptions.width * i;
            if (cursorIndex >= 0 && cursorIndex < windowOptions.width) {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <pre key={i}>
                  {chunk.slice(0, cursorIndex)}
                  <span className={clsx(mcaStyles.cursor, { insertMode })}>{chunk[cursorIndex]}</span>
                  {chunk.slice(cursorIndex + 1)}
                </pre>
              );
            }
            // eslint-disable-next-line react/no-array-index-key
            return <pre key={i}>{chunk}</pre>;
          })}
        </div>
        <div className={mcaStyles.feedbackContainer}>
          <div className={mcaStyles.feedbackRow}>
            {mcaFeedbackString.startsWith("ACCEPT") && <span className={mcaStyles.checkmark} />}
            {mcaFeedbackString.startsWith("REJECT") && <span className={mcaStyles.rejectCross} />}
            {feedbackRows[0]}
          </div>
          {feedbackRows.slice(1, 30).flatMap((s, i) =>
            chunkString(s, windowOptions.width).map((chunk, j) => (
              // eslint-disable-next-line react/no-array-index-key
              <div className={mcaStyles.feedbackRow} key={`${i}-${j}`}>
                {chunk}
              </div>
            ))
          )}
        </div>
      </div>
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
  ) : null;
};
