import React, { useState } from "react";

import { closeWindow } from "~redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { toolsOptionsSelector, updateToolsOptions } from "~redux/slices/aclSlice";
import { OptionsBodyCol, OptionsBodyRow, OptionsBottomRow, OptionIndicator, OptionsFlexCol } from "styles/optionMenuStyles";
import { EdstButton, ExitButton } from "components/utils/EdstButton";

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
        <OptionsFlexCol onMouseDown={() => setDisplayCoordinationColumn(!displayCoordinationColumn)}>
          <OptionIndicator selected={displayCoordinationColumn} />
          Display Coordination Column
        </OptionsFlexCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <OptionsFlexCol onMouseDown={() => setDropTrackDelete(!dropTrackDelete)}>
          <OptionIndicator selected={dropTrackDelete} />
          Drop Track Delete
        </OptionsFlexCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <OptionsFlexCol onMouseDown={() => setIafDofManual(!iafDofManual)}>
          <OptionIndicator selected={iafDofManual} />
          IAFDOF Manual
        </OptionsFlexCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <OptionsFlexCol onMouseDown={() => setNonRvsmIndicator(!nonRvsmIndicator)}>
          <OptionIndicator selected={nonRvsmIndicator} />
          Non-RVSM Indicator
        </OptionsFlexCol>
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
              dispatch(closeWindow("TOOLS_MENU"));
            }}
          />
        </OptionsBodyCol>
        <OptionsBodyCol alignRight>
          <ExitButton onMouseDown={() => dispatch(closeWindow("TOOLS_MENU"))} />
        </OptionsBodyCol>
      </OptionsBottomRow>
    </>
  );
};
