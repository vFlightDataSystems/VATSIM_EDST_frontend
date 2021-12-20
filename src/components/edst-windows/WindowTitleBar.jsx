import React from 'react';
import '../../css/header-button-styles.css';
import '../../css/header-styles.css';

export default class WindowTitleBar extends React.Component {

  render() {
    const {focused, text} = this.props;
    return (<div className="edst-window-title-bar">
      <div className="edst-window-title-bar-left">
        <button className={`edst-window-header-block ${focused ? 'focused' : ''}`}>
          <div className="edst-window-header-block edst-window-header-block-8-3"/>
        </button>
      </div>
      <div className={`edst-window-title-bar-middle ${focused ? 'focused' : ''}`}>
        <div className={`edst-window-header-block edst-window-header-block-flex ${focused ? 'focused' : ''}`}>
          {text}
        </div>
      </div>
      <div className={`edst-window-title-bar-right ${focused ? 'focused' : ''}`}>
        <button className={`edst-window-header-block ${focused ? 'focused' : ''}`}
                onClick={this.props.closeWindow}
        >
          <div className="edst-window-header-block edst-window-header-block-3-3"/>
        </button>
        <button className={`edst-window-header-block ${focused ? 'focused' : ''}`}>
          <div className="edst-window-header-block-inverted edst-window-header-block-8-8"/>
        </button>
      </div>
    </div>);
  }
}