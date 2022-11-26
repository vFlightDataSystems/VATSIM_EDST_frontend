import React, { useState } from "react";

import { closeWindow } from "~redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { toolsOptionsSelector, updateToolsOptions } from "~redux/slices/aclSlice";
import { EdstButton, ExitButton } from "components/utils/EdstButton";
import clsx from "clsx";
import optionStyles from "css/optionMenu.module.scss";

export const ToolsOptionsMenu = () => {
  const dispatch = useRootDispatch();
  const toolsOptions = useRootSelector(toolsOptionsSelector);
  const [displayCoordinationColumn, setDisplayCoordinationColumn] = useState(toolsOptions.displayCoordinationColumn);
  const [dropTrackDelete, setDropTrackDelete] = useState(toolsOptions.dropTrackDelete);
  const [iafDofManual, setIafDofManual] = useState(toolsOptions.iafDofManual);
  const [nonRvsmIndicator, setNonRvsmIndicator] = useState(toolsOptions.nonRvsmIndicator);

  const renderRow = (content: string, selected: boolean, onMouseDown?: React.MouseEventHandler) => (
    <div className={optionStyles.row}>
      <div className={clsx(optionStyles.col, "flex", { isDisabled: !onMouseDown })} onMouseDown={onMouseDown}>
        <div className={clsx(optionStyles.indicator, { selected })} />
        {content}
      </div>
    </div>
  );

  return (
    <>
      {renderRow("Display Coordination Column", displayCoordinationColumn, () => setDisplayCoordinationColumn(!displayCoordinationColumn))}
      {renderRow("Drop Track Delete", dropTrackDelete, () => setDropTrackDelete(!dropTrackDelete))}
      {renderRow("IAFDOF Manual", iafDofManual, () => setIafDofManual(!iafDofManual))}
      {renderRow("Non-RVSM Indicator", nonRvsmIndicator, () => setNonRvsmIndicator(!nonRvsmIndicator))}
      <div className={optionStyles.bottomRow}>
        <div className={optionStyles.col}>
          <EdstButton
            content="OK"
            onMouseDown={() => {
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
        </div>
        <div className={clsx(optionStyles.col, "right")}>
          <ExitButton onMouseDown={() => dispatch(closeWindow("TOOLS_MENU"))} />
        </div>
      </div>
    </>
  );
};
