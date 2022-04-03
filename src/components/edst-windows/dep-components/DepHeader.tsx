import React, {useState} from 'react';
import {WindowTitleBar} from "../WindowTitleBar";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {setDepManualPosting} from "../../../redux/slices/depSlice";
import {menuEnum, windowEnum} from "../../../enums";
import {closeAllMenus, closeWindow, depAselSelector, setInputFocused} from "../../../redux/slices/appSlice";
import {openMenuThunk} from "../../../redux/thunks/thunks";
import {addDepEntryByFid} from "../../../redux/thunks/entriesThunks";
import {NoSelectDiv} from "../../../styles/styles";
import {WindowHeaderRowDiv} from "../../../styles/edstWindowStyles";
import {AddFindInput} from "../../InputComponents";

type DepHeaderProps = {
  focused: boolean
}

export const DepHeader: React.FC<DepHeaderProps> = ({focused}) => {
  const asel = useAppSelector(depAselSelector);
  const sortData = useAppSelector((state) => state.dep.sortData);
  const manualPosting = useAppSelector((state) => state.dep.manualPosting);
  const dispatch = useAppDispatch();

  const [searchStr, setSearchString] = useState('');
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      dispatch(addDepEntryByFid(searchStr));
      setSearchString('');
    }
  };

  return (<NoSelectDiv>
    <WindowTitleBar
      focused={focused}
      closeWindow={() => {
        if (asel?.window === windowEnum.dep) {
          dispatch(closeAllMenus());
        }
        dispatch(closeWindow(windowEnum.dep))
      }}
      text={['Departure List', `${sortData.selectedOption}`, `${manualPosting ? 'Manual' : 'Automatic'}`]}
    />
    <WindowHeaderRowDiv>
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(menuEnum.planOptions, e.currentTarget, windowEnum.dep))}
        content="Plan Options..."
        title={Tooltips.planOptions}
      />
      <EdstWindowHeaderButton
        id="dep-sort-button"
        onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(menuEnum.sortMenu, e.currentTarget, windowEnum.dep))}
        content="Sort..."
        title={Tooltips.sort}
      />
      <EdstWindowHeaderButton
        onMouseDown={() => dispatch(setDepManualPosting(!manualPosting))}
        content="Posting Mode"
        title={Tooltips.postingMode}
      />
      <EdstWindowHeaderButton
        onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(menuEnum.templateMenu, e.currentTarget, windowEnum.dep))}
        content="Template..."
        title={Tooltips.template}
      />
    </WindowHeaderRowDiv>
    <WindowHeaderRowDiv bottomRow={true}>
      Add/Find
      <AddFindInput
        onFocus={() => dispatch(setInputFocused(true))}
        onBlur={() => dispatch(setInputFocused(false))}
        value={searchStr}
        onChange={(e) => setSearchString(e.target.value.toUpperCase())}
        onKeyDown={handleKeyDown}
      />
    </WindowHeaderRowDiv>
  </NoSelectDiv>);
}