import {useContext, useState} from 'react';
import '../../../css/header-styles.scss';
import WindowTitleBar from "../WindowTitleBar";
import {EdstContext} from "../../../contexts/contexts";

export default function DepHeader(props) {
  const {setInputFocused} = useContext(EdstContext);
  const [search_str, setSearchString] = useState('');
  const {focused, posting_manual, asel, sort_data} = props;
  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      props.addEntry(search_str);
      setSearchString('');
    }
  };

  return (<div className="no-select">
    <WindowTitleBar
      focused={focused}
      closeWindow={props.closeWindow}
      text={['Departure List', `${sort_data.name}`, `${posting_manual ? 'Manual' : 'Automatic'}`]}
    />
    <div>
      <div className="outer-button" disabled={asel === null}>
        <div className="edst-window-button" disabled={asel === null}
             onMouseDown={(e) => props.openMenu(e.target, 'plan-menu')}
        >
          Plan Options...
        </div>
      </div>
      <div className="outer-button">
        <div className="edst-window-button"
             id="dep-sort-button"
             onMouseDown={(e) => props.openMenu(e.target, 'sort-menu')}>
          Sort...
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
    </div>
    <div className="edst-window-header-bottom-row no-select">
      Add/Find
      <div className="input-container">
        <input
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          value={search_str}
          onChange={(e) => setSearchString(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  </div>);
}