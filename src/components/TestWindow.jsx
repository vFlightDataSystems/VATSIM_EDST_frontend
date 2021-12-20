import React from 'react';
import '../css/header-styles.css';

export default class TestWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false
    };
  }

  render() {
    const {focused} = this.state;

    return (<div
      onMouseEnter={() => this.setState({focused: true})}
      onMouseLeave={() => this.setState({focused: false})}
    >
      <div className="edst-window-title-bar">
        <div className="edst-window-title-bar-left">
          <button className={`edst-window-header-block ${focused ? 'focused' : ''}`}>
            <div className="edst-window-header-block edst-window-header-block-8-3"/>
          </button>
        </div>
        <div className={`edst-window-title-bar-middle ${focused ? 'focused' : ''}`}>
          <div className={`edst-window-header-block edst-window-header-block-flex ${focused ? 'focused' : ''}`}>
            TEST
          </div>
          <button className={`edst-window-header-block ${focused ? 'focused' : ''}`}
                  onClick={this.props.closeWindow}
          >
            <div className="edst-window-header-block edst-window-header-block-3-3"/>
          </button>
        </div>
        <div className={`edst-window-title-bar-right ${focused ? 'focused' : ''}`}>
          <button className={`edst-window-header-block ${focused ? 'focused' : ''}`}>
            <div className="edst-window-header-block-inverted edst-window-header-block-8-8"/>
          </button>
        </div>
      </div>
    </div>);
  }
}
