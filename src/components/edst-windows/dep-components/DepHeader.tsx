import React, {useState} from 'react';
import '../../../css/header-styles.scss';
import {WindowTitleBar} from "../WindowTitleBar";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {setDepManualPosting} from "../../../redux/slices/depSlice";
import {windowEnum} from "../../../enums";
import {closeWindow, depAselSelector, setAsel, setInputFocused} from "../../../redux/slices/appSlice";
import {addDepEntry, openWindowThunk} from "../../../redux/thunks";

interface DepHeaderProps {
  focused: boolean;
}

export const DepHeader: React.FC<DepHeaderProps> = ({focused}) => {
  const asel = useAppSelector(depAselSelector);
  const sortData = useAppSelector((state) => state.dep.sortData);
  const manualPosting = useAppSelector((state) => state.dep.manualPosting);
  const dispatch = useAppDispatch();

  const [searchStr, setSearchString] = useState('');
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      dispatch(addDepEntry(searchStr));
      setSearchString('');
    }
  };

  return (<div className="no-select">
    <WindowTitleBar
      focused={focused}
      closeWindow={() => {
        if (asel?.window === windowEnum.dep) {
          dispatch(setAsel(null));
        }
        dispatch(closeWindow(windowEnum.dep));
      }}
      text={['Departure List', `${sortData.selectedOption}`, `${manualPosting ? 'Manual' : 'Automatic'}`]}
    />
    <div>
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e: React.MouseEvent) => dispatch(openWindowThunk(windowEnum.planOptions, e.currentTarget, windowEnum.dep))}
        content="Plan Options..."
        title={Tooltips.planOptions}
      />
      <EdstWindowHeaderButton
        id="dep-sort-button"
        onMouseDown={(e: React.MouseEvent) => dispatch(openWindowThunk(windowEnum.sortMenu, e.currentTarget, windowEnum.dep))}
        content="Sort..."
        title={Tooltips.sort}
      />
      <EdstWindowHeaderButton
        onMouseDown={() => dispatch(setDepManualPosting(!manualPosting))}
        content="Posting Mode"
        title={Tooltips.postingMode}
      />
      <EdstWindowHeaderButton
        onMouseDown={(e: React.MouseEvent) => dispatch(openWindowThunk(windowEnum.templateMenu, e.currentTarget, windowEnum.dep))}
        content="Template..."
        title={Tooltips.template}
      />
    </div>
    <div className="edst-window-header-bottom-row no-select">
      Add/Find
      <div className="input-container">
        <input
          onFocus={() => dispatch(setInputFocused(true))}
          onBlur={() => dispatch(setInputFocused(false))}
          value={searchStr}
          onChange={(e) => setSearchString(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  </div>);
}