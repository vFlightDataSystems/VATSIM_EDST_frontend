import React, {useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstButton} from "../resources/EdstButton";
import {EdstTooltip} from "../resources/EdstTooltip";
import {menuEnum} from "../../enums";
import {closeMenu} from "../../redux/slices/appSlice";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {toolsOptionsSelector, updateToolsOptions} from "../../redux/slices/aclSlice";

export const ToolsOptionsMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const toolsOptions = useAppSelector(toolsOptionsSelector);
  const [displayCoordinationColumn, setDisplayCoordinationColumn] = useState(toolsOptions.displayCoordinationColumn);
  const [dropTrackDelete, setDropTrackDelete] = useState(toolsOptions.dropTrackDelete);
  const [iafDofManual, setIafDofManual] = useState(toolsOptions.iafDofManual);
  const [nonRvsmIndicator, setNonRvsmIndicator] = useState(toolsOptions.nonRvsmIndicator);

  return (<span>
        <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => setDisplayCoordinationColumn(!displayCoordinationColumn)}
          >
            <div className={`box ${displayCoordinationColumn ? 'selected' : ''}`}/>
            Display Coordination Column
          </EdstTooltip>
        </div>
      <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => setDropTrackDelete(!dropTrackDelete)}
          >
            <div className={`box ${dropTrackDelete ? 'selected' : ''}`}/>
            Drop Track Delete
          </EdstTooltip>
        </div>
      <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => setIafDofManual(!iafDofManual)}
          >
            <div className={`box ${iafDofManual ? 'selected' : ''}`}/>
            IAFDOF Manual
          </EdstTooltip>
        </div>
      <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => setNonRvsmIndicator(!nonRvsmIndicator)}
          >
            <div className={`box ${nonRvsmIndicator ? 'selected' : ''}`}/>
            Non-RVSM Indicator
          </EdstTooltip>
        </div>
      <div className="options-row bottom">
          <div className="options-col left">
            <EdstButton content="OK" onMouseDown={() => {
              // set data when OK is pressed
              dispatch(updateToolsOptions({
                displayCoordinationColumn: displayCoordinationColumn,
                dropTrackDelete: dropTrackDelete,
                iafDofManual: iafDofManual,
                nonRvsmIndicator: nonRvsmIndicator
              }));
              dispatch(closeMenu(menuEnum.toolsMenu));
            }}/>
          </div>
          <div className="options-col right">
            <EdstButton className="exit-button" content="Exit"
                        onMouseDown={() => dispatch(closeMenu(menuEnum.toolsMenu))}/>
          </div>
        </div>
      </span>
  );
};
