import React, { useState } from "react";
import { WindowTitleBar } from "../WindowTitleBar";
import { EdstWindowHeaderButton } from "../../utils/EdstButton";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { depManualPostingSelector, depSortOptionSelector, setDepManualPosting } from "../../../redux/slices/depSlice";
import { closeAllMenus, closeWindow, depAselSelector } from "../../../redux/slices/appSlice";
import { addDepEntryByFid } from "../../../redux/thunks/entriesThunks";
import { NoSelectDiv } from "../../../styles/styles";
import { WindowHeaderRowDiv } from "../../../styles/edstWindowStyles";
import { AddFindInput } from "../../InputComponents";
import { openMenuThunk } from "../../../redux/thunks/openMenuThunk";
import { EdstWindow } from "../../../typeDefinitions/enums/edstWindow";
import { DepSortOptionValues } from "../../../typeDefinitions/enums/dep/depSortOption";

type DepHeaderProps = {
  focused: boolean;
  toggleFullscreen: () => void;
  startDrag: (e: React.MouseEvent<HTMLDivElement>) => void;
};

/**
 * DEP title bar and header row with add/find input field
 * @param focused focused state of DEP window
 * @param toggleFullscreen eventHandler to toggle maximized mode of DEP window
 * @param startDrag startDrag event handler
 */
export const DepHeader = ({ focused, toggleFullscreen, startDrag }: DepHeaderProps) => {
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
      <WindowHeaderRowDiv>
        <EdstWindowHeaderButton
          disabled={asel === null}
          onMouseDown={e => dispatch(openMenuThunk(EdstWindow.PLAN_OPTIONS, e.currentTarget))}
          content="Plan Options..."
          title={Tooltips.planOptions}
        />
        <EdstWindowHeaderButton
          id="dep-sort-button"
          onMouseDown={e => dispatch(openMenuThunk(EdstWindow.DEP_SORT_MENU, e.currentTarget))}
          content="Sort..."
          title={Tooltips.sort}
        />
        <EdstWindowHeaderButton
          onMouseDown={() => dispatch(setDepManualPosting(!manualPosting))}
          content="Posting Mode"
          title={Tooltips.postingMode}
        />
        <EdstWindowHeaderButton
          onMouseDown={e => dispatch(openMenuThunk(EdstWindow.TEMPLATE_MENU, e.currentTarget))}
          content="Template..."
          title={Tooltips.template}
        />
      </WindowHeaderRowDiv>
      <WindowHeaderRowDiv bottomRow>
        Add/Find
        <AddFindInput value={searchStr} onChange={e => setSearchString(e.target.value.toUpperCase())} onKeyDown={handleKeyDown} />
      </WindowHeaderRowDiv>
    </NoSelectDiv>
  );
};
