import React from 'react';
import '../../css/header-styles.css';
import '../../css/windows/acl-styles.css';
import AclHeader from "./acl-components/AclHeader";
import AclTable from "./acl-components/AclTable";

export default class Acl extends React.Component {
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
      className="acl"

      // style={{zIndex: this.props.z_index}}
      onMouseEnter={() => this.setState({focused: true})}
      onMouseLeave={() => this.setState({focused: false})}
    >
      <div className="edst-window-header">
        <AclHeader focused={focused} mode={mode} closeWindow={this.props.closeWindow}/>
        <AclTable/>
      </div>
    </div>);
  }
}
