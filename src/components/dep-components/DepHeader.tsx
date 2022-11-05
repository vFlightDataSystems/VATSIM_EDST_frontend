import React, { useState } from "react";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { depManualPostingSelector, depSortOptionSelector, setDepManualPosting } from "~redux/slices/depSlice";
import { closeAllMenus, closeWindow, depAselSelector } from "~redux/slices/appSlice";
import { addDepEntryByFid } from "~redux/thunks/entriesThunks";
import { NoSelectDiv } from "styles/NoSelectDiv";
import { EdstWindow } from "enums/edstWindow";
import { DepSortOptionValues } from "enums/dep/depSortOption";
import { EdstWindowHeaderRowDiv } from "styles/edstStyles";
import type { HeaderComponentProps } from "components/utils/FullscreenWindow";
import { AddFindInput } from "components/utils/InputComponents";
import { EdstWindowHeaderButton, EdstWindowHeaderButtonWithSharedEvent } from "components/utils/EdstButton";
import { WindowTitleBar } from "components/WindowTitleBar";

/**
 * DEP title bar and header row with add/find input field
 * @param focused focused state of DEP window
 * @param toggleFullscreen eventHandler to toggle maximized mode of DEP window
 * @param startDrag startDrag event handler
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
    <NoSelectDiv>
      <WindowTitleBar
        focused={focused}
        toggleFullscreen={toggleFullscreen}
        startDrag={startDrag}
        closeWindow={() => {
          if (asel?.window === EdstWindow.DEP) {
            dispatch(closeAllMenus());
          }
          dispatch(closeWindow(EdstWindow.DEP));
        }}
        text={["Departure List", `${DepSortOptionValues[selectedSortOption]}`, `${manualPosting ? "Manual" : "Automatic"}`]}
      />
      <EdstWindowHeaderRowDiv>
        <EdstWindowHeaderButtonWithSharedEvent
          sharedUiEventId="openDepPlanOptions"
          edstWindow={EdstWindow.PLAN_OPTIONS}
          disabled={asel === null}
          content="Plan Options..."
          title={Tooltips.planOptions}
        />
        <EdstWindowHeaderButtonWithSharedEvent
          sharedUiEventId="openDepSortMenu"
          edstWindow={EdstWindow.DEP_SORT_MENU}
          content="Sort..."
          title={Tooltips.sort}
        />
        <EdstWindowHeaderButton
          onMouseDown={() => dispatch(setDepManualPosting(!manualPosting))}
          content="Posting Mode"
          title={Tooltips.postingMode}
        />
        <EdstWindowHeaderButtonWithSharedEvent
          sharedUiEventId="openDepTemplateMenu"
          edstWindow={EdstWindow.TEMPLATE_MENU}
          content="Template..."
          title={Tooltips.template}
        />
      </EdstWindowHeaderRowDiv>
      <EdstWindowHeaderRowDiv bottomRow>
        Add/Find
        <AddFindInput value={searchStr} onChange={(e) => setSearchString(e.target.value.toUpperCase())} onKeyDown={handleKeyDown} />
      </EdstWindowHeaderRowDiv>
    </NoSelectDiv>
  );
};
