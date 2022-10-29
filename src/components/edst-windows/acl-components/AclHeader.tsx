import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aclAselSelector, closeAllMenus, closeWindow } from "~redux/slices/appSlice";
import { addAclEntryByFid } from "~redux/thunks/entriesThunks";
import { NoSelectDiv } from "styles/NoSelectDiv";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { aclCleanup } from "~redux/thunks/aclCleanup";
import { EdstWindow } from "enums/edstWindow";
import { AclSortOptionValues } from "enums/acl/aclSortOption";
import { EdstWindowHeaderRowDiv } from "styles/edstStyles";
import { aclManualPostingSelector, aclSortDataSelector, setAclManualPosting } from "~redux/slices/aclSlice";
import type { HeaderComponentProps } from "../../utils/FullscreenWindow";
import { AddFindInput } from "../../utils/InputComponents";
import { EdstWindowHeaderButton } from "../../utils/EdstButton";
import { WindowTitleBar } from "../WindowTitleBar";

const AclHeaderDiv = styled(NoSelectDiv)``;

/**
 * ACL title bar and header row with add/find input field
 * @param focused focused state of ACL window
 * @param toggleFullscreen event handler to toggle maximized mode of ACL window
 * @param startDrag startDrag event handler
 */
export const AclHeader = ({ focused, toggleFullscreen, startDrag }: HeaderComponentProps) => {
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

  const handleClick = useCallback(
    (element: HTMLElement, edstWindow: EdstWindow) => {
      dispatch(openMenuThunk(edstWindow, element));
    },
    [dispatch]
  );

  return (
    <AclHeaderDiv>
      <WindowTitleBar
        focused={focused}
        toggleFullscreen={toggleFullscreen}
        startDrag={startDrag}
        closeWindow={() => {
          if (asel?.window === EdstWindow.ACL) {
            dispatch(closeAllMenus());
          }
          dispatch(closeWindow(EdstWindow.ACL));
        }}
        text={[
          "Aircraft List",
          `${sortData.sector ? "Sector/" : ""}${AclSortOptionValues[sortData.selectedOption]}`,
          `${manualPosting ? "Manual" : "Automatic"}`,
        ]}
      />
      <EdstWindowHeaderRowDiv>
        <EdstWindowHeaderButton
          sharedUiEventId="openAclPlanOptions"
          sharedUiEventHandler={handleClick}
          sharedUiEventHandlerArgs={EdstWindow.PLAN_OPTIONS}
          disabled={asel === null}
          onMouseDown={(e) => handleClick(e.currentTarget, EdstWindow.PLAN_OPTIONS)}
          content="Plan Options..."
          title={Tooltips.planOptions}
        />
        <EdstWindowHeaderButton
          sharedUiEventId="openAclHoldMenu"
          sharedUiEventHandler={handleClick}
          sharedUiEventHandlerArgs={EdstWindow.HOLD_MENU}
          disabled={asel === null}
          onMouseDown={(e) => handleClick(e.currentTarget, EdstWindow.HOLD_MENU)}
          content="Hold..."
          title={Tooltips.hold}
        />
        <EdstWindowHeaderButton disabled content="Show" />
        <EdstWindowHeaderButton disabled content="Show ALL" />
        <EdstWindowHeaderButton
          sharedUiEventId="openAclSortMenu"
          sharedUiEventHandler={handleClick}
          sharedUiEventHandlerArgs={EdstWindow.ACL_SORT_MENU}
          id="acl-sort-button"
          onMouseDown={(e) => {
            handleClick(e.currentTarget, EdstWindow.ACL_SORT_MENU);
          }}
          content="Sort..."
          title={Tooltips.sort}
        />
        <EdstWindowHeaderButton
          sharedUiEventId="openAclToolsMenu"
          sharedUiEventHandler={handleClick}
          sharedUiEventHandlerArgs={EdstWindow.TOOLS_MENU}
          onMouseDown={(e) => {
            dispatch(closeWindow(EdstWindow.TOOLS_MENU));
            handleClick(e.currentTarget, EdstWindow.TOOLS_MENU);
          }}
          content="Tools..."
        />
        <EdstWindowHeaderButton
          onMouseDown={() => dispatch(setAclManualPosting(!manualPosting))}
          content="Posting Mode"
          title={Tooltips.postingMode}
        />
        <EdstWindowHeaderButton
          sharedUiEventId="openAclTemplateMenu"
          sharedUiEventHandler={handleClick}
          sharedUiEventHandlerArgs={EdstWindow.TEMPLATE_MENU}
          onMouseDown={(e) => handleClick(e.currentTarget, EdstWindow.TEMPLATE_MENU)}
          content="Template..."
          title={Tooltips.template}
        />
        <EdstWindowHeaderButton onMouseDown={() => dispatch(aclCleanup)} content="Clean Up" title={Tooltips.aclCleanUp} />
      </EdstWindowHeaderRowDiv>
      <EdstWindowHeaderRowDiv bottomRow>
        Add/Find
        <AddFindInput value={searchStr} onChange={(e) => setSearchString(e.target.value)} onKeyDown={handleKeyDown} />
        Facilities:
      </EdstWindowHeaderRowDiv>
    </AclHeaderDiv>
  );
};
