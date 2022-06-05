import React, { useState } from "react";
import { WindowTitleBar } from "../WindowTitleBar";
import { EdstWindowHeaderButton } from "../../resources/EdstButton";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { depManualPostingSelector, depSortDataSelector, setDepManualPosting } from "../../../redux/slices/depSlice";
import { closeAllMenus, closeWindow, depAselSelector } from "../../../redux/slices/appSlice";
import { openMenuThunk } from "../../../redux/thunks/thunks";
import { addDepEntryByFid } from "../../../redux/thunks/entriesThunks";
import { NoSelectDiv } from "../../../styles/styles";
import { WindowHeaderRowDiv } from "../../../styles/edstWindowStyles";
import { AddFindInput } from "../../InputComponents";
import { EdstWindow, SortOptionValues } from "../../../namespaces";

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
          if (asel?.window === EdstWindow.DEP) {
            dispatch(closeAllMenus());
          }
          dispatch(closeWindow(EdstWindow.DEP));
        }}
        text={["Departure List", `${SortOptionValues[sortData.selectedOption]}`, `${manualPosting ? "Manual" : "Automatic"}`]}
      />
      <WindowHeaderRowDiv>
        <EdstWindowHeaderButton
          disabled={asel === null}
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstWindow.PLAN_OPTIONS, e.currentTarget, EdstWindow.DEP))}
          content="Plan Options..."
          title={Tooltips.planOptions}
        />
        <EdstWindowHeaderButton
          id="dep-sort-button"
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstWindow.SORT_MENU, e.currentTarget, EdstWindow.DEP))}
          content="Sort..."
          title={Tooltips.sort}
        />
        <EdstWindowHeaderButton
          onMouseDown={() => dispatch(setDepManualPosting(!manualPosting))}
          content="Posting Mode"
          title={Tooltips.postingMode}
        />
        <EdstWindowHeaderButton
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstWindow.TEMPLATE_MENU, e.currentTarget, EdstWindow.DEP))}
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
