import React from 'react';
import '../../../css/header-button-styles.scss';
import '../../../css/header-styles.scss';
import WindowTitleBar from "../WindowTitleBar";

export default class DepHeader extends React.Component {

  render() {
    const {focused, manual, asel} = this.props;
    return (<div className="edst-window-header no-select">
      <WindowTitleBar
        focused={focused}
        closeWindow={this.props.closeWindow}
        text={['Departure List', 'Destination', `${manual ? 'Manual' : 'Automatic'}`]}
      />
      <div className="edst-window-header-button-bar">
        <div className="outer-button edst-plan-options-button">
          <div className="edst-window-button" disabled={asel === null}
                  onMouseDown={(e) => this.props.openMenu(e, 'dep-plan-menu')}
          >
            Plan Options...
          </div>
        </div>
        <div className="outer-button edst-sort-button">
          <div className="edst-window-button">
            Sort...
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