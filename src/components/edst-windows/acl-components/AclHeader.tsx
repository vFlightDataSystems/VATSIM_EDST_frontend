import React, {useState} from 'react';
import {WindowTitleBar} from "../WindowTitleBar";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";
import {useRootDispatch, useRootSelector} from "../../../redux/hooks";
import {aclManualPostingSelector, aclSortDataSelector, setAclManualPosting} from "../../../redux/slices/aclSlice";
import {aclCleanup, openMenuThunk} from "../../../redux/thunks/thunks";
import {menuEnum, windowEnum} from "../../../enums";
import {
  aclAselSelector,
  AselType,
  closeAllMenus, closeMenu,
  closeWindow,
  setInputFocused
} from "../../../redux/slices/appSlice";
import {addAclEntryByFid} from "../../../redux/thunks/entriesThunks";
import {NoSelectDiv} from "../../../styles/styles";
import {WindowHeaderRowDiv} from "../../../styles/edstWindowStyles";
import {AddFindInput} from '../../InputComponents';
import styled from "styled-components";

const AclHeaderDiv = styled(NoSelectDiv)``;

export const AclHeader: React.FC<{ focused: boolean }> = ({focused}) => {
  const asel = useRootSelector(aclAselSelector);
  const sortData = useRootSelector(aclSortDataSelector);
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const dispatch = useRootDispatch();

  const [searchStr, setSearchString] = useState('');
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      dispatch(addAclEntryByFid(searchStr));
      setSearchString('');
    }
  };

  return (<AclHeaderDiv>
    <WindowTitleBar
      focused={focused}
      closeWindow={() => {
        if (asel?.window === windowEnum.acl) {
          dispatch(closeAllMenus());
        }
        dispatch(closeWindow(windowEnum.acl));
      }}
      text={['Aircraft List', `${sortData.sector ? 'Sector/' : ''}${sortData.selectedOption}`, `${manualPosting ? 'Manual' : 'Automatic'}`]}
    />
    <WindowHeaderRowDiv>
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(menuEnum.planOptions, e.currentTarget))}
        content="Plan Options..."
        title={Tooltips.planOptions}
      />
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(menuEnum.holdMenu, e.currentTarget, windowEnum.acl, false, (asel as AselType).cid))}
        content="Hold..."
        title={Tooltips.hold}
      />
      <EdstWindowHeaderButton disabled={true} content="Show"/>
      <EdstWindowHeaderButton disabled={true} content="Show ALL"/>
      <EdstWindowHeaderButton
        id="acl-sort-button"
        onMouseDown={(e: React.MouseEvent) => {
          dispatch(openMenuThunk(menuEnum.sortMenu, e.currentTarget, windowEnum.acl));
        }}
        content="Sort..."
        title={Tooltips.sort}
      />
      <EdstWindowHeaderButton
        onMouseDown={(e: React.MouseEvent) => {
          dispatch(closeMenu(menuEnum.toolsMenu));
          dispatch(openMenuThunk(menuEnum.toolsMenu, e.currentTarget, windowEnum.acl));
        }}
        content="Tools..."
      />
      <EdstWindowHeaderButton
        onMouseDown={() => dispatch(setAclManualPosting(!manualPosting))}
        content="Posting Mode"
        title={Tooltips.postingMode}
      />
      <EdstWindowHeaderButton
        onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(menuEnum.templateMenu, e.currentTarget, windowEnum.acl, false, asel?.cid ?? null))}
        content="Template..."
        title={Tooltips.template}
      />
      <EdstWindowHeaderButton
        onMouseDown={() => dispatch(aclCleanup)}
        content="Clean Up"
        title={Tooltips.aclCleanUp}
      />
    </WindowHeaderRowDiv>
    <WindowHeaderRowDiv bottomRow={true}>
      Add/Find
      <AddFindInput
        onFocus={() => dispatch(setInputFocused(true))}
        onBlur={() => dispatch(setInputFocused(false))}
        value={searchStr}
        onChange={(e) => setSearchString(e.target.value.toUpperCase())}
        onKeyDown={handleKeyDown}
      />
    </WindowHeaderRowDiv>
  </AclHeaderDiv>);
};