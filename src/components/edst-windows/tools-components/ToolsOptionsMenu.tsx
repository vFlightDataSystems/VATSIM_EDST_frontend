import React, { useState } from "react";

import { closeWindow } from "~redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { toolsOptionsSelector, updateToolsOptions } from "~redux/slices/aclSlice";
import { OptionsBodyCol, OptionsBodyRow, OptionsBottomRow, OptionIndicator, OptionsFlexCol } from "styles/optionMenuStyles";
import { EdstWindow } from "enums/edstWindow";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { EdstButton, ExitButton } from "../../utils/EdstButton";

export const ToolsOptionsMenu = () => {
  const dispatch = useRootDispatch();
  const toolsOptions = useRootSelector(toolsOptionsSelector);
  const [displayCoordinationColumn, setDisplayCoordinationColumn] = useState(toolsOptions.displayCoordinationColumn);
  const [dropTrackDelete, setDropTrackDelete] = useState(toolsOptions.dropTrackDelete);
  const [iafDofManual, setIafDofManual] = useState(toolsOptions.iafDofManual);
  const [nonRvsmIndicator, setNonRvsmIndicator] = useState(toolsOptions.nonRvsmIndicator);

  return (
    <>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setDisplayCoordinationColumn(!displayCoordinationColumn)}>
          <OptionsFlexCol>
            <OptionIndicator selected={displayCoordinationColumn} />
            Display Coordination Column
          </OptionsFlexCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setDropTrackDelete(!dropTrackDelete)}>
          <OptionsFlexCol>
            <OptionIndicator selected={dropTrackDelete} />
            Drop Track Delete
          </OptionsFlexCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setIafDofManual(!iafDofManual)}>
          <OptionsFlexCol>
            <OptionIndicator selected={iafDofManual} />
            IAFDOF Manual
          </OptionsFlexCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setNonRvsmIndicator(!nonRvsmIndicator)}>
          <OptionsFlexCol>
            <OptionIndicator selected={nonRvsmIndicator} />
            Non-RVSM Indicator
          </OptionsFlexCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBottomRow>
        <OptionsBodyCol>
          <EdstButton
            content="OK"
            onMouseDown={() => {
              // set data when OK is pressed
              dispatch(
                updateToolsOptions({
                  displayCoordinationColumn,
                  dropTrackDelete,
                  iafDofManual,
                  nonRvsmIndicator,
                })
              );
              dispatch(closeWindow(EdstWindow.TOOLS_MENU));
            }}
          />
        </OptionsBodyCol>
        <OptionsBodyCol alignRight>
          <ExitButton onMouseDown={() => dispatch(closeWindow(EdstWindow.TOOLS_MENU))} />
        </OptionsBodyCol>
      </OptionsBottomRow>
    </>
  );
};
