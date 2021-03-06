import React from 'react';
import {WindowTitleBar} from "../WindowTitleBar";
import {EdstWindowHeaderButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {openMenuThunk} from "../../../redux/thunks/thunks";
import {menuEnum, windowEnum} from "../../../enums";
import {
  AselType,
  closeAllMenus, closeMenu,
  closeWindow, gpdAselSelector,
} from "../../../redux/slices/appSlice";
import {NoSelectDiv} from "../../../styles/styles";
import {WindowHeaderRowDiv} from "../../../styles/edstWindowStyles";

type GpdHeaderProps = {
  focused: boolean,
  zoomLevel: number
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>
}

export const GpdHeader: React.FC<GpdHeaderProps> = ({focused, zoomLevel, setZoomLevel}) => {
  const asel = useAppSelector(gpdAselSelector);
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

  return (<NoSelectDiv>
    <WindowTitleBar
      focused={focused}
      closeWindow={() => {
        if (asel?.window === windowEnum.graphicPlanDisplay) {
          dispatch(closeAllMenus());
        }
        dispatch(closeWindow(windowEnum.graphicPlanDisplay));
      }}
      text={['Graphic Plan Display - Current Time']}
    />
    <div>
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(menuEnum.planOptions, e.currentTarget))}
        content="Plan Options..."
        title={Tooltips.planOptions}
      />
      <EdstWindowHeaderButton
        disabled={asel === null}
        onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(menuEnum.holdMenu, e.currentTarget, windowEnum.graphicPlanDisplay, false, (asel as AselType).cid))}
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
        onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(menuEnum.templateMenu, e.currentTarget, windowEnum.graphicPlanDisplay, false, asel?.cid ?? null))}
        content="Template..."
        title={Tooltips.template}
      />
      <EdstWindowHeaderButton
        disabled={true}
        content="Clean Up"
        // title={Tooltips.gpdCleanUp}
      />
    </div>
    <WindowHeaderRowDiv>
      <EdstWindowHeaderButton
        disabled={true}
        content="Recenter"
        title={Tooltips.planOptions}
      />
      <EdstWindowHeaderButton disabled={true} onMouseDown={handleRangeClick} content={`Range`}/>
      <EdstWindowHeaderButton disabled={true} content="Suppress"/>
      <EdstWindowHeaderButton
        onMouseDown={(e: React.MouseEvent) => {
          dispatch(closeMenu(menuEnum.gpdMapOptionsMenu));
          dispatch(openMenuThunk(menuEnum.gpdMapOptionsMenu, e.currentTarget, windowEnum.graphicPlanDisplay));
        }}
        content="Map Options..."
      />
      <EdstWindowHeaderButton
        onMouseDown={(e: React.MouseEvent) => {
          dispatch(closeMenu(menuEnum.toolsMenu));
          dispatch(openMenuThunk(menuEnum.toolsMenu, e.currentTarget, windowEnum.graphicPlanDisplay));
        }}
        content="Tools..."
      />
      <EdstWindowHeaderButton
        disabled={true}
        content="Saved Map"
      />
    </WindowHeaderRowDiv>
  </NoSelectDiv>);
};