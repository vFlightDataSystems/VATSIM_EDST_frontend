import React from 'react';
import '../../../css/windows/titlebar-styles.scss';
import '../../../css/header-styles.scss';
import WindowTitleBar from "../WindowTitleBar";

export default function AclHeader(props) {
  const [search_str, setSearchString] = React.useState('');
  const {focused, posting_manual, asel, sort_data} = props;
  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      props.addEntry(search_str);
      setSearchString('');
    }
  };

  return (<div>
    <WindowTitleBar
      focused={focused}
      closeWindow={props.closeWindow}
      text={['Aircraft List', `${sort_data.sector ? 'Sector/' : ''}${sort_data.name}`, `${posting_manual ? 'Manual' : 'Automatic'}`]}
    />
    <div className="no-select">
      <div className="outer-button" disabled={asel === null}
           onMouseDown={(e) => props.openMenu(e.target, 'plan-menu')}
      >
        <div className="edst-window-button"
             disabled={asel === null}>
          Plan Options...
        </div>
      </div>
      <div className="outer-button"
           disabled={asel === null}
           onMouseDown={(e) => props.openMenu(e.target, 'hold-menu')}
      >
        <div className="edst-window-button" disabled={asel === null}>
          Hold...
        </div>
      </div>
      <div className="outer-button" disabled={true}>
        <div className="edst-window-button" disabled={true}>
          Show
        </div>
      </div>
      <div className="outer-button" disabled={true}>
        <div className="edst-window-button" disabled={true}>
          Show ALL
        </div>
      </div>
      <div className="outer-button">
        <div className="edst-window-button"
             id="acl-sort-button"
             onMouseDown={(e) => props.openMenu(e.target, 'sort-menu')}>
          Sort...
        </div>
      </div>
      <div className="outer-button" disabled={true}>
        <div className="edst-window-button" disabled={true}>
          Tools...
        </div>
      </div>
      <div className="outer-button">
        <div className="edst-window-button"
             onMouseDown={props.togglePosting}
        >
          Posting Mode
        </div>
      </div>
      <div className="outer-button" disabled={true}>
        <div className="edst-window-button" disabled={true}>
          Template...
        </div>
      </div>
      <div className="outer-button">
        <div className="edst-window-button"
             onMouseDown={props.cleanup}
        >
          Clean Up
        </div>
      </div>
    </div>
    <div className="edst-window-header-bottom-row no-select">
      Add/Find
      <div className="input-container">
        <input
          value={search_str}
          onChange={(e) => setSearchString(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  </div>);
}