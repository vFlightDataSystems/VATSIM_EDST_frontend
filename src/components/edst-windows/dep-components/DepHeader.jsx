import React from 'react';
import '../../../css/header-styles.scss';
import WindowTitleBar from "../WindowTitleBar";

export default class DepHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search_str: ''
    }
  }

  handleKeyDown = event => {
    if (event.key === 'Enter') {
      this.props.addEntry(this.state.search_str);
      this.setState({search_str: ''});
    }
  }

  render() {
    const {search_str} = this.state;
    const {focused, manual, asel, sorting} = this.props;

    return (<div className="no-select">
      <WindowTitleBar
        focused={focused}
        closeWindow={this.props.closeWindow}
        text={['Departure List', `${sorting.name}`, `${manual ? 'Manual' : 'Automatic'}`]}
      />
      <div>
        <div className="outer-button">
          <div className="edst-window-button" disabled={asel === null}
               onMouseDown={(e) => this.props.openMenu(e.target, 'plan-menu')}
          >
            Plan Options...
          </div>
        </div>
        <div className="outer-button">
          <div className="edst-window-button"
               id="dep-sort-button"
               onMouseDown={(e) => this.props.openMenu(e.target, 'sort-menu')}>
            Sort...
          </div>
        </div>
        <div className="outer-button">
          <div className="edst-window-button"
               onMouseDown={this.props.togglePosting}
          >
            Posting Mode
          </div>
        </div>
        <div className="outer-button" disabled={true}>
          <div className="edst-window-button" disabled={true}>
            Template...
          </div>
        </div>
      </div>
      <div className="edst-window-header-bottom-row no-select">
        Add/Find
        <div className="input-container">
          <input
            value={search_str}
            onChange={(e) => this.setState({search_str: e.target.value.toUpperCase()})}
            onKeyDown={this.handleKeyDown}
          />
        </div>
      </div>
    </div>);
  }
}