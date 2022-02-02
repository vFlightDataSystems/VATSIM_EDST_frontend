import React, {useContext, useState} from 'react';
import '../../../css/header-styles.scss';
import {WindowTitleBar} from "../WindowTitleBar";
import {DepContext, EdstContext} from "../../../contexts/contexts";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";

interface DepHeaderProps {
  focused: boolean;
  closeWindow: () => void;
}

export const DepHeader: React.FC<DepHeaderProps> = ({focused, closeWindow}) => {
  const {setInputFocused, openMenu} = useContext(EdstContext);
  const {manual_posting, togglePosting, sort_data, addEntry, asel} = useContext(DepContext);
  const [search_str, setSearchString] = useState('');
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      addEntry(search_str);
      setSearchString('');
    }
  };

  return (<div className="no-select">
    <WindowTitleBar
      focused={focused}
      closeWindow={closeWindow}
      text={['Departure List', `${sort_data.name}`, `${manual_posting ? 'Manual' : 'Automatic'}`]}
    />
    <div>
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e: React.MouseEvent) => openMenu(e.currentTarget, 'plan-menu')}
        content="Plan Options..."
        title={Tooltips.plan_options}
      />
      <EdstWindowHeaderButton
        id="dep-sort-button"
        onMouseDown={(e: React.MouseEvent) => openMenu(e.currentTarget, 'sort-menu')}
        content="Sort..."
        title={Tooltips.sort}
      />
      <EdstWindowHeaderButton
        onMouseDown={togglePosting}
        content="Posting Mode"
        title={Tooltips.posting_mode}
      />
      <EdstWindowHeaderButton
        onMouseDown={(e: React.MouseEvent) => openMenu(e.currentTarget, 'template-menu')}
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