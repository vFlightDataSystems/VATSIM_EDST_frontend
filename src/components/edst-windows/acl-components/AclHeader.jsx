import React from 'react';
import '../../../css/header-button-styles.css';
import '../../../css/header-styles.css';
import WindowTitleBar from "../WindowTitleBar";

export default class AclHeader extends React.Component {

  render() {
    const {focused, mode} = this.props;
    return (<div className="edst-window-header">
      <WindowTitleBar
        focused={focused}
        closeWindow={this.props.closeWindow}
        text={`Aircraft List Sector/Boundary Time ${mode}`}
      />
      <div className="edst-window-header-button-bar">
        <div className="edst-window-header-button-bar edst-plan-options-button" disabled={true}>
          <button className="edst-window-header-button" disabled={true}>
            Plan Options...
          </button>
        </div>
        <div className="edst-window-header-button-bar edst-hold-button">
          <button className="edst-window-header-button">
            Hold...
          </button>
        </div>
        <div className="edst-window-header-button-bar edst-show-button">
          <button className="edst-window-header-button">
            Show
          </button>
        </div>
        <div className="edst-window-header-button-bar edst-show-all-button">
          <button className="edst-window-header-button">
            Show All
          </button>
        </div>
        <div className="edst-window-header-button-bar edst-sort-button">
          <button className="edst-window-header-button">
            Sort...
          </button>
        </div>
        <div className="edst-window-header-button-bar edst-tools-button">
          <button className="edst-window-header-button">
            Tools...
          </button>
        </div>
        <div className="edst-window-header-button-bar edst-posting-mode-button">
          <button className="edst-window-header-button">
            Posting Mode
          </button>
        </div>
        <div className="edst-window-header-button-bar edst-template-button">
          <button className="edst-window-header-button">
            Template...
          </button>
        </div>
        <div className="edst-window-header-button-bar edst-clean-up-button">
          <button className="edst-window-header-button">
            Clean Up
          </button>
        </div>
      </div>
      <div className="edst-window-header-bottom-row">
        Add/Find
        <div className="input-container">
          <input/>
        </div>
      </div>
    </div>);
  }
}