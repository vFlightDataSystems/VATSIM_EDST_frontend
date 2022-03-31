import React, {useState} from 'react';

import {EdstButton} from "../../resources/EdstButton";
import {EdstTooltip} from "../../resources/EdstTooltip";
import {menuEnum} from "../../../enums";
import {closeMenu} from "../../../redux/slices/appSlice";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {toolsOptionsSelector, updateToolsOptions} from "../../../redux/slices/aclSlice";
import {
  OptionsBodyCol,
  OptionsBodyRow,
  OptionsBottomRow,
  OptionSelectedIndicator, OptionsFlexCol
} from "../../../styles/optionMenuStyles";

export const ToolsOptionsMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const toolsOptions = useAppSelector(toolsOptionsSelector);
  const [displayCoordinationColumn, setDisplayCoordinationColumn] = useState(toolsOptions.displayCoordinationColumn);
  const [dropTrackDelete, setDropTrackDelete] = useState(toolsOptions.dropTrackDelete);
  const [iafDofManual, setIafDofManual] = useState(toolsOptions.iafDofManual);
  const [nonRvsmIndicator, setNonRvsmIndicator] = useState(toolsOptions.nonRvsmIndicator);

  return (<>
      <OptionsBodyRow>
        <EdstTooltip style={{flexGrow: 1}} onMouseDown={() => setDisplayCoordinationColumn(!displayCoordinationColumn)}>
          <OptionsFlexCol>
            <OptionSelectedIndicator selected={displayCoordinationColumn}/>
            Display Coordination Column
          </OptionsFlexCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip style={{flexGrow: 1}} onMouseDown={() => setDropTrackDelete(!dropTrackDelete)}>
          <OptionsFlexCol>
            <OptionSelectedIndicator selected={dropTrackDelete}/>
            Drop Track Delete
          </OptionsFlexCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip style={{flexGrow: 1}} onMouseDown={() => setIafDofManual(!iafDofManual)}>
          <OptionsFlexCol>
            <OptionSelectedIndicator selected={iafDofManual}/>
            IAFDOF Manual
          </OptionsFlexCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip style={{flexGrow: 1}} onMouseDown={() => setNonRvsmIndicator(!nonRvsmIndicator)}>
          <OptionsFlexCol>
            <OptionSelectedIndicator selected={nonRvsmIndicator}/>
            Non-RVSM Indicator
          </OptionsFlexCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBottomRow>
        <OptionsBodyCol>
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
        </OptionsBodyCol>
        <OptionsBodyCol alignRight={true}>
          <EdstButton content="Exit" onMouseDown={() => dispatch(closeMenu(menuEnum.toolsMenu))}/>
        </OptionsBodyCol>
      </OptionsBottomRow>
    </>
  );
};
