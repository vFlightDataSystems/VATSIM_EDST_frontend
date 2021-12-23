import React from 'react';
import '../../css/header-button-styles.scss';
import '../../css/header-styles.scss';
import '../../css/windows/alt-menu-styles.scss';

export default class AltMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dep: this.props.asel?.window === 'dep',
      trial: this.props.asel.window !== 'dep',
      t_hover: false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.asel !== prevProps.asel) {
      this.setState({dep: this.props.asel?.window === 'dep'});
    }
  }

  render() {
    const {trial, t_hover, dep} = this.state;
    const {data, asel, pos} = this.props;

    return (<div
        className="alt-menu no-select"
        ref={this.routeMenuRef}
        id="alt-menu"
        style={{left: pos.x + "px", top: pos.y + "px"}}
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
          <div className={`alt-menu-container-row ${!trial && (t_hover === 200) ? 't-hover' : ''}`}>
            <div className={`alt-menu-container-col`}>
              200
            </div>
            {!dep && <div className={`alt-menu-container-col-t ${!trial ? 'enabled' : ''}`}
                          onMouseEnter={() => !trial && this.setState({t_hover: 200})}
                          onMouseLeave={() => !trial && this.setState({t_hover: null})}
            >
              T
            </div>}
          </div>
          <div className={`alt-menu-container-row ${!trial && (t_hover === 190) ? 't-hover' : ''}`}>
            <div className={`alt-menu-container-col`}>
              190
            </div>
            <div className={`alt-menu-container-col-t ${!trial ? 'enabled' : ''}`}
                 onMouseEnter={() => !trial && this.setState({t_hover: 190})}
                 onMouseLeave={() => !trial && this.setState({t_hover: null})}
            >
              T
            </div>
          </div>
        </div>
      </div>
    );
  }
}