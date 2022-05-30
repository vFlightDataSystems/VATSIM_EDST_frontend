import React, { useState } from "react";
import styled from "styled-components";
import { WindowTitleBar } from "../WindowTitleBar";
import { EdstWindowHeaderButton } from "../../resources/EdstButton";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { aclManualPostingSelector, aclSortDataSelector, setAclManualPosting } from "../../../redux/slices/aclSlice";
import { aclCleanup, openMenuThunk } from "../../../redux/thunks/thunks";
import { EdstMenu, EdstWindow } from "../../../enums";
import { aclAselSelector, closeAllMenus, closeMenu, closeWindow, setInputFocused } from "../../../redux/slices/appSlice";
import { addAclEntryByFid } from "../../../redux/thunks/entriesThunks";
import { NoSelectDiv } from "../../../styles/styles";
import { WindowHeaderRowDiv } from "../../../styles/edstWindowStyles";
import { AddFindInput } from "../../InputComponents";

const AclHeaderDiv = styled(NoSelectDiv)``;

export const AclHeader: React.FC<{ focused: boolean }> = ({ focused }) => {
  const asel = useRootSelector(aclAselSelector);
  const sortData = useRootSelector(aclSortDataSelector);
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const dispatch = useRootDispatch();

  const [searchStr, setSearchString] = useState("");
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      dispatch(addAclEntryByFid(searchStr));
      setSearchString("");
    }
  };

  return (
    <AclHeaderDiv>
      <WindowTitleBar
        focused={focused}
        closeWindow={() => {
          if (asel?.window === EdstWindow.acl) {
            dispatch(closeAllMenus());
          }
          dispatch(closeWindow(EdstWindow.acl));
        }}
        text={["Aircraft List", `${sortData.sector ? "Sector/" : ""}${sortData.selectedOption}`, `${manualPosting ? "Manual" : "Automatic"}`]}
      />
      <WindowHeaderRowDiv>
        <EdstWindowHeaderButton
          disabled={asel === null}
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstMenu.planOptions, e.currentTarget))}
          content="Plan Options..."
          title={Tooltips.planOptions}
        />
        <EdstWindowHeaderButton
          disabled={asel === null}
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstMenu.holdMenu, e.currentTarget, EdstWindow.acl, false))}
          content="Hold..."
          title={Tooltips.hold}
        />
        <EdstWindowHeaderButton disabled content="Show" />
        <EdstWindowHeaderButton disabled content="Show ALL" />
        <EdstWindowHeaderButton
          id="acl-sort-button"
          onMouseDown={(e: React.MouseEvent) => {
            dispatch(openMenuThunk(EdstMenu.sortMenu, e.currentTarget, EdstWindow.acl));
          }}
          content="Sort..."
          title={Tooltips.sort}
        />
        <EdstWindowHeaderButton
          onMouseDown={(e: React.MouseEvent) => {
            dispatch(closeMenu(EdstMenu.toolsMenu));
            dispatch(openMenuThunk(EdstMenu.toolsMenu, e.currentTarget, EdstWindow.acl));
          }}
          content="Tools..."
        />
        <EdstWindowHeaderButton
          onMouseDown={() => dispatch(setAclManualPosting(!manualPosting))}
          content="Posting Mode"
          title={Tooltips.postingMode}
        />
        <EdstWindowHeaderButton
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstMenu.templateMenu, e.currentTarget, EdstWindow.acl, false))}
          content="Template..."
          title={Tooltips.template}
        />
        <EdstWindowHeaderButton onMouseDown={() => dispatch(aclCleanup)} content="Clean Up" title={Tooltips.aclCleanUp} />
      </WindowHeaderRowDiv>
      <WindowHeaderRowDiv bottomRow>
        Add/Find
        <AddFindInput
          onFocus={() => dispatch(setInputFocused(true))}
          onBlur={() => dispatch(setInputFocused(false))}
          value={searchStr}
          onChange={e => setSearchString(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
        />
      </WindowHeaderRowDiv>
    </AclHeaderDiv>
  );
};
