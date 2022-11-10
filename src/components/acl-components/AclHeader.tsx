import React, { useState } from "react";
import styled from "styled-components";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aclAselSelector, closeAllMenus, closeWindow } from "~redux/slices/appSlice";
import { addAclEntryByFid } from "~redux/thunks/entriesThunks";
import { NoSelectDiv } from "styles/NoSelectDiv";
import { aclCleanup } from "~redux/thunks/aclCleanup";
import { EdstWindow } from "enums/edstWindow";
import { AclSortOptionValues } from "enums/acl/aclSortOption";
import { EdstWindowHeaderRowDiv } from "styles/edstStyles";
import { aclManualPostingSelector, aclSortDataSelector, setAclManualPosting } from "~redux/slices/aclSlice";
import type { HeaderComponentProps } from "components/utils/FullscreenWindow";
import { AddFindInput } from "components/utils/InputComponents";
import { EdstWindowHeaderButton, EdstWindowHeaderButtonWithSharedEvent } from "components/utils/EdstButton";
import { WindowTitleBar } from "components/WindowTitleBar";

const AclHeaderDiv = styled(NoSelectDiv)``;

/**
 * ACL title bar and header row with add/find input field
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
        <EdstWindowHeaderButtonWithSharedEvent
          sharedUiEventId="openAclPlanOptions"
          edstWindow={EdstWindow.PLAN_OPTIONS}
          disabled={asel === null}
          content="Plan Options..."
          title={Tooltips.planOptions}
        />
        <EdstWindowHeaderButtonWithSharedEvent
          sharedUiEventId="openAclHoldMenu"
          edstWindow={EdstWindow.HOLD_MENU}
          disabled={asel === null}
          content="Hold..."
          title={Tooltips.hold}
        />
        <EdstWindowHeaderButton disabled content="Show" />
        <EdstWindowHeaderButton disabled content="Show ALL" />
        <EdstWindowHeaderButtonWithSharedEvent
          sharedUiEventId="openAclSortMenu"
          edstWindow={EdstWindow.ACL_SORT_MENU}
          content="Sort..."
          title={Tooltips.sort}
        />
        <EdstWindowHeaderButtonWithSharedEvent sharedUiEventId="openAclToolsMenu" edstWindow={EdstWindow.TOOLS_MENU} content="Tools..." />
        <EdstWindowHeaderButton
          onMouseDown={() => dispatch(setAclManualPosting(!manualPosting))}
          content="Posting Mode"
          title={Tooltips.postingMode}
        />
        <EdstWindowHeaderButtonWithSharedEvent
          sharedUiEventId="openAclTemplateMenu"
          edstWindow={EdstWindow.TEMPLATE_MENU}
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
