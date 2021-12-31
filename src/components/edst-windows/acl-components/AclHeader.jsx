import React from 'react';
import '../../../css/windows/titlebar-styles.scss';
import '../../../css/header-styles.scss';
import WindowTitleBar from "../WindowTitleBar";

export default class AclHeader extends React.Component {

  render() {
    const {focused, manual, asel, sorting} = this.props;
    return (<div>
      <WindowTitleBar
        focused={focused}
        closeWindow={this.props.closeWindow}
        text={['Aircraft List', `${sorting.sector ? 'Sector/' : ''}${sorting.name}`, `${manual ? 'Manual' : 'Automatic'}`]}
      />
      <div className="no-select">
        <div className="outer-button" disabled={asel === null}
             onMouseDown={(e) => this.props.openMenu(e.target, 'plan-menu')}>
          <div className="edst-window-button"
               disabled={asel === null}>
            Plan Options...
          </div>
        </div>
        <div className="outer-button" disabled={asel === null}>
          <div className="edst-window-button" disabled={asel === null}>
            Hold...
          </div>
        </div>
        <div className="outer-button" disabled={true}>
          <div className="edst-window-button" disabled={true}>
            Show
          </div>
        </div>
        <div className="outer-button" disabled={true}>
          <div className="edst-window-button" disabled={true}>
            Show ALL
          </div>
        </div>
        <div className="outer-button">
          <div className="edst-window-button"
               id="acl-sort-button"
               onMouseDown={(e) => this.props.openMenu(e.target, 'sort-menu')}>
            Sort...
          </div>
        </div>
        <div className="outer-button">
          <div className="edst-window-button">
            Tools...
          </div>
        </div>
        <div className="outer-button">
          <div className="edst-window-button"
               onMouseDown={this.props.togglePosting}
          >
            Posting Mode
          </div>
        </div>
        <div className="outer-button">
          <div className="edst-window-button">
            Template...
          </div>
        </div>
        <div className="outer-button">
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