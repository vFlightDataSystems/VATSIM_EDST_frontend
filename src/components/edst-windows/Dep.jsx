import React from 'react';
import '../../css/windows/dep-styles.scss';
import DepHeader from "./dep-components/DepHeader";
import DepTable from "./dep-components/DepTable";

export default class Dep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      posting_manual: true
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
      className={`dep ${this.props.dragging ? 'dragging' : ''}`}
      onMouseEnter={() => this.setState({focused: true})}
      onMouseLeave={() => this.setState({focused: false})}
    >
      <DepHeader
        addEntry={this.props.addEntry}
        sorting={this.props.sorting}
        openMenu={this.props.openMenu}
        asel={this.props.asel}
        focused={focused} posting_manual={posting_manual}
        closeWindow={this.props.closeWindow}
        togglePosting={this.togglePosting}
      />
      <DepTable
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
