import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export default class SortMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      sorting: this.props.sorting
    };
    this.sortMenuRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.sorting !== prevProps.sorting) {
      this.setState({sorting: this.props.sorting});
    }
  }

  render() {
    let {focused, sorting} = this.state;
    const {pos, ref_id} = this.props;
    const acl = ref_id === 'acl-sort-button';
    const dep = ref_id === 'dep-sort-button';
    const selected = acl ? sorting.acl : sorting.dep;

    return (<div
        onMouseEnter={() => this.setState({focused: true})}
        onMouseLeave={() => this.setState({focused: false})}
        className="options-menu no-select"
        ref={this.sortMenuRef}
        id="sort-menu"
        style={{left: pos.x, top: pos.y}}
      >
        <div className={`options-menu-header ${focused ? 'focused' : ''}`}
             onMouseDown={(event) => this.props.startDrag(event, this.sortMenuRef)}
             onMouseUp={(event) => this.props.stopDrag(event)}
        >
          Sort Menu
        </div>
        <div className="options-body sort">
          {acl && <div className="options-row sector">
            <div className="options-col sort"
                 onMouseDown={() => {
                   sorting.acl.sector = !selected.sector;
                   this.setState({sorting: sorting});
                 }}
            >
              <div className={`box ${selected?.sector === true ? 'selected' : ''}`}/>
              Sector/Non-Sector
            </div>
          </div>}
          <div className="options-row">
            <div className="options-col sort"
                 onMouseDown={() => {
                   sorting[acl ? 'acl' : 'dep'].name = 'ACID';
                   this.setState({sorting: sorting});
                 }}
            >
              <div className={`box diamond ${selected?.name === 'ACID' ? 'selected' : ''}`}/>
              ACID
            </div>
          </div>
          <div className="options-row">
            <div className="options-col sort"
                 onMouseDown={() => {
                   sorting[acl ? 'acl' : 'dep'].name = 'Destination';
                   this.setState({sorting: sorting});
                 }}
            >
              <div className={`box diamond ${selected?.name === 'Destination' ? 'selected' : ''}`}/>
              Destination
            </div>
          </div>
          <div className="options-row">
            <div className="options-col sort"
                 onMouseDown={() => {
                   sorting[acl ? 'acl' : 'dep'].name = 'Origin';
                   this.setState({sorting: sorting});
                 }}
            >
              <div className={`box diamond ${selected?.name === 'Origin' ? 'selected' : ''}`}/>
              Origin
            </div>
          </div>
          {dep && <div className="options-row">
            <div className="options-col sort"
                 onMouseDown={() => {
                   sorting.dep.name = 'P-Time';
                   this.setState({sorting: sorting});
                 }}
            >
              <div className={`box diamond ${selected?.name === 'P-Time' ? 'selected' : ''}`}/>
              P-Time
            </div>
          </div>}
          <div className="options-row bottom sort">
            <div className="options-col left">
              <button
                onMouseDown={() => {
                  this.props.setSorting(sorting);
                  this.props.closeWindow();
                }}
              >
                OK
              </button>
            </div>
            <div className="options-col right">
              <button onMouseDown={this.props.closeWindow}>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}