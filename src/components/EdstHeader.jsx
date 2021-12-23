import React from 'react';

import '../css/edst/edst-header-styles.scss';
import Time from "./Time";

export default class EdstHeader extends React.Component {

  render() {
    const {open_windows, disabled_windows, sector_id, acl_num, dep_num, sig_num, not_num, gi_num} = this.props;

    return (
      <div className="edst-header">
        <div className="edst-header-row">
          <div className="edst-header-row-left">
            <button className="tiny" disabled={true}>
              ↓
            </button>
            <button className={`small ${open_windows.includes('more') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('more')}
                    onMouseDown={() => this.props.toggleWindow('more')}
            >
              MORE
            </button>
            <button className={open_windows.includes('acl') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('acl')}
                    onMouseDown={() => this.props.openWindow('acl')}
            >
              ACL {acl_num > 0 && ('0'+acl_num).slice(-2)}
            </button>
            <button className={open_windows.includes('dep') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('dep')}
                    onMouseDown={() => this.props.openWindow('dep')}
            >
              DEP {dep_num > 0 && ('0'+dep_num).slice(-2)}
            </button>
            <button className={open_windows.includes('gpd') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('gpd')}
                    onMouseDown={() => this.props.openWindow('gpd')}
            >
              GPD
            </button>
            <button className={open_windows.includes('plans') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('plans')}
                    onMouseDown={() => this.props.openWindow('plans')}
            >
              PLANS
            </button>
            <button className={open_windows.includes('wx') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('wx')}
                    onMouseDown={() => this.props.toggleWindow('wx')}
            >
              WX REPORT
            </button>
            <button className={`yellow-border ${open_windows.includes('sig') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('sig')}
                    onMouseDown={() => this.props.toggleWindow('sig')}
            >
              SIG {sig_num > 0 && ('0'+sig_num).slice(-2)}
            </button>
            <button className={open_windows.includes('not') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('not')}
                    onMouseDown={() => this.props.toggleWindow('not')}
            >
              NOT {not_num > 0 && ('0'+not_num).slice(-2)}
            </button>
            <button className={`yellow-border ${open_windows.includes('gi') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('gi')}
                    onMouseDown={() => this.props.toggleWindow('gi')}
            >
              GI {gi_num > 0 && ('0'+gi_num).slice(-2)}
            </button>
            <button className={open_windows.includes('ua') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('ua')}
                    onMouseDown={() => this.props.toggleWindow('ua')}
            >
              UA
            </button>
            <button className={open_windows.includes('keep') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('keep')}
                    onMouseDown={() => this.props.toggleWindow('keep')}
            >
              KEEP ALL
            </button>
          </div>
          <div className="edst-header-row-right">
            <button className={open_windows.includes('status') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('status')}
                    onMouseDown={() => this.props.toggleWindow('status')}
            >
              STATUS ACTIVE
            </button>
            <button className={`${open_windows.includes('outage') ? 'enabled': ''}`}
                    disabled={disabled_windows.includes('outage')}
                    onMouseDown={() => this.props.toggleWindow('outage')}
            >
              OUTAGE {sector_id}
            </button>
            <Time/>
            <button className={`small ${open_windows.includes('adsb') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('adsb')}
                    onMouseDown={() => this.props.openWindow('adsb')}
            >
              NON-ADSB
            </button>
            <button className={`small ${open_windows.includes('sat') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('sat')}
                    onMouseDown={() => this.props.toggleWindow('sat')}
            >
              SAT COMM
            </button>
            <button className={`small yellow-border ${open_windows.includes('msg') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('msg')}
                    onMouseDown={() => this.props.openWindow('msg')}
            >
              MSG WAIT
            </button>
          </div>
        </div>
        {open_windows.includes('more') && <div className="edst-header-row">
          <div className="edst-header-row-left-2">
            <button className={open_windows.includes('wind') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('wind')}
                    onMouseDown={() => this.props.toggleWindow('wind')}
            >
              WIND
            </button>
            <button className={open_windows.includes('alt') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('alt')}
                    onMouseDown={() => this.props.toggleWindow('alt')}
            >
              ALTIM SET
            </button>
            <button className={open_windows.includes('mca') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('mca')}
                    onMouseDown={() => this.props.toggleWindow('mca')}
            >
              MCA
            </button>
            <button className={open_windows.includes('ra') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('ra')}
                    onMouseDown={() => this.props.toggleWindow('ra')}
            >
              RA
            </button>
            <button className={open_windows.includes('fel') ? 'enabled' : ''}
                    disabled={disabled_windows.includes('fel')}
                    onMouseDown={() => this.props.toggleWindow('fel')}
            >
              FEL
            </button>
            <button className={`yellow-border yellow-background ${open_windows.includes('cpdlc-hist') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('cpdlc-hist')}
                    onMouseDown={() => this.props.toggleWindow('cpdlc-hist')}
            >
              CPDLC HIST
            </button>
            <button className={`yellow-border yellow-background ${open_windows.includes('cpdlc-msg-out') ? 'enabled' : ''}`}
                    disabled={disabled_windows.includes('cpdlc-msg-out')}
                    onMouseDown={() => this.props.toggleWindow('cpdlc-msg-out')}
            >
              CPDLC MSGOUT
            </button>
          </div>
        </div>}
      </div>);
  }
}