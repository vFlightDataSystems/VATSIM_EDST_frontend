import React, {useContext, useState} from 'react';
import {WindowTitleBar} from "../WindowTitleBar";
import {AclContext, EdstContext} from "../../../contexts/contexts";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {setAclManualPosting} from "../../../redux/reducers/aclReducer";

interface AclHeaderProps {
  focused: boolean;
  cleanup: () => void;
  closeWindow: () => void;
}

export const AclHeader: React.FC<AclHeaderProps> = (props) => {
  const sortData = useAppSelector((state) => state.acl.sortData);
  const manualPosting = useAppSelector((state) => state.acl.manualPosting);
  const dispatch = useAppDispatch();

  const {setInputFocused, asel, openMenu} = useContext(EdstContext);
  const {addEntry} = useContext(AclContext);
  const [searchStr, setSearchString] = useState('');
  const {focused} = props;
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      addEntry(searchStr);
      setSearchString('');
    }
  };

  return (<div>
    <WindowTitleBar
      focused={focused}
      closeWindow={props.closeWindow}
      text={['Aircraft List', `${sortData.sector ? 'Sector/' : ''}${sortData.name}`, `${manualPosting ? 'Manual' : 'Automatic'}`]}
    />
    <div className="no-select">
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e: React.KeyboardEvent) => openMenu(e.currentTarget, 'plan-menu')}
        content="Plan Options..."
        title={Tooltips.planOptions}
      />
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e: React.KeyboardEvent) => openMenu(e.currentTarget, 'hold-menu')}
        content="Hold..."
        title={Tooltips.hold}
      />
      <EdstWindowHeaderButton disabled={true} content="Show"/>
      <EdstWindowHeaderButton disabled={true} content="Show ALL"/>
      <EdstWindowHeaderButton
        id="acl-sort-button"
        onMouseDown={(e: React.KeyboardEvent) => {
          openMenu(e.currentTarget, 'sort-menu');
        }}
        content="Sort..."
        title={Tooltips.sort}
      />
      <EdstWindowHeaderButton disabled={true} content="Tools..."/>
      <EdstWindowHeaderButton
        onMouseDown={() => dispatch(setAclManualPosting(!manualPosting))}
        content="Posting Mode"
        title={Tooltips.postingMode}
      />
      <EdstWindowHeaderButton
        onMouseDown={(e: React.KeyboardEvent) => openMenu(e.currentTarget, 'template-menu')}
        content="Template..."
        title={Tooltips.template}
      />
      <EdstWindowHeaderButton
        onMouseDown={props.cleanup}
        content="Clean Up"
        title={Tooltips.aclCleanUp}
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
};