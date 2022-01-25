import '../css/edst/edst-header-styles.scss';
import Time from "./Time";
import Tooltip from "@mui/material/Tooltip";
import {Tooltips} from "../tooltips";
import {useState} from "react";

export function EdstHeader(props) {
  const [tooltips_enabled, setTooltipsEnabled] = useState(false);
  const {
    open_windows,
    plan_disabled,
    disabled_windows,
    sector_id,
    acl_num,
    dep_num,
    sig_num,
    not_num,
    gi_num
  } = props;

  return (
    <div className="edst-header">
      <div className="edst-header-row">
        <div className="edst-header-row-left">
          <button className="tiny" disabled={true}>
            🡳
          </button>
          <button className={`small ${open_windows.has('more') ? 'enabled' : ''}`}
                  disabled={disabled_windows.includes('more')}
                  onMouseDown={() => props.toggleWindow('more')}
          >
            MORE
          </button>
          <Tooltip title={Tooltips.acl} disableHoverListener={!tooltips_enabled}>
            <button className={open_windows.has('acl') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('acl')}
                    onMouseDown={() => props.openWindow('acl')}
                    onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                    onMouseLeave={() => setTooltipsEnabled(false)}
            >
              ACL {acl_num.toString().padStart(2, '0')}
            </button>
          </Tooltip>
          <Tooltip title={Tooltips.dep} disableHoverListener={!tooltips_enabled}>
            <button className={open_windows.has('dep') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('dep')}
                    onMouseDown={() => props.openWindow('dep')}
                    onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                    onMouseLeave={() => setTooltipsEnabled(false)}
            >
              DEP {dep_num.toString().padStart(2, '0')}
            </button>
          </Tooltip>
          <button className={open_windows.has('gpd') ? 'enabled' : ''}
                  disabled={disabled_windows.includes('gpd')}
                  onMouseDown={() => props.openWindow('gpd')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            GPD
          </button>
          <Tooltip title={Tooltips.plans} disableHoverListener={!tooltips_enabled}>
            <button className={open_windows.has('plans') ? 'enabled' : ''}
                    disabled={plan_disabled}
                    onMouseDown={() => props.openWindow('plans')}
                    onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                    onMouseLeave={() => setTooltipsEnabled(false)}
            >
              PLANS
            </button>
          </Tooltip>
          <button className={open_windows.has('wx') ? 'enabled' : ''}
                  disabled={disabled_windows.includes('wx')}
                  onMouseDown={() => props.toggleWindow('wx')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            WX REPORT
          </button>
          <button className={`yellow-border ${open_windows.has('sig') ? 'enabled' : ''}`}
                  disabled={disabled_windows.includes('sig')}
                  onMouseDown={() => props.toggleWindow('sig')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            SIG {sig_num > 0 && sig_num.toString().padStart(2, '0')}
          </button>
          <button className={open_windows.has('not') ? 'enabled' : ''}
                  disabled={disabled_windows.includes('not')}
                  onMouseDown={() => props.toggleWindow('not')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            NOT {not_num > 0 && not_num.toString().padStart(2, '0')}
          </button>
          <button className={`yellow-border ${open_windows.has('gi') ? 'enabled' : ''}`}
                  disabled={disabled_windows.includes('gi')}
                  onMouseDown={() => props.toggleWindow('gi')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            GI {gi_num > 0 && ('0' + gi_num).slice(-2)}
          </button>
          <button className={open_windows.has('ua') ? 'enabled' : ''}
                  disabled={disabled_windows.includes('ua')}
                  onMouseDown={() => props.toggleWindow('ua')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            UA
          </button>
          <button className={open_windows.has('keep') ? 'enabled' : ''}
                  disabled={disabled_windows.includes('keep')}
                  onMouseDown={() => props.toggleWindow('keep')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            KEEP ALL
          </button>
        </div>
        <div className="edst-header-row-right">
          <Tooltip title={Tooltips.status_active} disableHoverListener={!tooltips_enabled}>
            <button className={open_windows.has('status') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('status')}
                    onMouseDown={() => props.toggleWindow('status')}
                    onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                    onMouseLeave={() => setTooltipsEnabled(false)}
            >
              STATUS ACTIVE
            </button>
          </Tooltip>
          <Tooltip title={Tooltips.status_outage} disableHoverListener={!tooltips_enabled}>
            <button className={`${open_windows.has('outage') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('outage')}
                    onMouseDown={() => props.toggleWindow('outage')}
                    onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                    onMouseLeave={() => setTooltipsEnabled(false)}
            >
              OUTAGE {sector_id}
            </button>
          </Tooltip>
          <Time/>
          <button className={`small ${open_windows.has('adsb') ? 'enabled' : ''}`}
                  disabled={disabled_windows.includes('adsb')}
                  onMouseDown={() => props.openWindow('adsb')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            NON-ADSB
          </button>
          <button className={`small ${open_windows.has('sat') ? 'enabled' : ''}`}
                  disabled={disabled_windows.includes('sat')}
                  onMouseDown={() => props.toggleWindow('sat')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            SAT COMM
          </button>
          <button className={`small yellow-border ${open_windows.has('msg') ? 'enabled' : ''}`}
                  disabled={disabled_windows.includes('msg')}
                  onMouseDown={() => props.openWindow('msg')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            MSG WAIT
          </button>
        </div>
      </div>
      {open_windows.has('more') && <div className="edst-header-row">
        <div className="edst-header-row-left-2">
          <button className={open_windows.has('wind') ? 'enabled' : ''}
                  disabled={disabled_windows.includes('wind')}
                  onMouseDown={() => props.toggleWindow('wind')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            WIND
          </button>
          <button className={open_windows.has('alt') ? 'enabled' : ''}
                  disabled={disabled_windows.includes('alt')}
                  onMouseDown={() => props.toggleWindow('alt')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            ALTIM SET
          </button>
          <Tooltip title={Tooltips.mca} disableHoverListener={!tooltips_enabled}>
            <button className={open_windows.has('mca') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('mca')}
                    onMouseDown={() => props.toggleWindow('mca')}
                    onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                    onMouseLeave={() => setTooltipsEnabled(false)}
            >
              MCA
            </button>
          </Tooltip>
          <Tooltip title={Tooltips.ra} disableHoverListener={!tooltips_enabled}>
            <button className={open_windows.has('mra') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('mra')}
                    onMouseDown={() => props.toggleWindow('mra')}
                    onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                    onMouseLeave={() => setTooltipsEnabled(false)}
            >
              RA
            </button>
          </Tooltip>
          <button className={open_windows.has('fel') ? 'enabled' : ''}
                  disabled={disabled_windows.includes('fel')}
                  onMouseDown={() => props.toggleWindow('fel')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            FEL
          </button>
          <button className={`yellow-border yellow-background ${open_windows.has('cpdlc-hist') ? 'enabled' : ''}`}
                  disabled={disabled_windows.includes('cpdlc-hist')}
                  onMouseDown={() => props.toggleWindow('cpdlc-hist')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            CPDLC HIST
          </button>
          <button className={`yellow-border yellow-background ${open_windows.has('cpdlc-msg-out') ? 'enabled' : ''}`}
                  disabled={disabled_windows.includes('cpdlc-msg-out')}
                  onMouseDown={() => props.toggleWindow('cpdlc-msg-out')}
                  onMouseEnter={(e) => e.shiftKey && setTooltipsEnabled(true)}
                  onMouseLeave={() => setTooltipsEnabled(false)}
          >
            CPDLC MSGOUT
          </button>
        </div>
      </div>}
    </div>
  );
}