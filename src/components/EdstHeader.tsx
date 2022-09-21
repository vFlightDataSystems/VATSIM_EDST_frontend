import React from "react";
import styled from "styled-components";
import { Time } from "./utils/Time";
import { Tooltips } from "../tooltips";
import { EdstTooltip } from "./utils/EdstTooltip";
import { useRootDispatch, useRootSelector } from "../redux/hooks";
import { toggleWindow, windowsSelector } from "../redux/slices/appSlice";
import { planQueueSelector } from "../redux/slices/planSlice";
import { sigmetSelector } from "../redux/slices/weatherSlice";
import { edstFontGrey } from "../styles/colors";
import { sectorIdSelector } from "../redux/slices/sectorSlice";
import { entriesSelector } from "../redux/slices/entrySlice";
import { EdstWindow } from "../typeDefinitions/enums/edstWindow";
import { eramFontFamily } from "../styles/styles";
import { edstHeaderButton } from "../typeDefinitions/enums/edstHeaderButton";
import { openWindowThunk } from "../redux/thunks/openWindowThunk";

const DISABLED_HEADER_BUTTONS = [
  edstHeaderButton.not,
  edstHeaderButton.ua,
  edstHeaderButton.keep,
  edstHeaderButton.adsb,
  edstHeaderButton.sat,
  edstHeaderButton.msg,
  edstHeaderButton.wind,
  edstHeaderButton.fel,
  edstHeaderButton.cpdlcHist,
  edstHeaderButton.cpdlcMsgOut
];

const YELLOW = "#A3A300";
// const RED = "#590000";

const EdstHeaderDiv = styled.div`
  margin-top: 2px;
  font-family: ${eramFontFamily};
  width: 100vw;
  position: absolute;
`;

const EdstHeaderRow = styled.div`
  z-index: 20001;
  //height: 2em;
  line-height: 13px;
  font-size: 14px;
  justify-content: space-between;
  display: flex;
`;

const EdstHeaderCol = styled.div<{ bottomRow?: boolean }>`
  z-index: 20001;
  margin: 1px;
  display: inline-flex;
  ${props => props.bottomRow && { "margin-left": "73px" }};

  span {
    display: inline-flex;
  }
`;

type ColButtonProps = Partial<{
  width: number;
  color: string;
  open: boolean;
  fontWeight: string;
  backgroundColor: string;
  borderColor: string;
}>;

const ColButton = styled.button.attrs((props: ColButtonProps) => ({
  width: `${props.width ?? 66}px`,
  backgroundColor: props.open ? "#595959" : props.backgroundColor ?? "#000000",
  color: props.color ?? edstFontGrey,
  fontWeight: props.fontWeight ?? "normal",
  border: `1px solid ${props.borderColor ?? "#adadad"}`
}))<ColButtonProps>`
  display: flex;
  justify-content: center;
  line-height: inherit;
  font-size: inherit;
  width: ${props => props.width};
  height: 2em;
  margin: 0 1px;
  border: ${props => props.border};
  background-color: ${props => props.backgroundColor};
  color: ${props => props.color};
  font-weight: ${props => props.fontWeight};

  &:hover {
    border: 1px solid #ffffff;
  }

  &:disabled {
    border: 1px solid #707070;
    color: #707070;
  }
`;

type EdstHeaderButtonProps = Partial<{
  title: string;
  width: number;
  open: boolean;
  backgroundColor: string;
  borderColor: string;
  color: string;
  disabled: boolean;
  content: string;
  onMouseDown: () => void;
}>;

const EdstHeaderButton = ({ title, content, ...props }: EdstHeaderButtonProps) => (
  <EdstTooltip title={title}>
    <ColButton {...props} open={props.open} width={props.width} disabled={props.disabled} onMouseDown={props.onMouseDown}>
      {content}
    </ColButton>
  </EdstTooltip>
);

const EdstHeaderButton50 = (props: EdstHeaderButtonProps) => <EdstHeaderButton width={50} {...props} />;

export const EdstHeader = () => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const windows = useRootSelector(windowsSelector);

  const sectorId = useRootSelector(sectorIdSelector);
  const entries = useRootSelector(entriesSelector);
  const aclLen = Object.values(entries).filter(entry => entry.status === "Active" && !entry.deleted).length;
  const depLen = Object.values(entries).filter(entry => entry.status === "Proposed" && !entry.deleted).length;
  const sigmets = useRootSelector(sigmetSelector);
  const sigLen = Object.values(sigmets).filter(sigmetEntry => !sigmetEntry.acknowledged).length;
  const notLen = 0;
  const giLen = 0;

  return (
    <EdstHeaderDiv>
      <EdstHeaderRow>
        <EdstHeaderCol>
          <ColButton width={18} fontWeight="normal" disabled>
            {"\u{1F873}"}
          </ColButton>
          <ColButton
            width={50}
            open={windows[EdstWindow.MORE].open}
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.more)}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.MORE))}
          >
            MORE
          </ColButton>
          <EdstHeaderButton
            open={windows[EdstWindow.ACL].open}
            content={`ACL ${aclLen.toString().padStart(2, "0")}`}
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.acl)}
            title={Tooltips.acl}
            onMouseDown={() => dispatch(openWindowThunk(EdstWindow.ACL))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.DEP].open}
            content={`DEP ${depLen.toString().padStart(2, "0")}`}
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.dep)}
            title={Tooltips.dep}
            onMouseDown={() => dispatch(openWindowThunk(EdstWindow.DEP))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.GPD].open}
            content="GPD"
            disabled={process.env.NODE_ENV !== "development"}
            // title={Tooltips.gpd}
            onMouseDown={() => dispatch(openWindowThunk(EdstWindow.GPD))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.PLANS_DISPLAY].open}
            content="PLANS"
            disabled={planQueue.length === 0}
            title={Tooltips.plans}
            onMouseDown={() => dispatch(openWindowThunk(EdstWindow.PLANS_DISPLAY))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.METAR].open}
            content="WX REPORT"
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.wx)}
            // title={Tooltips.wx}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.METAR))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.SIGMETS].open}
            borderColor={sigLen > 0 ? YELLOW : undefined}
            color={sigLen > 0 ? YELLOW : undefined}
            content={`SIG ${sigLen > 0 ? sigLen.toString().padStart(2, "0") : "✓"}`}
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.sig)}
            // title={Tooltips.sig}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.SIGMETS))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.NOTAMS].open}
            content={`NOT ${notLen > 0 ? notLen.toString().padStart(2, "0") : ""}`}
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.not)}
            // title={Tooltips.not}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.NOTAMS))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.GI].open}
            content={`GI ${giLen > 0 ? giLen.toString().padStart(2, "0") : ""}`}
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.gi)}
            // title={Tooltips.gi}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.GI))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.UA].open}
            content="UA"
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.ua)}
            // title={Tooltips.ua}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.UA))}
          />
          <EdstHeaderButton
            open={false}
            content="KEEP ALL"
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.keep)}
            // title={Tooltips.keep}
            // onMouseDown={() => props.toggleWindow('keep')}
          />
        </EdstHeaderCol>
        <EdstHeaderCol>
          <EdstHeaderButton
            open={windows[EdstWindow.STATUS].open}
            content="STATUS ACTIVE"
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.status)}
            title={Tooltips.statusActive}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.STATUS))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.OUTAGE].open}
            content={`OUTAGE ${sectorId}`}
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.outage)}
            title={Tooltips.statusOutage}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.OUTAGE))}
          />
          <Time />
          <EdstHeaderButton50
            open={windows[EdstWindow.ADSB].open}
            content="NON-ADSB"
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.adsb)}
            // title={Tooltips.adsb}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.ADSB))}
          />
          <EdstHeaderButton50
            open={windows[EdstWindow.SAT].open}
            content="SAT COMM"
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.sat)}
            // title={Tooltips.sat}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.SAT))}
          />
          <EdstHeaderButton50
            open={windows[EdstWindow.MSG].open}
            // backgroundColor={YELLOW}
            // borderColor={YELLOW}
            content="MSG WAIT"
            disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.msg)}
            // title={Tooltips.msg}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.MSG))}
          />
        </EdstHeaderCol>
      </EdstHeaderRow>
      {windows[EdstWindow.MORE].open && (
        <EdstHeaderRow>
          <EdstHeaderCol bottomRow>
            <EdstHeaderButton
              open={windows[EdstWindow.WIND].open}
              content="WIND"
              disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.wind)}
              // title={Tooltips.wind}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.WIND))}
            />
            <EdstHeaderButton
              open={windows[EdstWindow.ALTIMETER].open}
              content="ALTIM SET"
              disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.altim)}
              // title={Tooltips.alt}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.ALTIMETER))}
            />
            <EdstHeaderButton
              open={windows[EdstWindow.MESSAGE_COMPOSE_AREA].open}
              content="MCA"
              disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.mca)}
              title={Tooltips.mca}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.MESSAGE_COMPOSE_AREA))}
            />
            <EdstHeaderButton
              open={windows[EdstWindow.MESSAGE_RESPONSE_AREA].open}
              content="RA"
              disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.mra)}
              title={Tooltips.ra}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.MESSAGE_RESPONSE_AREA))}
            />
            <EdstHeaderButton
              open={windows[EdstWindow.FEL].open}
              content="FEL"
              disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.fel)}
              // title={Tooltips.fel}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.FEL))}
            />
            <EdstHeaderButton
              open={windows[EdstWindow.CPDLC_HIST].open}
              content="CPDLC HIST"
              disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.cpdlcHist)}
              // title={Tooltips.cpdlc_hist}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.CPDLC_HIST))}
            />
            <EdstHeaderButton
              open={windows[EdstWindow.CPDLC_MSG].open}
              content="CPDLC MSGOUT"
              disabled={DISABLED_HEADER_BUTTONS.includes(edstHeaderButton.cpdlcMsgOut)}
              // title={Tooltips.cpdlc_msg_out}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.CPDLC_MSG))}
            />
          </EdstHeaderCol>
        </EdstHeaderRow>
      )}
    </EdstHeaderDiv>
  );
};
