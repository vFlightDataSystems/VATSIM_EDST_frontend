import '../css/edst/edst-header-styles.scss';
import {Time} from "./Time";
import {Tooltips} from "../tooltips";
import {EdstTooltip} from "./resources/EdstTooltip";
import React from "react";
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {edstHeaderButtonEnum, windowEnum} from "../enums";
import {openWindow, toggleWindow} from "../redux/slices/appSlice";
import {planQueueSelector} from "../redux/slices/planSlice";


type EdstHeaderButtonProps = {
  title?: string,
  className?: string,
  open: boolean,
  disabled?: boolean,
  content?: string,
  onMouseDown?: () => void
}

const EdstHeaderButton: React.FC<EdstHeaderButtonProps> = (props) => {
  return (<EdstTooltip title={props.title}>
    <button className={`${props.className} ${props.open ? 'open' : ''}`}
            disabled={props.disabled}
            onMouseDown={props.onMouseDown}
    >
      {props.content}
    </button>
  </EdstTooltip>);
};

export const EdstHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const planQueue = useAppSelector(planQueueSelector);
  const windows = useAppSelector((state) => state.app.windows);
  const disabledHeaderButtons = useAppSelector((state) =>state.app.disabledHeaderButtons);

  const sectorId = useAppSelector((state) => state.sectorData.sectorId);
  const entries = useAppSelector(state => state.entries);
  const aclLen = Object.values(entries).filter(entry => entry.aclDisplay).length;
  const depLen = Object.values(entries).filter(entry => entry.depDisplay).length;
  const sigLen = 0, notLen = 0, giLen = 0;

  return (
    <div className="edst-header">
      <div className="edst-header-row">
        <div className="edst-header-row-left">
          <button className="tiny" disabled={true}>
            🡳
          </button>
          <button className={`small ${windows[windowEnum.more].open ? 'open' : ''}`}
                  disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.more)}
                  onMouseDown={() => dispatch(toggleWindow(windowEnum.more))}
          >
            MORE
          </button>
          <EdstHeaderButton open={windows[windowEnum.acl].open}
                            content={`ACL ${aclLen.toString().padStart(2, '0')}`}
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.acl)}
                            title={Tooltips.acl}
                            onMouseDown={() => dispatch(openWindow({window: windowEnum.acl}))}
          />
          <EdstHeaderButton open={windows[windowEnum.dep].open}
                            content={`DEP ${depLen.toString().padStart(2, '0')}`}
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.dep)}
                            title={Tooltips.dep}
                            onMouseDown={() => dispatch(openWindow({window: windowEnum.dep}))}
          />
          <EdstHeaderButton open={windows[windowEnum.graphicPlanDispay].open}
                            content="GPD"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.gpd)}
            // title={Tooltips.gpd}
                            onMouseDown={() => dispatch(openWindow({window: windowEnum.graphicPlanDispay}))}
          />
          <EdstHeaderButton open={windows[windowEnum.plansDisplay].open}
                            content="PLANS"
                            disabled={planQueue.length === 0}
                            title={Tooltips.plans}
                            onMouseDown={() =>dispatch(openWindow({window: windowEnum.plansDisplay}))}
          />
          <EdstHeaderButton open={windows[windowEnum.weather].open}
                            content="WX REPORT"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.wx)}
            // title={Tooltips.wx}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.weather))}
          />
          <EdstHeaderButton open={windows[windowEnum.sigmets].open}
                            content={`SIG ${sigLen > 0 ? sigLen.toString().padStart(2, '0') : ''}`}
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.sig)}
            // title={Tooltips.sig}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.sigmets))}
          />
          <EdstHeaderButton open={windows[windowEnum.notams].open}
                            content={`NOT ${notLen > 0 ? notLen.toString().padStart(2, '0') : ''}`}
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.not)}
            // title={Tooltips.not}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.notams))}
          />
          <EdstHeaderButton open={windows[windowEnum.generalInfo].open}
                            content={`GI ${giLen > 0 ? giLen.toString().padStart(2, '0') : ''}`}
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.gi)}
            // title={Tooltips.gi}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.generalInfo))}
          />
          <EdstHeaderButton open={windows[windowEnum.ua].open}
                            content="UA"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.ua)}
            // title={Tooltips.ua}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.ua))}
          />
          <EdstHeaderButton open={false}
                            content="KEEP ALL"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.keep)}
            // title={Tooltips.keep}
            // onMouseDown={() => props.toggleWindow('keep')}
          />
        </div>
        <div className="edst-header-row-right">
          <EdstHeaderButton open={windows[windowEnum.status].open}
                            content="STATUS ACTIVE"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.status)}
                            title={Tooltips.statusActive}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.status))}
          />
          <EdstHeaderButton open={windows[windowEnum.outage].open}
                            content={`OUTAGE ${sectorId}`}
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.outage)}
                            title={Tooltips.statusOutage}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.outage))}
          />
          <Time/>
          <EdstHeaderButton open={windows[windowEnum.adsb].open}
                            className="small"
                            content="NON-ADSB"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.adsb)}
            // title={Tooltips.adsb}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.adsb))}
          />
          <EdstHeaderButton open={windows[windowEnum.sat].open}
                            className="small"
                            content="SAT COMM"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.sat)}
            // title={Tooltips.sat}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.sat))}
          />
          <EdstHeaderButton open={windows[windowEnum.msg].open}
                            className="small yellow-border"
                            content="MSG WAIT"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.msg)}
            // title={Tooltips.msg}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.msg))}
          />
        </div>
      </div>
      {windows[windowEnum.more].open && <div className="edst-header-row">
        <div className="edst-header-row-left-2">
          <EdstHeaderButton open={windows[windowEnum.wind].open}
                            content="WIND"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.wind)}
            // title={Tooltips.wind}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.wind))}
          />
          <EdstHeaderButton open={windows[windowEnum.altimeter].open}
                            content="ALTIM SET"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.altim)}
            // title={Tooltips.alt}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.altimeter))}
          />
          <EdstHeaderButton open={windows[windowEnum.messageComposeArea].open}
                            content="MCA"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.mca)}
                            title={Tooltips.mca}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.messageComposeArea))}
          />
          <EdstHeaderButton open={windows[windowEnum.messageResponseArea].open}
                            content="RA"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.mra)}
                            title={Tooltips.ra}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.messageResponseArea))}
          />
          <EdstHeaderButton open={windows[windowEnum.fel].open}
                            content="FEL"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.fel)}
            // title={Tooltips.fel}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.fel))}
          />
          <EdstHeaderButton open={windows[windowEnum.cpdlcHist].open}
                            className="yellow-border yellow-background"
                            content="CPDLC HIST"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.cpdlc_hist)}
            // title={Tooltips.cpdlc_hist}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.cpdlcHist))}
          />
          <EdstHeaderButton open={windows[windowEnum.cpdlcMsgOut].open}
                            className="yellow-border yellow-background"
                            content="CPDLC MSGOUT"
                            disabled={disabledHeaderButtons.includes(edstHeaderButtonEnum.cpdlc_msg_out)}
            // title={Tooltips.cpdlc_msg_out}
                            onMouseDown={() =>dispatch(toggleWindow(windowEnum.cpdlcMsgOut))}
          />
        </div>
      </div>}
    </div>
  );
};
