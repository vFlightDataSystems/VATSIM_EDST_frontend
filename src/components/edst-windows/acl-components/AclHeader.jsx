import React from 'react';
import '../../../css/windows/titlebar-styles.scss';
import '../../../css/header-styles.scss';
import WindowTitleBar from "../WindowTitleBar";

export default class AclHeader extends React.Component {

  render() {
    const {focused, manual, asel} = this.props;
    return (<div className="edst-window-header">
      <WindowTitleBar
        focused={focused}
        closeWindow={this.props.closeWindow}
        text={['Aircraft List', 'Sector/ACID', `${manual ? 'Manual' : 'Automatic'}`]}
      />
      <div className="no-select">
        <div className="outer-button edst-plan-options-button" disabled={asel === null}
             onMouseDown={(e) => this.props.openMenu(e, 'plan-menu')}>
          <div className="edst-window-button"
               disabled={asel === null}>
            Plan Options...
          </div>
        </div>
        <div className="outer-button edst-hold-button" disabled={asel === null}>
          <div className="edst-window-button" disabled={asel === null}>
            Hold...
          </div>
        </div>
        <div className="outer-button edst-show-button" disabled={true}>
          <div className="edst-window-button" disabled={true}>
            Show
          </div>
        </div>
        <div className="outer-button edst-show-all-button" disabled={true}>
          <div className="edst-window-button" disabled={true}>
            Show ALL
          </div>
        </div>
        <div className="outer-button edst-sort-button">
          <div className="edst-window-button"
               onMouseDown={(e) => this.props.openMenu(e, 'sort-menu')}>
            Sort...
          </div>
        </div>
        <div className="outer-button edst-tools-button">
          <div className="edst-window-button">
            Tools...
          </div>
        </div>
        <div className="outer-button edst-posting-mode-button">
          <div className="edst-window-button"
               onMouseDown={this.props.togglePosting}
          >
            Posting Mode
          </div>
        </div>
        <div className="outer-button edst-template-button">
          <div className="edst-window-button">
            Template...
          </div>
        </div>
        <div className="outer-button edst-clean-up-button">
          <div className="edst-window-button">
            Clean Up
          </div>
        </div>
      </div>
      <div className="edst-window-header-bottom-row no-select">
        Add/Find
        <div className="input-container">
          <input/>
        </div>
      </div>
    </div>);
  }
}