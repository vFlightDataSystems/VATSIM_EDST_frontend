import React, { useMemo, useRef, useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { mraMsgSelector, pushZStack, setMraMessage, windowPositionSelector, zStackSelector } from "~redux/slices/appSlice";
import { useDragging } from "hooks/useDragging";
import { useWindowOptions } from "hooks/useWindowOptions";
import { windowOptionsSelector } from "~redux/slices/windowOptionsSlice";
import { FloatingWindowOptionContainer } from "components/utils/FloatingWindowOptionContainer";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import clsx from "clsx";
import mraStyles from "css/mra.module.scss";

export const MessageResponseArea = () => {
  const pos = useRootSelector((state) => windowPositionSelector(state, "MESSAGE_RESPONSE_AREA"));
  const msg = useRootSelector(mraMsgSelector);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "MESSAGE_RESPONSE_AREA", "mousedown");
  const { width } = useResizeDetector({ targetRef: ref });

  const [showOptions, setShowOptions] = useState(false);
  const windowOptions = useRootSelector(windowOptionsSelector("MESSAGE_RESPONSE_AREA"));
  const extraOptions = useMemo(
    () => ({
      clear: {
        value: "CLEAR",
        backgroundColor: "#000000",
        onMouseDown: () => dispatch(setMraMessage("")),
      },
    }),
    [dispatch]
  );
  const options = useWindowOptions("MESSAGE_RESPONSE_AREA", extraOptions);

  const onMraMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (zStack.indexOf("MESSAGE_RESPONSE_AREA") < zStack.length - 1) {
      dispatch(pushZStack("MESSAGE_RESPONSE_AREA"));
    }
    switch (event.button) {
      case 1:
        event.preventDefault();
        setShowOptions(true);
        break;
      default:
        startDrag(event);
        break;
    }
  };

  const zIndex = zStack.indexOf("MESSAGE_RESPONSE_AREA");

  return (
    <>
      <div
        className={clsx(mraStyles.root, `fontSize${windowOptions.fontSizeIndex}`, { noPointerEvents: anyDragging })}
        ref={ref}
        style={{ ...pos, zIndex: 10000 + zIndex, "--width": `${windowOptions.width}ch`, "--brightness": windowOptions.brightness / 100 }}
        onMouseDown={onMraMouseDown}
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        {msg}
      </div>
      {showOptions && width && (
        <FloatingWindowOptionContainer
          parentWidth={width + 6}
          parentPos={pos}
          zIndex={zIndex}
          title="RA"
          onClose={() => setShowOptions(false)}
          options={options}
        />
      )}
    </>
  );
};
