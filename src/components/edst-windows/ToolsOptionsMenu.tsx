import React, {useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstButton} from "../resources/EdstButton";
import {EdstTooltip} from "../resources/EdstTooltip";
import {windowEnum} from "../../enums";
import {closeWindow} from "../../redux/slices/appSlice";
import {useAppDispatch} from "../../redux/hooks";

export const ToolsOptionsMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const [displayCoordinationColumn, setDisplayCoordinationColumn] = useState(false);
  const [dropTrackDelete, setDropTrackDelete] = useState(false);
  const [iafDofManual, setIafDofManual] = useState(false);
  const [nonRvsmIndicator, setNonRvsmIndicator] = useState(false);


  return (<span>
        <div className="options-row">
          <EdstTooltip className="options-col sort"
                       onMouseDown={() => setDisplayCoordinationColumn(!dropTrackDelete)}
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
              dispatch(closeWindow(windowEnum.toolsMenu));
            }}/>
          </div>
          <div className="options-col right">
            <EdstButton className="exit-button" content="Exit"
                        onMouseDown={() => dispatch(closeWindow(windowEnum.toolsMenu))}/>
          </div>
        </div>
      </span>
  );
};
