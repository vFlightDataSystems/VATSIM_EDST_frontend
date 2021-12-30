import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/plans-display-styles.scss';
import PlansDisplayHeader from "./plans-display-components/PlansDisplayHeader";
import PlansDisplayTable from "./plans-display-components/PlansDisplayTable";

export default class PlansDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      selected_msg: null
    };
  }

  componentWillUnmount() {
    this.props.unmount();
  }

  render() {
    const {focused, selected_msg} = this.state;
    const {plan_queue} = this.props;

    return (<div
      className={`plans-display ${this.props.dragging ? 'dragging' : ''}`}
      // style={{zIndex: this.props.z_index}}
      onMouseEnter={() => this.setState({focused: true})}
      onMouseLeave={() => this.setState({focused: false})}
    >
      <div>
        <PlansDisplayHeader
          cleanup={this.props.cleanup}
          openMenu={this.props.openMenu}
          amendEntry={this.props.amendEntry}
          plan_data={selected_msg ? plan_queue[selected_msg] : null}
          asel={this.props.asel}
          focused={focused}
          closeWindow={this.props.closeWindow}
        />
        <PlansDisplayTable
          messageSelect={(i) => this.setState({selected_msg: i})}
          selected_msg={selected_msg}
          plan_queue={plan_queue}
          asel={this.props.asel}
          aircraftSelect={this.props.aircraftSelect}
        />
      </div>
    </div>);
  }
}
