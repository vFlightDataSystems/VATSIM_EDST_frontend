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
import { activeArtccPositionsSelector, neighboringNasIdsSelector } from "~redux/slices/positionSlice";
import { PositionType } from "types/apiTypes/OpenPositionDto";
import { artccIdSelector } from "~redux/slices/sectorSlice";
import clsx from "clsx";

/**
 * ACL title bar and header row with add/find input field
 */
export const AclHeader = ({ focused, toggleFullscreen, startDrag }: HeaderComponentProps) => {
  const asel = useRootSelector(aclAselSelector);
  const sortData = useRootSelector(aclSortDataSelector);
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const artccPositions = useRootSelector(activeArtccPositionsSelector);
  const currentArtccId = useRootSelector(artccIdSelector);
  const neighboringNasIds = useRootSelector(neighboringNasIdsSelector);
  const dispatch = useRootDispatch();

  const [searchStr, setSearchString] = useState("");
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      dispatch(addAclEntryByFid(searchStr));
      setSearchString("");
    }
  };

  // Get active facility NAS IDs
  const activeFacilityNasIds = new Set(
    artccPositions
      .filter((position) => position.type === PositionType.Artcc && position.isActive)
      .filter((position) => position.facilityId !== currentArtccId)
      .map((position) => neighboringNasIds[position.facilityId])
      .filter(Boolean)
  );

  // Create display list with online/offline status
  const facilityDisplay = Object.entries(neighboringNasIds)
    .map(([facilityId, nasId]) => ({
      facilityId,
      nasId,
      isOnline: activeFacilityNasIds.has(nasId),
    }))
    .sort((a, b) => a.nasId.localeCompare(b.nasId)); // Sort alphabetically by NAS ID

  console.log(facilityDisplay);

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
      <div className={tableStyles.bottomHeaderRow}>
        Add/Find
        <AddFindInput value={searchStr} onChange={(e) => setSearchString(e.target.value)} onKeyDown={handleKeyDown} />
        Facilities:&nbsp;
        {facilityDisplay.map(({ nasId, isOnline }, index) => (
          <React.Fragment key={nasId}>
            {index > 0 && <>&nbsp;</>}
            <span
              className={clsx({
                [tableStyles.onlineFacility]: isOnline,
                [tableStyles.offlineFacility]: !isOnline,
              })}
            >
              {nasId}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
