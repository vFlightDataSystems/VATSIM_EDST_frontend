import React from "react";
import styled from "styled-components";
import { WindowTitleBar } from "../WindowTitleBar";
import { EdstWindowHeaderButton } from "../../resources/EdstButton";
import { Tooltips } from "../../../tooltips";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { openMenuThunk } from "../../../redux/thunks/thunks";
import { closeAllMenus, closeWindow, gpdAselSelector } from "../../../redux/slices/appSlice";
import { NoSelectDiv } from "../../../styles/styles";
import { WindowHeaderRowDiv } from "../../../styles/edstWindowStyles";
import { gpdSuppressedSelector, toggleSuppressed } from "../../../redux/slices/gpdSlice";
import { EdstWindow } from "../../../namespaces";

type GpdHeaderProps = {
  focused: boolean;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
};

const GpdDiv = styled(NoSelectDiv)``;

export const GpdHeader: React.FC<GpdHeaderProps> = ({ focused, zoomLevel, setZoomLevel }) => {
  const asel = useRootSelector(gpdAselSelector);
  const suppressed = useRootSelector(gpdSuppressedSelector);
  const dispatch = useRootDispatch();

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
  };

  const handleSuppressClick = () => {
    dispatch(toggleSuppressed());
  };

  return (
    <GpdDiv>
      <WindowTitleBar
        focused={focused}
        closeWindow={() => {
          if (asel?.window === EdstWindow.GPD) {
            dispatch(closeAllMenus());
          }
          dispatch(closeWindow(EdstWindow.GPD));
        }}
        text={["Graphic Plan Display - Current Time"]}
      />
      <div>
        <EdstWindowHeaderButton
          disabled={asel === null}
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstWindow.PLAN_OPTIONS, e.currentTarget))}
          content="Plan Options..."
          title={Tooltips.planOptions}
        />
        <EdstWindowHeaderButton
          disabled={asel === null}
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstWindow.HOLD_MENU, e.currentTarget, EdstWindow.GPD, false))}
          content="Hold..."
          title={Tooltips.hold}
        />
        <EdstWindowHeaderButton disabled content="Show" />
        <EdstWindowHeaderButton disabled content="Show ALL" />
        <EdstWindowHeaderButton disabled content="Graphic..." />
        <EdstWindowHeaderButton
          onMouseDown={(e: React.MouseEvent) => dispatch(openMenuThunk(EdstWindow.TEMPLATE_MENU, e.currentTarget, EdstWindow.GPD, false))}
          content="Template..."
          title={Tooltips.template}
        />
        <EdstWindowHeaderButton
          disabled
          content="Clean Up"
          // title={Tooltips.gpdCleanUp}
        />
      </div>
      <WindowHeaderRowDiv>
        <EdstWindowHeaderButton disabled content="Recenter" title={Tooltips.planOptions} />
        <EdstWindowHeaderButton disabled onMouseDown={handleRangeClick} content="Range" />
        <EdstWindowHeaderButton content={!suppressed ? "Suppress" : "Restore"} onMouseDown={handleSuppressClick} width={84} />
        <EdstWindowHeaderButton
          onMouseDown={(e: React.MouseEvent) => {
            dispatch(closeWindow(EdstWindow.GPD_MAP_OPTIONS_MENU));
            dispatch(openMenuThunk(EdstWindow.GPD_MAP_OPTIONS_MENU, e.currentTarget, EdstWindow.GPD));
          }}
          content="Map Options..."
        />
        <EdstWindowHeaderButton
          onMouseDown={(e: React.MouseEvent) => {
            dispatch(closeWindow(EdstWindow.TOOLS_MENU));
            dispatch(openMenuThunk(EdstWindow.TOOLS_MENU, e.currentTarget, EdstWindow.GPD));
          }}
          content="Tools..."
        />
        <EdstWindowHeaderButton disabled content="Saved Map" />
      </WindowHeaderRowDiv>
    </GpdDiv>
  );
};
