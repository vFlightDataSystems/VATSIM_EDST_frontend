import {useContext, useState} from 'react';
import {WindowTitleBar} from "../WindowTitleBar";
import {AclContext, EdstContext} from "../../../contexts/contexts";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";

export function AclHeader(props) {
  const {setInputFocused} = useContext(EdstContext)
  const {manual_posting, togglePosting} = useContext(AclContext);
  const [search_str, setSearchString] = useState('');
  const {focused, asel, sort_data} = props;
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
      text={['Aircraft List', `${sort_data.sector ? 'Sector/' : ''}${sort_data.name}`, `${manual_posting ? 'Manual' : 'Automatic'}`]}
    />
    <div className="no-select">
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e) => props.openMenu(e.target, 'plan-menu')}
        content="Plan Options..."
        title={Tooltips.plan_options}
      />
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e) => props.openMenu(e.target, 'hold-menu')}
        content="Hold..."
        title={Tooltips.hold}
      />
      <EdstWindowHeaderButton disabled={true} content="Show"/>
      <EdstWindowHeaderButton disabled={true} content="Show ALL"/>
      <EdstWindowHeaderButton
        id="acl-sort-button"
        onMouseDown={(e) => props.openMenu(e.target, 'sort-menu')}
        content="Sort..."
        title={Tooltips.sort}
      />
      <EdstWindowHeaderButton disabled={true} content="Tools..."/>
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
      <EdstWindowHeaderButton
        onMouseDown={props.cleanup}
        content="Clean Up"
        title={Tooltips.acl_clean_up}
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