import React, { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "styled-components";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { aselSelector, closeWindow, windowPositionSelector, pushZStack, zStackSelector } from "~redux/slices/appSlice";
import { Tooltips } from "~/tooltips";
import { EdstInput, EdstTextArea, OptionsBody, OptionsMenu, OptionsMenuHeader } from "styles/optionMenuStyles";
import { aselTrackSelector } from "~redux/slices/trackSlice";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { EdstWindow } from "enums/edstWindow";
import { useHubActions } from "hooks/useHubActions";
import { formatRoute } from "~/utils/formatRoute";
import { appendDownArrowToString, appendUpArrowToString, convertBeaconCodeToString } from "~/utils/stringManipulation";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { EdstTooltip } from "components/utils/EdstTooltip";
import { EdstButton, ExitButton } from "components/utils/EdstButton";

const TemplateDiv = styled(OptionsMenu)`
  width: 90ch;
`;
const TemplateBodyDiv = styled(OptionsBody)`
  padding: 10px 0 2px 0;
`;
type TemplateRowDivProps = { alignRight?: boolean };
const TemplateRowDiv = styled.div<TemplateRowDivProps>`
  padding: 2px 12px;
  display: flex;
  flex-grow: 1;
  border: none;
  overflow: hidden;

  ${(props) => props.alignRight && { width: "auto" }};

  &.left {
    flex-grow: 1;
  }
`;

type TemplateColProps = {
  bottomRow?: boolean;
  alignRight?: boolean;
  width?: CSSProperties["width"];
  textIndent?: boolean;
};

const TemplateCol = styled(EdstTooltip)<TemplateColProps>`
  font-size: ${(props) => props.theme.fontProps.inputFontSize};
  align-items: center;
  vertical-align: center;
  padding: 0 2px;
  justify-content: left;
  display: flex;
  flex-shrink: 0;
  width: ${(props) => props.width ?? "auto"};
  ${(props) => props.textIndent && { "text-indent": "6px" }}
  border: 1px solid transparent;

  ${(props) =>
    props.bottomRow && {
      padding: "2px",
    }}

  ${(props) =>
    props.alignRight && {
      width: "auto",
      "margin-left": "auto",
    }}
`;

const FlexCol = styled(TemplateCol)`
  flex-grow: 1;
  flex-shrink: 1;
  width: auto;
`;

type TemplateInputProps = {
  title?: string;
  value: string | number;
  width?: CSSProperties["width"];
  flexShrink?: CSSProperties["flexShrink"];
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  rows?: number;
};

const TemplateInput = ({ title, width, flexShrink, ...props }: TemplateInputProps) => {
  return (
    <TemplateCol title={title} style={{ flexGrow: 1, flexShrink: flexShrink ?? 0, width }}>
      <EdstInput {...props} />
    </TemplateCol>
  );
};
const TemplateTextArea = ({ title, ...props }: TemplateInputProps) => {
  return (
    <TemplateCol title={title} style={{ flexGrow: 1, width: "auto" }}>
      <EdstTextArea {...props} />
    </TemplateCol>
  );
};

export const TemplateMenu = () => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector);
  const aircraftTrack = useRootSelector(aselTrackSelector);
  const entry = useRootSelector(aselEntrySelector);
  const pos = useRootSelector((state) => windowPositionSelector(state, EdstWindow.TEMPLATE_MENU));
  const zStack = useRootSelector(zStackSelector);
  // const [displayRawRoute, setDisplayRawRoute] = useState(false);
  // TODO: use normal formatted route
  const formattedRoute = entry ? formatRoute(entry.route) : "";

  const route =
    (asel?.window === EdstWindow.DEP
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
    (asel?.window === EdstWindow.DEP ? (entry?.departure ? appendUpArrowToString(entry?.departure) : "") + route : route) ?? ""
  );
  const [rmkInput, setRmkInput] = useState(entry?.remarks ?? "");
  const { generateFrd } = useHubActions();

  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref, [asel?.aircraftId]);

  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.TEMPLATE_MENU, "mouseup");

  useEffect(() => {
    async function updateFrd() {
      if (aircraftTrack) {
        setFrdInput((await generateFrd(aircraftTrack.location)) ?? "");
      }
    }
    void updateFrd();
  }, [aircraftTrack, entry?.aircraftId, generateFrd]);

  return (
    <TemplateDiv
      ref={ref}
      pos={pos}
      zIndex={zStack.indexOf(EdstWindow.TEMPLATE_MENU)}
      onMouseDown={() => zStack.indexOf(EdstWindow.TEMPLATE_MENU) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.TEMPLATE_MENU))}
      anyDragging={anyDragging}
      id="template-menu"
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <OptionsMenuHeader focused={focused} onMouseDown={startDrag}>
        {asel ? "Amendment" : "Flight Plan"} Menu
      </OptionsMenuHeader>
      <TemplateBodyDiv>
        <TemplateRowDiv>
          <TemplateCol width="9ch" textIndent content="AID" />
          <TemplateCol width="5ch" textIndent content="NUM" />
          <TemplateCol width="5ch" textIndent content="SAI" />
          <TemplateCol width="6ch" textIndent content="TYP" />
          <TemplateCol width="8ch">
            <EdstButton
              content="EQP..."
              onMouseDown={() => dispatch(openMenuThunk(EdstWindow.EQUIPMENT_TEMPLATE_MENU, ref.current))}
              title={Tooltips.templateMenuEqpButton}
            />
          </TemplateCol>
          <TemplateCol width="6ch" textIndent content="BCN" />
          <TemplateCol width="6ch" textIndent content="SPD" />
          <TemplateCol width="14ch" textIndent content="FIX" />
          <TemplateCol width="8ch" textIndent content="TIM" />
          <FlexCol textIndent>ALT</FlexCol>
          <TemplateCol>
            <EdstButton margin="0 2px 0 0" disabled content="More..." title={Tooltips.templateMenuMore} />
          </TemplateCol>
        </TemplateRowDiv>
        <TemplateRowDiv>
          <TemplateInput width="9ch" title={Tooltips.templateMenuAid} value={aidInput} onChange={(event) => setAidInput(event.target.value)} />
          <TemplateInput width="5ch" title={Tooltips.templateMenuNum} value={numInput} onChange={(event) => setNumInput(event.target.value)} />
          <TemplateInput width="5ch" title={Tooltips.templateMenuSai} value={saiInput} onChange={(event) => setSaiInput(event.target.value)} />
          <TemplateInput width="6ch" title={Tooltips.templateMenuTyp} value={typeInput} onChange={(event) => setTypeInput(event.target.value)} />
          <TemplateInput width="8ch" title={Tooltips.templateMenuEqpBox} value={equipInput} onChange={(event) => setEquipInput(event.target.value)} />
          <TemplateInput width="6ch" title={Tooltips.templateMenuBcn} value={beaconInput} onChange={(event) => setBeaconInput(event.target.value)} />
          <TemplateInput width="6ch" title={Tooltips.templateMenuSpd} value={speedInput} onChange={(event) => setSpeedInput(event.target.value)} />
          <TemplateInput width="14ch" title={Tooltips.templateMenuFix} value={frdInput} onChange={(event) => setFrdInput(event.target.value)} />
          <TemplateInput width="8ch" title={Tooltips.templateMenuTim} value={timeInput} onChange={(event) => setTimeInput(event.target.value)} />
          <FlexCol title={Tooltips.templateMenuAlt}>
            <TemplateInput flexShrink={1} value={altInput} onChange={(event) => setAltInput(event.target.value)} />
          </FlexCol>
        </TemplateRowDiv>
        <TemplateRowDiv>
          <TemplateCol width="5ch" textIndent content="RTE" />
        </TemplateRowDiv>
        <TemplateRowDiv>
          <TemplateTextArea title={Tooltips.templateMenuRte} value={routeInput} onChange={(event) => setRouteInput(event.target.value)} rows={3} />
        </TemplateRowDiv>
        <TemplateRowDiv>
          <TemplateCol width="5ch" textIndent content="RMK" />
          <TemplateRowDiv alignRight />
          <TemplateCol>
            <EdstButton disabled content="Create FP..." title={Tooltips.templateMenuCreateFp} />
          </TemplateCol>
        </TemplateRowDiv>
        <TemplateRowDiv>
          <TemplateTextArea title={Tooltips.templateMenuRmk} value={rmkInput} onChange={(event) => setRmkInput(event.target.value)} rows={3} />
        </TemplateRowDiv>
        <TemplateRowDiv>
          <TemplateCol bottomRow>
            <EdstButton disabled content="Send" title={Tooltips.templateMenuSend} />
          </TemplateCol>
          <TemplateCol bottomRow alignRight>
            <ExitButton onMouseDown={() => dispatch(closeWindow(EdstWindow.TEMPLATE_MENU))} />
          </TemplateCol>
        </TemplateRowDiv>
      </TemplateBodyDiv>
    </TemplateDiv>
  );
};
