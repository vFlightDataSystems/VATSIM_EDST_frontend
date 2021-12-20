import React from 'react';
import '../../css/windows/dep-styles.css';
import DepHeader from "./dep-components/DepHeader";

export default class Dep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      mode: 'Manual'
    };
  }

  render() {
    const {focused, mode} = this.state;

    return (<div
      className="dep"
      onMouseEnter={() => this.setState({focused: true})}
      onMouseLeave={() => this.setState({focused: false})}
    >
      <DepHeader focused={focused} mode={mode} closeWindow={this.props.closeWindow}/>
    </div>);
  }
}
