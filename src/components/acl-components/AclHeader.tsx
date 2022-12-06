import React, { useState } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aclAselSelector, closeAllMenus, closeWindow } from "~redux/slices/appSlice";
import { addAclEntryByFid } from "~redux/thunks/entriesThunks";
import { aclCleanup } from "~redux/thunks/aclCleanup";
import { AclSortOptionValues } from "types/acl/aclSortOption";
import { aclManualPostingSelector, aclSortDataSelector, setAclManualPosting } from "~redux/slices/aclSlice";
import type { HeaderComponentProps } from "components/utils/FullscreenWindow";
import { AddFindInput } from "components/utils/InputComponents";
import { EdstWindowHeaderButton, EdstWindowHeaderButtonWithSharedEvent } from "components/utils/EdstButton";
import { WindowTitleBar } from "components/WindowTitleBar";
import tableStyles from "css/table.module.scss";
import clsx from "clsx";

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
    <div className={tableStyles.header}>
      <WindowTitleBar
        focused={focused}
        toggleFullscreen={toggleFullscreen}
        startDrag={startDrag}
        closeWindow={() => {
          if (asel?.window === "ACL") {
            dispatch(closeAllMenus());
          }
          dispatch(closeWindow("ACL"));
        }}
        text={[
          "Aircraft List",
          `${sortData.sector ? "Sector/" : ""}${AclSortOptionValues[sortData.selectedOption]}`,
          `${manualPosting ? "Manual" : "Automatic"}`,
        ]}
      />
      <div className={tableStyles.headerRow}>
        <EdstWindowHeaderButtonWithSharedEvent
          sharedUiEventId="openAclPlanOptions"
          edstWindow="PLAN_OPTIONS"
          disabled={asel === null}
          content="Plan Options..."
        />
        <EdstWindowHeaderButtonWithSharedEvent sharedUiEventId="openAclHoldMenu" edstWindow="HOLD_MENU" disabled={asel === null} content="Hold..." />
        <EdstWindowHeaderButton disabled content="Show" />
        <EdstWindowHeaderButton disabled content="Show ALL" />
        <EdstWindowHeaderButtonWithSharedEvent sharedUiEventId="openAclSortMenu" edstWindow="ACL_SORT_MENU" content="Sort..." />
        <EdstWindowHeaderButtonWithSharedEvent sharedUiEventId="openAclToolsMenu" edstWindow="TOOLS_MENU" content="Tools..." />
        <EdstWindowHeaderButton onMouseDown={() => dispatch(setAclManualPosting(!manualPosting))} content="Posting Mode" />
        <EdstWindowHeaderButtonWithSharedEvent sharedUiEventId="openAclTemplateMenu" edstWindow="TEMPLATE_MENU" content="Template..." />
        <EdstWindowHeaderButton onMouseDown={() => dispatch(aclCleanup)} content="Clean Up" />
      </div>
      <div className={clsx(tableStyles.headerRow, "bottom")}>
        Add/Find
        <AddFindInput value={searchStr} onChange={(e) => setSearchString(e.target.value)} onKeyDown={handleKeyDown} />
        Facilities:
      </div>
    </div>
  );
};
