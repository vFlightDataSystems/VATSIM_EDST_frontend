import React from "react";
import styled from "styled-components";
import { Time } from "./Time";
import { Tooltips } from "../tooltips";
import { EdstTooltip } from "./resources/EdstTooltip";
import { useRootDispatch, useRootSelector } from "../redux/hooks";
import { edstHeaderButton, EdstWindow } from "../enums";
import { disabledHeaderButtonsSelector, openWindow, toggleWindow, windowsSelector } from "../redux/slices/appSlice";
import { planQueueSelector } from "../redux/slices/planSlice";
import { sigmetSelector } from "../redux/slices/weatherSlice";
import { edstFontGrey } from "../styles/colors";
import { sectorIdSelector } from "../redux/slices/sectorSlice";
import { entriesSelector } from "../redux/slices/entriesSlice";

const YELLOW = "#A3A300";
// const RED = "#590000";

const EdstHeaderDiv = styled.div`
  width: 100vw;
  position: absolute;
`;

const EdstHeaderRow = styled.div`
  z-index: 20001;
  height: 30px;
  margin: 2px 0;
  justify-content: space-between;
  display: flex;
`;

const EdstHeaderCol = styled.div<{ bottomRow?: boolean }>`
  z-index: 20001;
  margin: 1px 1px;
  display: inline-flex;
  ${props => props.bottomRow && { "margin-left": "73px" }};

  span {
    display: inline-flex;
  }
`;

const ColButton = styled.button<{
  width?: number;
  height?: number;
  open?: boolean;
  fontWeight?: string;
  backgroundColor?: string;
  borderColor?: string;
}>`
  display: flex;
  justify-content: center;
  line-height: 13px;
  font-size: 13px;
  width: ${props => (props.width ? `${props.width}px` : "70px")};
  height: ${props => (props.height ? `${props.height}px` : "30px")};
  margin: 0 1px;
  border: 1px solid #adadad;
  background-color: ${props => props.backgroundColor ?? "#000000"};
  color: ${props => props.color ?? edstFontGrey};
  font-weight: ${props => props.fontWeight ?? "bolder"};

  &:hover {
    border: 1px solid #ffffff;
  }

  &:disabled {
    border: 1px solid #707070;
    color: #707070;
  }

  ${props =>
    props.borderColor && {
      border: `1px solid ${props.borderColor}`
    }}
  ${props =>
    props.open && {
      "background-color": "#595959"
    }}
`;

type EdstHeaderButtonProps = {
  title?: string;
  width?: number;
  open: boolean;
  backgroundColor?: string;
  borderColor?: string;
  color?: string;
  disabled?: boolean;
  content?: string;
  onMouseDown?: () => void;
};

const EdstHeaderButton: React.FC<EdstHeaderButtonProps> = ({ title, content, ...props }) => (
  <EdstTooltip title={title}>
    <ColButton {...props} open={props.open} width={props.width} disabled={props.disabled} onMouseDown={props.onMouseDown}>
      {content}
    </ColButton>
  </EdstTooltip>
);
const EdstHeaderButton50: React.FC<EdstHeaderButtonProps> = props => <EdstHeaderButton width={50} {...props} />;

export const EdstHeader: React.FC = () => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const windows = useRootSelector(windowsSelector);
  const disabledHeaderButtons = useRootSelector(disabledHeaderButtonsSelector);

  const sectorId = useRootSelector(sectorIdSelector);
  const entries = useRootSelector(entriesSelector);
  const aclLen = Object.values(entries).filter(entry => entry.aclDisplay).length;
  const depLen = Object.values(entries).filter(entry => entry.depDisplay).length;
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
            open={windows[EdstWindow.more].open}
            disabled={disabledHeaderButtons.includes(edstHeaderButton.more)}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.more))}
          >
            MORE
          </ColButton>
          <EdstHeaderButton
            open={windows[EdstWindow.acl].open}
            content={`ACL ${aclLen.toString().padStart(2, "0")}`}
            disabled={disabledHeaderButtons.includes(edstHeaderButton.acl)}
            title={Tooltips.acl}
            onMouseDown={() => dispatch(openWindow({ window: EdstWindow.acl }))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.dep].open}
            content={`DEP ${depLen.toString().padStart(2, "0")}`}
            disabled={disabledHeaderButtons.includes(edstHeaderButton.dep)}
            title={Tooltips.dep}
            onMouseDown={() => dispatch(openWindow({ window: EdstWindow.dep }))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.graphicPlanDisplay].open}
            content="GPD"
            disabled={process.env.NODE_ENV !== "development"}
            // title={Tooltips.gpd}
            onMouseDown={() => dispatch(openWindow({ window: EdstWindow.graphicPlanDisplay }))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.plansDisplay].open}
            content="PLANS"
            disabled={planQueue.length === 0}
            title={Tooltips.plans}
            onMouseDown={() => dispatch(openWindow({ window: EdstWindow.plansDisplay }))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.metar].open}
            content="WX REPORT"
            disabled={disabledHeaderButtons.includes(edstHeaderButton.wx)}
            // title={Tooltips.wx}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.metar))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.sigmets].open}
            borderColor={sigLen > 0 ? YELLOW : undefined}
            color={sigLen > 0 ? YELLOW : undefined}
            content={`SIG ${sigLen > 0 ? sigLen.toString().padStart(2, "0") : "✓"}`}
            disabled={disabledHeaderButtons.includes(edstHeaderButton.sig)}
            // title={Tooltips.sig}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.sigmets))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.notams].open}
            content={`NOT ${notLen > 0 ? notLen.toString().padStart(2, "0") : ""}`}
            disabled={disabledHeaderButtons.includes(edstHeaderButton.not)}
            // title={Tooltips.not}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.notams))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.generalInfo].open}
            content={`GI ${giLen > 0 ? giLen.toString().padStart(2, "0") : ""}`}
            disabled={disabledHeaderButtons.includes(edstHeaderButton.gi)}
            // title={Tooltips.gi}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.generalInfo))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.ua].open}
            content="UA"
            disabled={disabledHeaderButtons.includes(edstHeaderButton.ua)}
            // title={Tooltips.ua}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.ua))}
          />
          <EdstHeaderButton
            open={false}
            content="KEEP ALL"
            disabled={disabledHeaderButtons.includes(edstHeaderButton.keep)}
            // title={Tooltips.keep}
            // onMouseDown={() => props.toggleWindow('keep')}
          />
        </EdstHeaderCol>
        <EdstHeaderCol>
          <EdstHeaderButton
            open={windows[EdstWindow.status].open}
            content="STATUS ACTIVE"
            disabled={disabledHeaderButtons.includes(edstHeaderButton.status)}
            title={Tooltips.statusActive}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.status))}
          />
          <EdstHeaderButton
            open={windows[EdstWindow.outage].open}
            content={`OUTAGE ${sectorId}`}
            disabled={disabledHeaderButtons.includes(edstHeaderButton.outage)}
            title={Tooltips.statusOutage}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.outage))}
          />
          <Time />
          <EdstHeaderButton50
            open={windows[EdstWindow.adsb].open}
            content="NON-ADSB"
            disabled={disabledHeaderButtons.includes(edstHeaderButton.adsb)}
            // title={Tooltips.adsb}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.adsb))}
          />
          <EdstHeaderButton50
            open={windows[EdstWindow.sat].open}
            content="SAT COMM"
            disabled={disabledHeaderButtons.includes(edstHeaderButton.sat)}
            // title={Tooltips.sat}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.sat))}
          />
          <EdstHeaderButton50
            open={windows[EdstWindow.msg].open}
            // backgroundColor={YELLOW}
            // borderColor={YELLOW}
            content="MSG WAIT"
            disabled={disabledHeaderButtons.includes(edstHeaderButton.msg)}
            // title={Tooltips.msg}
            onMouseDown={() => dispatch(toggleWindow(EdstWindow.msg))}
          />
        </EdstHeaderCol>
      </EdstHeaderRow>
      {windows[EdstWindow.more].open && (
        <EdstHeaderRow>
          <EdstHeaderCol bottomRow>
            <EdstHeaderButton
              open={windows[EdstWindow.wind].open}
              content="WIND"
              disabled={disabledHeaderButtons.includes(edstHeaderButton.wind)}
              // title={Tooltips.wind}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.wind))}
            />
            <EdstHeaderButton
              open={windows[EdstWindow.altimeter].open}
              content="ALTIM SET"
              disabled={disabledHeaderButtons.includes(edstHeaderButton.altim)}
              // title={Tooltips.alt}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.altimeter))}
            />
            <EdstHeaderButton
              open={windows[EdstWindow.messageComposeArea].open}
              content="MCA"
              disabled={disabledHeaderButtons.includes(edstHeaderButton.mca)}
              title={Tooltips.mca}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.messageComposeArea))}
            />
            <EdstHeaderButton
              open={windows[EdstWindow.messageResponseArea].open}
              content="RA"
              disabled={disabledHeaderButtons.includes(edstHeaderButton.mra)}
              title={Tooltips.ra}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.messageResponseArea))}
            />
            <EdstHeaderButton
              open={windows[EdstWindow.fel].open}
              content="FEL"
              disabled={disabledHeaderButtons.includes(edstHeaderButton.fel)}
              // title={Tooltips.fel}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.fel))}
            />
            <EdstHeaderButton
              open={windows[EdstWindow.cpdlcHist].open}
              backgroundColor={YELLOW}
              borderColor={YELLOW}
              content="CPDLC HIST"
              disabled={disabledHeaderButtons.includes(edstHeaderButton.cpdlcHist)}
              // title={Tooltips.cpdlc_hist}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.cpdlcHist))}
            />
            <EdstHeaderButton
              open={windows[EdstWindow.cpdlcMsgOut].open}
              backgroundColor={YELLOW}
              borderColor={YELLOW}
              content="CPDLC MSGOUT"
              disabled={disabledHeaderButtons.includes(edstHeaderButton.cpdlcMsgOut)}
              // title={Tooltips.cpdlc_msg_out}
              onMouseDown={() => dispatch(toggleWindow(EdstWindow.cpdlcMsgOut))}
            />
          </EdstHeaderCol>
        </EdstHeaderRow>
      )}
    </EdstHeaderDiv>
  );
};
