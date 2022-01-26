import {useContext, useState} from 'react';
import '../../../css/header-styles.scss';
import WindowTitleBar from "../WindowTitleBar";
import {DepContext, EdstContext} from "../../../contexts/contexts";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";

export default function DepHeader(props) {
  const {setInputFocused} = useContext(EdstContext);
  const {manual_posting, togglePosting} = useContext(DepContext);
  const [search_str, setSearchString] = useState('');
  const {focused, asel, sort_data} = props;
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
      text={['Departure List', `${sort_data.name}`, `${manual_posting ? 'Manual' : 'Automatic'}`]}
    />
    <div>
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e) => props.openMenu(e.target, 'plan-menu')}
        content="Plan Options..."
        title={Tooltips.plan_options}
      />
      <EdstWindowHeaderButton
        id="dep-sort-button"
        onMouseDown={(e) => props.openMenu(e.target, 'sort-menu')}
        content="Sort..."
        title={Tooltips.sort}
      />
      <EdstWindowHeaderButton
        onMouseDown={togglePosting}
        content="Posting Mode"
        title={Tooltips.posting_mode}
      />
      <EdstWindowHeaderButton
        onMouseDown={(e) => props.openMenu(e.target, 'template-menu')}
        content="Template..."
        title={Tooltips.template}
      />
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