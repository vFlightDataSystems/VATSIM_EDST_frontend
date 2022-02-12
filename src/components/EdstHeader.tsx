import '../css/edst/edst-header-styles.scss';
import {Time} from "./Time";
import {Tooltips} from "../tooltips";
import {EdstTooltip} from "./resources/EdstTooltip";
import React from "react";
import {useAppSelector} from '../redux/hooks';

interface EdstHeaderButtonProps {
  title?: string;
  className?: string;
  open: boolean;
  disabled?: boolean;
  content?: string;
  onMouseDown?: () => void;
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

interface EdstHeaderProps {
  openWindows: Set<string>;
  planDisabled: boolean;
  disabledWindows: string[];
  openWindow: Function;
  toggleWindow: Function;
}

export const EdstHeader: React.FC<EdstHeaderProps> = (props) => {
  const {
    openWindows,
    planDisabled,
    disabledWindows,
  } = props;
  const sectorId = useAppSelector((state) => state.sectorData.sectorId);
  const aclNum = useAppSelector(state => state.acl.cidList.length);
  const depNum = useAppSelector(state => state.dep.cidList.length);
  const sigNum = 0, notNum = 0, giNum = 0;

  return (
    <div className="edst-header">
      <div className="edst-header-row">
        <div className="edst-header-row-left">
          <button className="tiny" disabled={true}>
            🡳
          </button>
          <button className={`small ${openWindows.has('more') ? 'open' : ''}`}
                  disabled={disabledWindows.includes('more')}
                  onMouseDown={() => props.toggleWindow('more')}
          >
            MORE
          </button>
          <EdstHeaderButton open={openWindows.has('acl')}
                            content={`ACL ${aclNum.toString().padStart(2, '0')}`}
                            disabled={disabledWindows.includes('acl')}
                            title={Tooltips.acl}
                            onMouseDown={() => props.openWindow('acl')}
          />
          <EdstHeaderButton open={openWindows.has('dep')}
                            content={`DEP ${depNum.toString().padStart(2, '0')}`}
                            disabled={disabledWindows.includes('dep')}
                            title={Tooltips.dep}
                            onMouseDown={() => props.openWindow('dep')}
          />
          <EdstHeaderButton open={openWindows.has('gpd')}
                            content="GPD"
                            disabled={disabledWindows.includes('gpd')}
            // title={Tooltips.gpd}
                            onMouseDown={() => props.openWindow('gpd')}
          />
          <EdstHeaderButton open={openWindows.has('plans')}
                            content="PLANS"
                            disabled={planDisabled}
                            title={Tooltips.plans}
                            onMouseDown={() => props.openWindow('plans')}
          />
          <EdstHeaderButton open={openWindows.has('wx')}
                            content="WX REPORT"
                            disabled={planDisabled}
            // title={Tooltips.wx}
                            onMouseDown={() => props.toggleWindow('wx')}
          />
          <EdstHeaderButton open={openWindows.has('sig')}
                            content={`SIG ${sigNum > 0 ? sigNum.toString().padStart(2, '0') : ''}`}
                            disabled={disabledWindows.includes('sig')}
            // title={Tooltips.sig}
                            onMouseDown={() => props.toggleWindow('sig')}
          />
          <EdstHeaderButton open={openWindows.has('not')}
                            content={`NOT ${notNum > 0 ? notNum.toString().padStart(2, '0') : ''}`}
                            disabled={disabledWindows.includes('not')}
            // title={Tooltips.not}
                            onMouseDown={() => props.toggleWindow('not')}
          />
          <EdstHeaderButton open={openWindows.has('gi')}
                            content={`GI ${giNum > 0 ? giNum.toString().padStart(2, '0') : ''}`}
                            disabled={disabledWindows.includes('gi')}
            // title={Tooltips.gi}
                            onMouseDown={() => props.toggleWindow('gi')}
          />
          <EdstHeaderButton open={openWindows.has('ua')}
                            content="UA"
                            disabled={disabledWindows.includes('ua')}
            // title={Tooltips.ua}
                            onMouseDown={() => props.toggleWindow('ua')}
          />
          <EdstHeaderButton open={openWindows.has('keep')}
                            content="KEEP ALL"
                            disabled={disabledWindows.includes('keep')}
            // title={Tooltips.keep}
            // onMouseDown={() => props.toggleWindow('keep')}
          />
        </div>
        <div className="edst-header-row-right">
          <EdstHeaderButton open={openWindows.has('status')}
                            content="STATUS ACTIVE"
                            disabled={disabledWindows.includes('status')}
                            title={Tooltips.statusActive}
                            onMouseDown={() => props.toggleWindow('status')}
          />
          <EdstHeaderButton open={openWindows.has('outage')}
                            content={`OUTAGE ${sectorId}`}
                            disabled={disabledWindows.includes('outage')}
                            title={Tooltips.statusOutage}
                            onMouseDown={() => props.toggleWindow('outage')}
          />
          <Time/>
          <EdstHeaderButton open={openWindows.has('adsb')}
                            className="small"
                            content="NON-ADSB"
                            disabled={disabledWindows.includes('adsb')}
            // title={Tooltips.adsb}
                            onMouseDown={() => props.toggleWindow('adsb')}
          />
          <EdstHeaderButton open={openWindows.has('sat')}
                            className="small"
                            content="SAT COMM"
                            disabled={disabledWindows.includes('sat')}
            // title={Tooltips.sat}
                            onMouseDown={() => props.toggleWindow('sat')}
          />
          <EdstHeaderButton open={openWindows.has('msg')}
                            className="small yellow-border"
                            content="MSG WAIT"
                            disabled={disabledWindows.includes('msg')}
            // title={Tooltips.msg}
                            onMouseDown={() => props.openWindow('msg')}
          />
        </div>
      </div>
      {openWindows.has('more') && <div className="edst-header-row">
        <div className="edst-header-row-left-2">
          <EdstHeaderButton open={openWindows.has('wind')}
                            content="WIND"
                            disabled={disabledWindows.includes('wind')}
            // title={Tooltips.wind}
                            onMouseDown={() => props.toggleWindow('wind')}
          />
          <EdstHeaderButton open={openWindows.has('alt')}
                            content="ALTIM SET"
                            disabled={disabledWindows.includes('alt')}
            // title={Tooltips.alt}
                            onMouseDown={() => props.toggleWindow('alt')}
          />
          <EdstHeaderButton open={openWindows.has('mca')}
                            content="MCA"
                            disabled={disabledWindows.includes('mca')}
                            title={Tooltips.mca}
                            onMouseDown={() => props.toggleWindow('mca')}
          />
          <EdstHeaderButton open={openWindows.has('mra')}
                            content="RA"
                            disabled={disabledWindows.includes('mra')}
                            title={Tooltips.ra}
                            onMouseDown={() => props.toggleWindow('mra')}
          />
          <EdstHeaderButton open={openWindows.has('fel')}
                            content="FEL"
                            disabled={disabledWindows.includes('fel')}
            // title={Tooltips.fel}
                            onMouseDown={() => props.toggleWindow('fel')}
          />
          <EdstHeaderButton open={openWindows.has('cpdlc-hist')}
                            className="yellow-border yellow-background"
                            content="CPDLC HIST"
                            disabled={disabledWindows.includes('cpdlc-hist')}
            // title={Tooltips.cpdlc_hist}
                            onMouseDown={() => props.toggleWindow('cpdlc-hist')}
          />
          <EdstHeaderButton open={openWindows.has('cpdlc-msg-out')}
                            className="yellow-border yellow-background"
                            content="CPDLC MSGOUT"
                            disabled={disabledWindows.includes('cpdlc-msg-out')}
            // title={Tooltips.cpdlc_msg_out}
                            onMouseDown={() => props.toggleWindow('cpdlc-msg-out')}
          />
        </div>
      </div>}
    </div>
  );
};
