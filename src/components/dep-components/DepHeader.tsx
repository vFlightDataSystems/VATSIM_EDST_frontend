import React, { useState } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { depManualPostingSelector, depSortOptionSelector, setDepManualPosting } from "~redux/slices/depSlice";
import { closeAllMenus, closeWindow, depAselSelector } from "~redux/slices/appSlice";
import { addDepEntryByFid } from "~redux/thunks/entriesThunks";
import { DepSortOptionValues } from "types/dep/depSortOption";
import type { HeaderComponentProps } from "components/utils/FullscreenWindow";
import { AddFindInput } from "components/utils/InputComponents";
import { EdstWindowHeaderButton, EdstWindowHeaderButtonWithSharedEvent } from "components/utils/EdstButton";
import { WindowTitleBar } from "components/WindowTitleBar";
import styles from "css/table.module.scss";

/**
 * DEP title bar and header row with add/find input field
 */
export const DepHeader = ({ focused, toggleFullscreen, startDrag }: HeaderComponentProps) => {
  const asel = useRootSelector(depAselSelector);
  const selectedSortOption = useRootSelector(depSortOptionSelector);
  const manualPosting = useRootSelector(depManualPostingSelector);
  const dispatch = useRootDispatch();

  const [searchStr, setSearchString] = useState("");
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      dispatch(addDepEntryByFid(searchStr));
      setSearchString("");
    }
  };

  return (
    <div className={styles.header}>
      <WindowTitleBar
        focused={focused}
        toggleFullscreen={toggleFullscreen}
        startDrag={startDrag}
        closeWindow={() => {
          if (asel?.window === "DEP") {
            dispatch(closeAllMenus());
          }
          dispatch(closeWindow("DEP"));
        }}
        text={["Departure List", `${DepSortOptionValues[selectedSortOption]}`, `${manualPosting ? "Manual" : "Automatic"}`]}
      />
      <div className={styles.headerRow}>
        <EdstWindowHeaderButtonWithSharedEvent
          sharedUiEventId="openDepPlanOptions"
          edstWindow="PLAN_OPTIONS"
          disabled={asel === null}
          content="Plan Options..."
        />
        <EdstWindowHeaderButtonWithSharedEvent sharedUiEventId="openDepSortMenu" edstWindow="DEP_SORT_MENU" content="Sort..." />
        <EdstWindowHeaderButton onMouseDown={() => dispatch(setDepManualPosting(!manualPosting))} content="Posting Mode" />
        <EdstWindowHeaderButtonWithSharedEvent sharedUiEventId="openDepTemplateMenu" edstWindow="TEMPLATE_MENU" content="Template..." />
      </div>
      <div className={styles.bottomHeaderRow}>
        Add/Find
        <AddFindInput value={searchStr} onChange={(e) => setSearchString(e.target.value.toUpperCase())} onKeyDown={handleKeyDown} />
      </div>
    </div>
  );
};
