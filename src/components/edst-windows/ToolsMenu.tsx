import React, {useContext, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstButton} from "../resources/EdstButton";
import {EdstTooltip} from "../resources/EdstTooltip";
import {EdstContext} from "../../contexts/contexts";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {menuEnum} from "../../enums";
import {closeMenu, menuSelector} from "../../redux/slices/appSlice";
import {ToolsOptionsMenu} from "./ToolsOptionsMenu";

export const ToolsMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const menuProps = useAppSelector(menuSelector(menuEnum.toolsMenu));
  const {startDrag, stopDrag} = useContext(EdstContext);
  const [focused, setFocused] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const ref = useRef(null);

  return menuProps?.position && (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className={`options-menu no-select tools`}
      ref={ref}
      id="tools-menu"
      style={{left: menuProps.position.x, top: menuProps.position.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref, menuEnum.toolsMenu)}
           onMouseUp={(event) => stopDrag(event)}
      >
        {optionsMenuOpen ? "Options" : "Tools"} Menu
      </div>
      <div className="options-body tools">
        {optionsMenuOpen && <ToolsOptionsMenu/>}
        {!optionsMenuOpen && <span>
          <div className="options-row">
          <EdstTooltip className="options-col tools"
                       onMouseDown={() => {
                       }}
                       disabled={true}
            // title={Tooltips.airspaceStatus}
                       content="Airspace Status..."
          />
        </div>
          <div className="options-row tools">
          <EdstTooltip className="options-col tools"
                       onMouseDown={() => {
                       }}
                       disabled={true}
            // title={Tooltips.AirportStreamFilterStatus}
                       content="Airport Stream Filter Status..."
          />
          </div>
          <div className="options-row tools">
          <EdstTooltip className="options-col tools"
                       onMouseDown={() => setOptionsMenuOpen(true)}
            // title={Tooltips.toolsOptions}
                       content="Options..."
          />
          </div>
          <div className="options-row tools">
          <EdstTooltip className="options-col tools"
                       onMouseDown={() => {
                       }}
                       disabled={true}
            // title={Tooltips.toolsRestrictions}
                       content="Restrictions..."
          />
          </div>
          <div className="options-row bottom margin-top">
            <div className="options-col right">
              <EdstButton className="exit-button" content="Exit"
                          onMouseDown={() => dispatch(closeMenu(menuEnum.toolsMenu))}/>
            </div>
          </div>
        </span>}
      </div>
    </div>
  );
};
