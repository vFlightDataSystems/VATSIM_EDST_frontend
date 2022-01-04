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
      posting_manual: true,
    };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return nextProps !== this.props || this.state !== nextState;
  }

  togglePosting = () => {
    const posting_manual = this.state.posting_manual;
    this.setState({posting_manual: !posting_manual});
  }

  componentWillUnmount() {
    this.props.unmount();
  }

  render() {
    const {focused, posting_manual} = this.state;

    return (<div
      className={`acl ${this.props.dragging ? 'dragging' : ''}`}
      // style={{zIndex: this.props.z_index}}
      onMouseEnter={() => this.setState({focused: true})}
      onMouseLeave={() => this.setState({focused: false})}
    >
      <AclHeader
        addEntry={this.props.addEntry}
        sorting={this.props.sorting}
        openMenu={this.props.openMenu}
        asel={this.props.asel}
        focused={focused} posting_manual={posting_manual}
        closeWindow={this.props.closeWindow}
        togglePosting={this.togglePosting}
        cleanup={this.props.cleanup}
      />
      <AclTable
        posting_manual={posting_manual}
        sorting={this.props.sorting}
        cid_list={this.props.cid_list}
        edstData={this.props.edstData}
        asel={this.props.asel}
        updateEntry={this.props.updateEntry}
        amendEntry={this.props.amendEntry}
        aircraftSelect={this.props.aircraftSelect}
        deleteEntry={this.props.deleteEntry}
      />
    </div>);
  }
}
