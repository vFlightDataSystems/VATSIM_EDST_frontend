import React, {useContext, useState} from 'react';
import '../../../css/header-styles.scss';
import {WindowTitleBar} from "../WindowTitleBar";
import {DepContext, EdstContext} from "../../../contexts/contexts";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {setDepManualPosting} from "../../../redux/reducers/depReducer";

interface DepHeaderProps {
  focused: boolean;
  closeWindow: () => void;
}

export const DepHeader: React.FC<DepHeaderProps> = ({focused, closeWindow}) => {
  const sortData = useAppSelector((state) => state.dep.sortData);
  const manualPosting = useAppSelector((state) => state.dep.manualPosting);
  const dispatch = useAppDispatch();

  const {setInputFocused, openMenu} = useContext(EdstContext);
  const {addEntry, asel} = useContext(DepContext);
  const [searchStr, setSearchString] = useState('');
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      addEntry(searchStr);
      setSearchString('');
    }
  };

  return (<div className="no-select">
    <WindowTitleBar
      focused={focused}
      closeWindow={closeWindow}
      text={['Departure List', `${sortData.name}`, `${manualPosting ? 'Manual' : 'Automatic'}`]}
    />
    <div>
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e: React.MouseEvent) => openMenu(e.currentTarget, 'plan-menu')}
        content="Plan Options..."
        title={Tooltips.planOptions}
      />
      <EdstWindowHeaderButton
        id="dep-sort-button"
        onMouseDown={(e: React.MouseEvent) => openMenu(e.currentTarget, 'sort-menu')}
        content="Sort..."
        title={Tooltips.sort}
      />
      <EdstWindowHeaderButton
        onMouseDown={() => dispatch(setDepManualPosting(!manualPosting))}
        content="Posting Mode"
        title={Tooltips.postingMode}
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
          value={searchStr}
          onChange={(e) => setSearchString(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  </div>);
}