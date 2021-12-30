import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/acl-styles.scss';
import AclHeader from "./acl-components/AclHeader";
import AclTable from "./acl-components/AclTable";

export default class Acl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      manual: true,
    };
  }

  togglePosting = () => {
    const manual = this.state.manual;
    this.setState({manual: !manual})
  }

  componentWillUnmount() {
    this.props.unmount();
  }

  render() {
    const {focused, manual} = this.state;

    return (<div
      className={`acl ${this.props.dragging ? 'dragging' : ''}`}
      // style={{zIndex: this.props.z_index}}
      onMouseEnter={() => this.setState({focused: true})}
      onMouseLeave={() => this.setState({focused: false})}
    >
      <div>
        <AclHeader
          sorting={this.props.sorting}
          openMenu={this.props.openMenu}
          asel={this.props.asel}
          focused={focused} manual={manual}
          closeWindow={this.props.closeWindow}
          togglePosting={this.togglePosting}
        />
        <AclTable
          manual={manual}
          sorting={this.props.sorting}
          cid_list={this.props.cid_list}
          edstData={this.props.edstData}
          asel={this.props.asel}
          amendEntry={this.props.amendEntry}
          aircraftSelect={this.props.aircraftSelect}
        />
      </div>
    </div>);
  }
}
