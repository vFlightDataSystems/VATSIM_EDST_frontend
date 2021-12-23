import React from 'react';
import '../../css/windows/dep-styles.scss';
import DepHeader from "./dep-components/DepHeader";
import DepTable from "./dep-components/DepTable";

export default class Dep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      manual: true
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
      className={`dep ${this.props.dragging ? 'dragging' : ''}`}
      onMouseEnter={() => this.setState({focused: true})}
      onMouseLeave={() => this.setState({focused: false})}
    >
      <DepHeader
        openMenu={this.props.openMenu}
        asel={this.props.asel}
        focused={focused} manual={manual}
        closeWindow={this.props.closeWindow}
        togglePosting={this.togglePosting}
      />
      <DepTable
        edstData={this.props.edstData}
        asel={this.props.asel}
        setEntryField={this.props.setEntryField}
        aircraftSelect={this.props.aircraftSelect}
      />
    </div>);
  }
}
