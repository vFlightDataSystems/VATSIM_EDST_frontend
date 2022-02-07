import '../css/edst/edst-header-styles.scss';
import {Time} from "./Time";
import {Tooltips} from "../tooltips";
import {EdstTooltip} from "./resources/EdstTooltip";
import React from "react";
import { useAppSelector } from '../redux/hooks';

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
}

interface EdstHeaderProps {
  open_windows: Set<string>;
  plan_disabled: boolean;
  disabled_windows: Array<string>;
  sector_id: string;
  openWindow: Function;
  toggleWindow: Function;
}

export const EdstHeader: React.FC<EdstHeaderProps> = (props) => {
  const {
    open_windows,
    plan_disabled,
    disabled_windows,
    sector_id,
  } = props;
  const acl_num = useAppSelector(state => state.acl.cid_list.length);
  const dep_num = useAppSelector(state => state.dep.cid_list.length);
    const sig_num = 0, not_num = 0, gi_num = 0;

  return (
    <div className="edst-header">
      <div className="edst-header-row">
        <div className="edst-header-row-left">
          <button className="tiny" disabled={true}>
            🡳
          </button>
          <button className={`small ${open_windows.has('more') ? 'open' : ''}`}
            disabled={disabled_windows.includes('more')}
            onMouseDown={() => props.toggleWindow('more')}
          >
            MORE
          </button>
          <EdstHeaderButton open={open_windows.has('acl')}
            content={`ACL ${acl_num.toString().padStart(2, '0')}`}
            disabled={disabled_windows.includes('acl')}
            title={Tooltips.acl}
            onMouseDown={() => props.openWindow('acl')}
          />
          <EdstHeaderButton open={open_windows.has('dep')}
            content={`DEP ${dep_num.toString().padStart(2, '0')}`}
            disabled={disabled_windows.includes('dep')}
            title={Tooltips.dep}
            onMouseDown={() => props.openWindow('dep')}
          />
          <EdstHeaderButton open={open_windows.has('gpd')}
            content="GPD"
            disabled={disabled_windows.includes('gpd')}
            // title={Tooltips.gpd}
            onMouseDown={() => props.openWindow('gpd')}
          />
          <EdstHeaderButton open={open_windows.has('plans')}
            content="PLANS"
            disabled={plan_disabled}
            title={Tooltips.plans}
            onMouseDown={() => props.openWindow('plans')}
          />
          <EdstHeaderButton open={open_windows.has('wx')}
            content="WX REPORT"
            disabled={plan_disabled}
            // title={Tooltips.wx}
            onMouseDown={() => props.toggleWindow('wx')}
          />
          <EdstHeaderButton open={open_windows.has('sig')}
            content={`SIG ${sig_num > 0 ? sig_num.toString().padStart(2, '0') : ''}`}
            disabled={disabled_windows.includes('sig')}
            // title={Tooltips.sig}
            onMouseDown={() => props.toggleWindow('sig')}
          />
          <EdstHeaderButton open={open_windows.has('not')}
            content={`NOT ${not_num > 0 ? not_num.toString().padStart(2, '0') : ''}`}
            disabled={disabled_windows.includes('not')}
            // title={Tooltips.not}
            onMouseDown={() => props.toggleWindow('not')}
          />
          <EdstHeaderButton open={open_windows.has('gi')}
            content={`GI ${gi_num > 0 ? gi_num.toString().padStart(2, '0') : ''}`}
            disabled={disabled_windows.includes('gi')}
            // title={Tooltips.gi}
            onMouseDown={() => props.toggleWindow('gi')}
          />
          <EdstHeaderButton open={open_windows.has('ua')}
            content="UA"
            disabled={disabled_windows.includes('ua')}
            // title={Tooltips.ua}
            onMouseDown={() => props.toggleWindow('ua')}
          />
          <EdstHeaderButton open={open_windows.has('keep')}
            content="KEEP ALL"
            disabled={disabled_windows.includes('keep')}
          // title={Tooltips.keep}
          // onMouseDown={() => props.toggleWindow('keep')}
          />
        </div>
        <div className="edst-header-row-right">
          <EdstHeaderButton open={open_windows.has('status')}
            content="STATUS ACTIVE"
            disabled={disabled_windows.includes('status')}
            title={Tooltips.status_active}
            onMouseDown={() => props.toggleWindow('status')}
          />
          <EdstHeaderButton open={open_windows.has('outage')}
            content={`OUTAGE ${sector_id}`}
            disabled={disabled_windows.includes('outage')}
            title={Tooltips.status_outage}
            onMouseDown={() => props.toggleWindow('outage')}
          />
          <Time />
          <EdstHeaderButton open={open_windows.has('adsb')}
            className="small"
            content="NON-ADSB"
            disabled={disabled_windows.includes('adsb')}
            // title={Tooltips.adsb}
            onMouseDown={() => props.toggleWindow('adsb')}
          />
          <EdstHeaderButton open={open_windows.has('sat')}
            className="small"
            content="SAT COMM"
            disabled={disabled_windows.includes('sat')}
            // title={Tooltips.sat}
            onMouseDown={() => props.toggleWindow('sat')}
          />
          <EdstHeaderButton open={open_windows.has('msg')}
            className="small yellow-border"
            content="MSG WAIT"
            disabled={disabled_windows.includes('msg')}
            // title={Tooltips.msg}
            onMouseDown={() => props.openWindow('msg')}
          />
        </div>
      </div>
      {open_windows.has('more') && <div className="edst-header-row">
        <div className="edst-header-row-left-2">
          <EdstHeaderButton open={open_windows.has('wind')}
            content="WIND"
            disabled={disabled_windows.includes('wind')}
            // title={Tooltips.wind}
            onMouseDown={() => props.toggleWindow('wind')}
          />
          <EdstHeaderButton open={open_windows.has('alt')}
            content="ALTIM SET"
            disabled={disabled_windows.includes('alt')}
            // title={Tooltips.alt}
            onMouseDown={() => props.toggleWindow('alt')}
          />
          <EdstHeaderButton open={open_windows.has('mca')}
            content="MCA"
            disabled={disabled_windows.includes('mca')}
            title={Tooltips.mca}
            onMouseDown={() => props.toggleWindow('mca')}
          />
          <EdstHeaderButton open={open_windows.has('mra')}
            content="RA"
            disabled={disabled_windows.includes('mra')}
            title={Tooltips.ra}
            onMouseDown={() => props.toggleWindow('mra')}
          />
          <EdstHeaderButton open={open_windows.has('fel')}
            content="FEL"
            disabled={disabled_windows.includes('fel')}
            // title={Tooltips.fel}
            onMouseDown={() => props.toggleWindow('fel')}
          />
          <EdstHeaderButton open={open_windows.has('cpdlc-hist')}
            className="yellow-border yellow-background"
            content="CPDLC HIST"
            disabled={disabled_windows.includes('cpdlc-hist')}
            // title={Tooltips.cpdlc_hist}
            onMouseDown={() => props.toggleWindow('cpdlc-hist')}
          />
          <EdstHeaderButton open={open_windows.has('cpdlc-msg-out')}
            className="yellow-border yellow-background"
            content="CPDLC MSGOUT"
            disabled={disabled_windows.includes('cpdlc-msg-out')}
            // title={Tooltips.cpdlc_msg_out}
            onMouseDown={() => props.toggleWindow('cpdlc-msg-out')}
          />
        </div>
      </div>}
    </div>
  );
}
