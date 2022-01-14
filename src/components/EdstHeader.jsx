import '../css/edst/edst-header-styles.scss';
import Time from "./Time";

export function EdstHeader(props) {
    const {open_windows, plan_disabled, disabled_windows, sector_id, acl_num, dep_num, sig_num, not_num, gi_num} = props;

    return (
      <div className="edst-header">
        <div className="edst-header-row">
          <div className="edst-header-row-left">
            <button className="tiny" disabled={true}>
              🡳
            </button>
            <button className={`small ${open_windows.includes('more') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('more')}
                    onMouseDown={() => props.toggleWindow('more')}
            >
              MORE
            </button>
            <button className={open_windows.includes('acl') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('acl')}
                    onMouseDown={() => props.openWindow('acl')}
            >
              ACL {acl_num.toString().padStart(2, '0')}
            </button>
            <button className={open_windows.includes('dep') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('dep')}
                    onMouseDown={() => props.openWindow('dep')}
            >
              DEP {dep_num.toString().padStart(2, '0')}
            </button>
            <button className={open_windows.includes('gpd') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('gpd')}
                    onMouseDown={() => props.openWindow('gpd')}
            >
              GPD
            </button>
            <button className={open_windows.includes('plans') ? 'enabled' : ''}
                    disabled={plan_disabled}
                    onMouseDown={() => props.openWindow('plans')}
            >
              PLANS
            </button>
            <button className={open_windows.includes('wx') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('wx')}
                    onMouseDown={() => props.toggleWindow('wx')}
            >
              WX REPORT
            </button>
            <button className={`yellow-border ${open_windows.includes('sig') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('sig')}
                    onMouseDown={() => props.toggleWindow('sig')}
            >
              SIG {sig_num > 0 && sig_num.toString().padStart(2, '0')}
            </button>
            <button className={open_windows.includes('not') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('not')}
                    onMouseDown={() => props.toggleWindow('not')}
            >
              NOT {not_num > 0 && not_num.toString().padStart(2, '0')}
            </button>
            <button className={`yellow-border ${open_windows.includes('gi') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('gi')}
                    onMouseDown={() => props.toggleWindow('gi')}
            >
              GI {gi_num > 0 && ('0'+gi_num).slice(-2)}
            </button>
            <button className={open_windows.includes('ua') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('ua')}
                    onMouseDown={() => props.toggleWindow('ua')}
            >
              UA
            </button>
            <button className={open_windows.includes('keep') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('keep')}
                    onMouseDown={() => props.toggleWindow('keep')}
            >
              KEEP ALL
            </button>
          </div>
          <div className="edst-header-row-right">
            <button className={open_windows.includes('status') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('status')}
                    onMouseDown={() => props.toggleWindow('status')}
            >
              STATUS ACTIVE
            </button>
            <button className={`${open_windows.includes('outage') ? 'enabled': ''}`}
                    disabled={disabled_windows.includes('outage')}
                    onMouseDown={() => props.toggleWindow('outage')}
            >
              OUTAGE {sector_id}
            </button>
            <Time/>
            <button className={`small ${open_windows.includes('adsb') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('adsb')}
                    onMouseDown={() => props.openWindow('adsb')}
            >
              NON-ADSB
            </button>
            <button className={`small ${open_windows.includes('sat') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('sat')}
                    onMouseDown={() => props.toggleWindow('sat')}
            >
              SAT COMM
            </button>
            <button className={`small yellow-border ${open_windows.includes('msg') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('msg')}
                    onMouseDown={() => props.openWindow('msg')}
            >
              MSG WAIT
            </button>
          </div>
        </div>
        {open_windows.includes('more') && <div className="edst-header-row">
          <div className="edst-header-row-left-2">
            <button className={open_windows.includes('wind') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('wind')}
                    onMouseDown={() => props.toggleWindow('wind')}
            >
              WIND
            </button>
            <button className={open_windows.includes('alt') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('alt')}
                    onMouseDown={() => props.toggleWindow('alt')}
            >
              ALTIM SET
            </button>
            <button className={open_windows.includes('mca') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('mca')}
                    onMouseDown={() => props.toggleWindow('mca')}
            >
              MCA
            </button>
            <button className={open_windows.includes('ra') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('ra')}
                    onMouseDown={() => props.toggleWindow('ra')}
            >
              RA
            </button>
            <button className={open_windows.includes('fel') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('fel')}
                    onMouseDown={() => props.toggleWindow('fel')}
            >
              FEL
            </button>
            <button className={`yellow-border yellow-background ${open_windows.includes('cpdlc-hist') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('cpdlc-hist')}
                    onMouseDown={() => props.toggleWindow('cpdlc-hist')}
            >
              CPDLC HIST
            </button>
            <button className={`yellow-border yellow-background ${open_windows.includes('cpdlc-msg-out') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('cpdlc-msg-out')}
                    onMouseDown={() => props.toggleWindow('cpdlc-msg-out')}
            >
              CPDLC MSGOUT
            </button>
          </div>
        </div>}
      </div>);
  }