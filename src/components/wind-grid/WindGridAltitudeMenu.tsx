import React, { useRef, useState } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { closeWindow, zStackSelector, pushZStack, windowSelector } from "~redux/slices/appSlice";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { EdstButton, ExitButton } from "components/utils/EdstButton";
import optionStyles from "css/optionMenu.module.scss";
import altMenuStyles from "css/windGridAltMenu.module.scss";
import clsx from "clsx";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { setWindGridFlightLevel, windGridFlightLevelSelector } from "~redux/slices/windGridSlice";

type Props = {
  currentLevel: number;
  onSelect?: (fl: number) => void;
  onClose?: () => void;
};

export const WindGridAltitudeMenu = ({ currentLevel, onSelect, onClose }: Props) => {
  const menu = "WIND_GRID_ALTITUDE_MENU";
  const dispatch = useRootDispatch();
  const windowProps = useRootSelector((state) => windowSelector(state, menu));
  const zStack = useRootSelector(zStackSelector);

  const reduxLevel = useRootSelector(windGridFlightLevelSelector);

  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);

  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, menu, "mouseup");

  // Build levels from FL000 to FL410 in 1,000 ft increments (0..410 step 10)
  const levels: number[] = [];
  for (let fl = 0; fl <= 410; fl += 10) {
    levels.push(fl);
  }

  const half = Math.ceil(levels.length / 2);
  const left = levels.slice(0, half);
  const right = levels.slice(half);

  // Local selection state, initialized from redux or prop
  const [selectedLevel, setSelectedLevel] = useState<number>(reduxLevel ?? currentLevel ?? 0);

  const handleSelect = (fl: number) => {
    setSelectedLevel(fl);
  };

  const handleOk = () => {
    dispatch(setWindGridFlightLevel(selectedLevel));
    onSelect?.(selectedLevel);
    onClose?.();
    dispatch(closeWindow(menu));
  };

  const handleExit = () => {
    onClose?.();
    dispatch(closeWindow(menu));
  };

  return (
    <div
      className={clsx(altMenuStyles.root, { noPointerEvents: anyDragging })}
      style={{ ...windowProps.position, zIndex: 10000 + zStack.indexOf(menu) }}
      ref={ref}
      onMouseDown={() => zStack.indexOf(menu) < zStack.length - 1 && dispatch(pushZStack(menu))}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <div className={clsx(altMenuStyles.header, { focused })} onMouseDown={startDrag}>
        Altitude Menu
      </div>

      <div className={altMenuStyles.body} style={{ padding: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {left.map((fl) => (
              <EdstButton
                key={`L-${fl}`}
                content={`${fl.toString().padStart(3, "0")}`}
                selected={selectedLevel === fl}
                onMouseDown={() => handleSelect(fl)}
              />
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {right.map((fl) => (
              <EdstButton
                key={`R-${fl}`}
                content={`${fl.toString().padStart(3, "0")}`}
                selected={selectedLevel === fl}
                onMouseDown={() => handleSelect(fl)}
              />
            ))}
          </div>
        </div>

        <div className={optionStyles.bottomRow} style={{ marginTop: 10 }}>
          <div className={optionStyles.col}>
            <EdstButton content="OK" onMouseDown={handleOk} />
          </div>
          <div className={clsx(optionStyles.col, "right")}>
            <ExitButton onMouseDown={handleExit} />
          </div>
        </div>
      </div>
    </div>
  );
};
