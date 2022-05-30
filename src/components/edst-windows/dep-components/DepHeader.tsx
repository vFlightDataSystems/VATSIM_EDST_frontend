import React, { useState } from "react";
import { WindowTitleBar } from "../WindowTitleBar";
import { EdstWindowHeaderButton } from "../../resources/EdstButton";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { depManualPostingSelector, depSortDataSelector, setDepManualPosting } from "../../../redux/slices/depSlice";
import { EdstMenu, EdstWindow } from "../../../enums";
import { closeAllMenus, closeWindow, depAselSelector, setInputFocused } from "../../../redux/slices/appSlice";
import { openMenuThunk } from "../../../redux/thunks/thunks";
import { addDepEntryByFid } from "../../../redux/thunks/entriesThunks";
import { NoSelectDiv } from "../../../styles/styles";
import { WindowHeaderRowDiv } from "../../../styles/edstWindowStyles";
import { AddFindInput } from "../../InputComponents";

type DepHeaderProps = {
  focused: boolean;
};

export const DepHeader: React.FC<DepHeaderProps> = ({ focused }) => {
  const asel = useRootSelector(depAselSelector);
  const sortData = useRootSelector(depSortDataSelector);
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
        closeWindow={() => {
          if (asel?.window === EdstWindow.dep) {
            dispatch(closeAllMenus());
          }
          dispatch(closeWindow(EdstWindow.dep));
        }}
        text={["Departure List", `${sortData.selectedOption}`, `${manualPosting ? "Manual" : "Automatic"}`]}
      />
      <WindowHeaderRowDiv>
        <EdstWindowHeaderButton
          disabled={asel === null}
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstMenu.planOptions, e.currentTarget, EdstWindow.dep))}
          content="Plan Options..."
          title={Tooltips.planOptions}
        />
        <EdstWindowHeaderButton
          id="dep-sort-button"
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstMenu.sortMenu, e.currentTarget, EdstWindow.dep))}
          content="Sort..."
          title={Tooltips.sort}
        />
        <EdstWindowHeaderButton
          onMouseDown={() => dispatch(setDepManualPosting(!manualPosting))}
          content="Posting Mode"
          title={Tooltips.postingMode}
        />
        <EdstWindowHeaderButton
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstMenu.templateMenu, e.currentTarget, EdstWindow.dep))}
          content="Template..."
          title={Tooltips.template}
        />
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
    </NoSelectDiv>
  );
};
