import React from 'react';
import _ from 'lodash';
import '../../css/header-button-styles.scss';
import '../../css/header-styles.scss';
import '../../css/windows/alt-menu-styles.scss';

export default class AltMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dep: this.props.asel?.window === 'dep',
      trial: this.props.asel.window !== 'dep',
      alt_center: this.props.data?.altitude,
      alt_selected: this.props.data?.altitude,
      interim_selected: false,
      t_hover: false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.asel !== prevProps.asel) {
      const {trial} = this.state;
      this.setState({dep: this.props.asel?.window === 'dep',
        trial: this.props.asel.window !== 'dep' && trial,
        alt_center: this.props.data?.altitude,
        alt_selected: this.props.data?.altitude
      });
    }
  }

  render() {
    const {trial, t_hover, dep, alt_center, alt_selected, interim_selected} = this.state;
    const {data, asel, pos} = this.props;

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
        <div className={`alt-menu-row hover ${trial ? 'selected' : ''}`}
             onMouseDown={() => this.setState({trial: true})}
             disabled={dep}
        >
          TRIAL PLAN
        </div>
        <div className={`alt-menu-row hover ${!trial ? 'selected' : ''}`}
             onMouseDown={() => this.setState({trial: false})}
        >
          AMEND
        </div>
        <div className={`alt-menu-row`} disabled={true}>
          {!dep ? 'PROCEDURE' : 'NO ALT'}
        </div>
        <div className="alt-menu-select-container">
        {_.range(-20, 30, 10).map(i => {
          const alt = Number(data.altitude) + i;
          return <div 
            className={`alt-menu-container-row ${!trial && (t_hover === alt) ? 't-hover' : ''} ${(alt_selected === alt && interim_selected) ? 'selected' : ''}`}
            key={`alt-${i}`}
          >
            <div className={`alt-menu-container-col ${alt_selected === alt ? 'selected' : ''}`}
                 onMouseDown={() => this.setState({alt_selected: alt, interim_selected: false})}
            >
              {String(alt).padStart(3, '0')}
            </div>
            {!dep && <div className={`alt-menu-container-col-t`}
                          disabled={trial}
                          onMouseEnter={() => !trial && this.setState({t_hover: alt})}
                          onMouseLeave={() => !trial && this.setState({t_hover: null})}
                          onMouseDown={() => this.setState({alt_selected: alt, interim_selected: true})}
            >
              T
            </div>}
          </div>;})}
        </div>
      </div>
    );
  }
}
