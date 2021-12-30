import React from 'react';
import '../../../css/windows/titlebar-styles.scss';
import '../../../css/header-styles.scss';
import WindowTitleBar from "../WindowTitleBar";

export default class PlansDisplayHeader extends React.Component {

  render() {
    const {focused, asel, plan_data} = this.props;

    return (<div>
      <WindowTitleBar
        focused={focused}
        closeWindow={this.props.closeWindow}
        text={['Plans Display']}
      />
      <div className="no-select">
        <div className="outer-button" disabled={asel === null}
             onMouseDown={(e) => this.props.openMenu(e, 'plan-menu')}>
          <div className="edst-window-button"
               disabled={asel === null}>
            Plan Options...
          </div>
        </div>
        <div className="outer-button" disabled={true}>
          <div className="edst-window-button" disabled={true}>
            Show
          </div>
        </div>
        <div className="outer-button" disabled={true}>
          <div className="edst-window-button" disabled={true}>
            Show All
          </div>
        </div>
        <div className="outer-button" disabled={asel === null}>
          <div className="edst-window-button" disabled={asel === null}
          onMouseDown={() => this.props.amendEntry(asel?.cid, plan_data.plan_data)}
          >
            Amend
          </div>
        </div>
        <div className="outer-button" disabled={true}>
          <div className="edst-window-button" disabled={true}>
            Interim
          </div>
        </div>
        <div className="outer-button" disabled={true}>
          <div className="edst-window-button" disabled={true}>
            Tools...
          </div>
        </div>
        <div className="outer-button">
          <div className="edst-window-button">
            Template...
          </div>
        </div>
        <div className="outer-button" disabled={true}>
          <div className="edst-window-button" disabled={true}>
            ICAO
          </div>
        </div>
        <div className="outer-button">
          <div className="edst-window-button"
               onMouseDown={this.props.cleanup}
          >
            Clean Up
          </div>
        </div>
      </div>
    </div>);
  }
}