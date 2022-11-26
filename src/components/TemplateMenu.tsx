import React, { useEffect, useRef, useState } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { aselSelector, closeWindow, windowPositionSelector, pushZStack, zStackSelector } from "~redux/slices/appSlice";
import { Tooltips } from "~/tooltips";
import { aselTrackSelector } from "~redux/slices/trackSlice";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { useHubActions } from "hooks/useHubActions";
import { formatRoute } from "~/utils/formatRoute";
import { appendDownArrowToString, appendUpArrowToString, convertBeaconCodeToString } from "~/utils/stringManipulation";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { EdstButton, ExitButton } from "components/utils/EdstButton";
import clsx from "clsx";
import optionStyles from "css/optionMenu.module.scss";
import templateStyles from "css/templateMenu.module.scss";
import inputStyles from "css/input.module.scss";

type TemplateInputProps = {
  title?: string;
  value: string | number;
  className?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  rows?: number;
};

const TemplateInput = ({ title, className, ...props }: TemplateInputProps) => {
  return (
    <div className={clsx(templateStyles.col, className)} title={title}>
      <div className={inputStyles.inputContainer}>
        <input spellCheck={false} {...props} />
      </div>
    </div>
  );
};
const TemplateTextArea = ({ title, ...props }: TemplateInputProps) => {
  return (
    <div className={clsx(templateStyles.col, "flexGrow")} title={title}>
      <div className={clsx(inputStyles.inputContainer, "flexGrow")}>
        <textarea spellCheck={false} {...props} />
      </div>
    </div>
  );
};

const renderCol = (content: string, className?: string) => (
  <div className={clsx(templateStyles.col, className, templateStyles.textIndent)}>{content}</div>
);

export const TemplateMenu = () => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector);
  const aircraftTrack = useRootSelector(aselTrackSelector);
  const entry = useRootSelector(aselEntrySelector);
  const pos = useRootSelector((state) => windowPositionSelector(state, "TEMPLATE_MENU"));
  const zStack = useRootSelector(zStackSelector);
  // const [displayRawRoute, setDisplayRawRoute] = useState(false);
  // TODO: use normal formatted route
  const formattedRoute = entry ? formatRoute(entry.route) : "";

  const route =
    (asel?.window === "DEP"
      ? formattedRoute?.concat(entry?.destination ? appendDownArrowToString(entry.destination) : "")
      : formattedRoute?.replace(/^\.*/, "")?.concat(entry?.destination ? appendDownArrowToString(entry.destination) : "")) ?? "";

  const [aidInput, setAidInput] = useState(entry?.aircraftId ?? "");
  const [numInput, setNumInput] = useState(entry ? 1 : "");
  const [saiInput, setSaiInput] = useState("");
  const [typeInput, setTypeInput] = useState(entry?.aircraftType ?? "");
  const [equipInput, setEquipInput] = useState(entry?.faaEquipmentSuffix ?? "");
  const [beaconInput, setBeaconInput] = useState(convertBeaconCodeToString(entry?.assignedBeaconCode ?? null));
  const [speedInput, setSpeedInput] = useState(entry?.speed ?? "");
  const [frdInput, setFrdInput] = useState("");
  const [timeInput, setTimeInput] = useState("EXX00");
  const [altInput, setAltInput] = useState(entry?.altitude ?? "");
  const [routeInput, setRouteInput] = useState(
    (asel?.window === "DEP" ? (entry?.departure ? appendUpArrowToString(entry?.departure) : "") + route : route) ?? ""
  );
  const [rmkInput, setRmkInput] = useState(entry?.remarks ?? "");
  const { generateFrd } = useHubActions();

  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref, [asel?.aircraftId]);

  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "TEMPLATE_MENU", "mouseup");

  useEffect(() => {
    async function updateFrd() {
      if (aircraftTrack) {
        setFrdInput((await generateFrd(aircraftTrack.location)) ?? "");
      }
    }
    void updateFrd();
  }, [aircraftTrack, entry?.aircraftId, generateFrd]);

  return (
    <div
      className={clsx(templateStyles.root, { isDragging: anyDragging })}
      ref={ref}
      style={{ ...pos, zIndex: 10000 + zStack.indexOf("TEMPLATE_MENU") }}
      onMouseDown={() => zStack.indexOf("TEMPLATE_MENU") < zStack.length - 1 && dispatch(pushZStack("TEMPLATE_MENU"))}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <div className={clsx(optionStyles.header, { focused })} onMouseDown={startDrag}>
        {asel ? "Amendment" : "Flight Plan"} Menu
      </div>
      <div className={templateStyles.body}>
        <div className={templateStyles.row}>
          {renderCol("AID", "w9")}
          {renderCol("NUM", "w5")}
          {renderCol("SAI", "w5")}
          {renderCol("TYPE", "w6")}
          <div className={clsx(templateStyles.col, "w8")}>
            <EdstButton
              content="EQP..."
              onMouseDown={() => dispatch(openMenuThunk("EQUIPMENT_TEMPLATE_MENU", ref.current))}
              title={Tooltips.templateMenuEqpButton}
            />
          </div>
          {renderCol("BCN", "w6")}
          {renderCol("SPD", "w6")}
          {renderCol("FIX", "w14")}
          {renderCol("TIM", "w8")}
          {renderCol("ALT")}
          <div className={templateStyles.col}>
            <EdstButton margin="0 2px 0 0" disabled content="More..." title={Tooltips.templateMenuMore} />
          </div>
        </div>
        <div className={templateStyles.row}>
          <TemplateInput className="w9" title={Tooltips.templateMenuAid} value={aidInput} onChange={(event) => setAidInput(event.target.value)} />
          <TemplateInput className="w5" title={Tooltips.templateMenuNum} value={numInput} onChange={(event) => setNumInput(event.target.value)} />
          <TemplateInput className="w5" title={Tooltips.templateMenuSai} value={saiInput} onChange={(event) => setSaiInput(event.target.value)} />
          <TemplateInput className="w6" title={Tooltips.templateMenuTyp} value={typeInput} onChange={(event) => setTypeInput(event.target.value)} />
          <TemplateInput
            className="w8"
            title={Tooltips.templateMenuEqpBox}
            value={equipInput}
            onChange={(event) => setEquipInput(event.target.value)}
          />
          <TemplateInput
            className="w6"
            title={Tooltips.templateMenuBcn}
            value={beaconInput}
            onChange={(event) => setBeaconInput(event.target.value)}
          />
          <TemplateInput className="w6" title={Tooltips.templateMenuSpd} value={speedInput} onChange={(event) => setSpeedInput(event.target.value)} />
          <TemplateInput className="w14" title={Tooltips.templateMenuFix} value={frdInput} onChange={(event) => setFrdInput(event.target.value)} />
          <TemplateInput className="w8" title={Tooltips.templateMenuTim} value={timeInput} onChange={(event) => setTimeInput(event.target.value)} />
          <div className={clsx(templateStyles.col, templateStyles.flex)} title={Tooltips.templateMenuAlt}>
            <TemplateInput className={templateStyles.flex} value={altInput} onChange={(event) => setAltInput(event.target.value)} />
          </div>
        </div>
        <div className={templateStyles.row}>{renderCol("RTE", "w5")}</div>
        <div className={templateStyles.row}>
          <TemplateTextArea title={Tooltips.templateMenuRte} value={routeInput} onChange={(event) => setRouteInput(event.target.value)} rows={3} />
        </div>
        <div className={templateStyles.row}>
          {renderCol("RMK", "w5")}
          <div className={templateStyles.row} />
          <div className={templateStyles.col}>
            <EdstButton disabled content="Create FP..." title={Tooltips.templateMenuCreateFp} />
          </div>
        </div>
        <div className={templateStyles.row}>
          <TemplateTextArea title={Tooltips.templateMenuRmk} value={rmkInput} onChange={(event) => setRmkInput(event.target.value)} rows={3} />
        </div>
        <div className={clsx(templateStyles.row)}>
          <div className={templateStyles.col}>
            <EdstButton disabled content="Send" title={Tooltips.templateMenuSend} />
          </div>
          <div className={templateStyles.row} />
          <div className={clsx(templateStyles.col)}>
            <ExitButton onMouseDown={() => dispatch(closeWindow("TEMPLATE_MENU"))} />
          </div>
        </div>
      </div>
    </div>
  );
};
