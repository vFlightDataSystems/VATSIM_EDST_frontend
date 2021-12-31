import React from 'react';
import _ from 'lodash';
import '../../css/header-styles.scss';
import '../../css/windows/alt-menu-styles.scss';

export default class AltMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dep: this.props.asel?.window === 'dep',
      selected: this.props.asel.window !== 'dep' ? 'trial' : 'amend',
      interim_selected: false,
      t_hover: false,
      deltaY: 0
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.asel !== prevProps.asel) {
      this.setState({
        dep: this.props.asel?.window === 'dep',
        selected: this.props.asel.window !== 'dep' ? 'trial' : 'amend',
        alt_center: this.props.data?.altitude
      });
    }
  }

  render() {
    const {selected, t_hover, dep, deltaY} = this.state;
    const {data, pos} = this.props;

    return (<div
        className="alt-menu no-select"
        ref={this.routeMenuRef}
        id="alt-menu"
        style={{left: pos.x, top: pos.y}}
      >
        <div className={`alt-menu-header no-select`}
        >
          <div className="alt-menu-header-left">
            {data?.callsign}
          </div>
          <div className="alt-menu-header-right"
               onMouseDown={this.props.closeWindow}
          >
            X
          </div>
        </div>
        <div className={`alt-menu-row hover ${selected === 'trial' ? 'selected' : ''}`}
             onMouseDown={() => this.setState({selected: 'trial'})}
             disabled={dep}
        >
          TRIAL PLAN
        </div>
        <div className={`alt-menu-row hover ${selected === 'amend' ? 'selected' : ''}`}
             onMouseDown={() => this.setState({selected: 'amend'})}
        >
          AMEND
        </div>
        <div className={`alt-menu-row hover ${selected === 'fp' ? 'selected' : ''}`}
             onMouseDown={() => this.setState({selected: 'fp'})}
        >
          FP {data.altitude}
        </div>
        <div className={`alt-menu-row`} disabled={true}>
          {!dep ? 'PROCEDURE' : 'NO ALT'}
        </div>
        <div className="alt-menu-select-container"
             onWheel={(e) => this.setState({deltaY: deltaY + e.deltaY})}
        >
          {_.range(30, -40, -10).map(i => {
            const alt = Number(data?.altitude) - (deltaY / 100 | 0) * 10 + i;
            return <div
              className={`alt-menu-container-row ${((selected === 'amend') && (t_hover === alt)) ? 't-hover' : ''}`}
              key={`alt-${i}`}
            >
              <div className={`alt-menu-container-col ${alt === Number(data?.altitude) ? 'selected' : ''}`}
                   onMouseDown={() => {
                     if (selected === 'amend') {
                       this.props.amendEntry(data?.cid, {altitude: alt})
                     } else {
                       const trial_plan = {
                         cid: data?.cid, callsign: data?.callsign, plan_data: {
                           altitude: alt,
                           interim: null
                         },
                         msg: `AM ${data?.cid} ALT ${alt}`
                       };
                       this.props.trialPlan(trial_plan);
                     }
                     this.props.closeWindow();
                   }}
              >
                {String(alt).padStart(3, '0')}
              </div>
              {!dep && <div className={`alt-menu-container-col-t`}
                            disabled={!(selected === 'amend')}
                            onMouseEnter={() => (selected === 'amend') && this.setState({t_hover: alt})}
                            onMouseLeave={() => (selected === 'amend') && this.setState({t_hover: null})}
                            onMouseDown={() => {
                              if (selected === 'amend') {
                                this.props.amendEntry(data?.cid, {interim: alt})
                              } else {
                                const trial_plan = {
                                  cid: data?.cid, callsign: data?.callsign, plan_data: {
                                    interim: alt
                                  },
                                  msg: `QQ /TT ${alt} ${data?.cid}`
                                };
                                this.props.trialPlan(trial_plan);
                              }
                              this.props.closeWindow();
                            }}
              >
                T
              </div>}
            </div>;
          })}
        </div>
      </div>
    );
  }
}
