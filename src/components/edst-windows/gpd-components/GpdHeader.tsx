import React from 'react';
import {WindowTitleBar} from "../WindowTitleBar";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {openMenuThunk} from "../../../redux/thunks/thunks";
import {menuEnum, windowEnum} from "../../../enums";
import {
  aselSelector,
  AselType,
  closeAllMenus, closeMenu,
  closeWindow,
  setAsel,
} from "../../../redux/slices/appSlice";

type GpdHeaderProps = {
  focused: boolean,
  zoomLevel: number
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>
}

export const GpdHeader: React.FC<GpdHeaderProps> = ({focused, zoomLevel, setZoomLevel}) => {
  const asel = useAppSelector(aselSelector);
  const dispatch = useAppDispatch();

  const handleRangeClick = (event: React.MouseEvent) => {
    switch (event.button) {
      case 0:
        setZoomLevel(Math.min(zoomLevel + 1, 10));
        break;
      case 1:
        setZoomLevel(Math.max(zoomLevel - 1, 4));
        break;
      default:
        break;
    }
  }

  return (<div>
    <WindowTitleBar
      focused={focused}
      closeWindow={() => {
        if (asel?.window === windowEnum.graphicPlanDisplay) {
          dispatch(closeAllMenus);
          dispatch(setAsel(null));
        }
        dispatch(closeWindow(windowEnum.graphicPlanDisplay));
      }}
      text={['Graphic Plan Display - Current Time']}
    />
    <div className="no-select">
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e: React.KeyboardEvent) => dispatch(openMenuThunk(menuEnum.planOptions, e.currentTarget))}
        content="Plan Options..."
        title={Tooltips.planOptions}
      />
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e: React.KeyboardEvent) => dispatch(openMenuThunk(menuEnum.holdMenu, e.currentTarget, windowEnum.graphicPlanDisplay, false, (asel as AselType).cid))}
        content="Hold..."
        title={Tooltips.hold}
      />
      <EdstWindowHeaderButton disabled={true} content="Show"/>
      <EdstWindowHeaderButton disabled={true} content="Show ALL"/>
      <EdstWindowHeaderButton
        disabled={true}
        content="Graphic..."
      />
      <EdstWindowHeaderButton
        onMouseDown={(e: React.KeyboardEvent) => dispatch(openMenuThunk(menuEnum.templateMenu, e.currentTarget, windowEnum.graphicPlanDisplay, false, asel?.cid ?? null))}
        content="Template..."
        title={Tooltips.template}
      />
      <EdstWindowHeaderButton
        disabled={true}
        content="Clean Up"
        // title={Tooltips.gpdCleanUp}
      />
    </div>
    <div className="no-select">
      <EdstWindowHeaderButton
        disabled={true}
        content="Recenter"
        title={Tooltips.planOptions}
      />
      <EdstWindowHeaderButton disabled={true} onMouseDown={handleRangeClick} content={`Range`}/>
      <EdstWindowHeaderButton disabled={true} content="Suppress"/>
      <EdstWindowHeaderButton
        disabled={true}
        content="Map Options..."
      />
      <EdstWindowHeaderButton
        onMouseDown={(e: React.KeyboardEvent) => {
          dispatch(closeMenu(menuEnum.toolsMenu));
          dispatch(openMenuThunk(menuEnum.toolsMenu, e.currentTarget, windowEnum.graphicPlanDisplay));
        }}
        content="Tools..."
      />
      <EdstWindowHeaderButton
        disabled={true}
        content="Saved Map"
      />
    </div>
  </div>);
};