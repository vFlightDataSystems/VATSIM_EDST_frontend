import React from "react";
import titleBarStyles from "css/windowTitleBar.module.scss";
import clsx from "clsx";

type WindowTitleBarProps = {
  focused: boolean;
  closeWindow: () => void;
  toggleFullscreen: () => void;
  startDrag: React.MouseEventHandler<HTMLDivElement>;
  text: string[];
};

/**
 * Window title bar for various components
 */
export const WindowTitleBar = ({ focused, text, closeWindow, toggleFullscreen, startDrag }: WindowTitleBarProps) => {
  return (
    <div className={titleBarStyles.root}>
      <div className={clsx(titleBarStyles.col, { focused })}>
        <button className={clsx(titleBarStyles.block, { focused })}>
          <div className={clsx(titleBarStyles.block, "w8", "h3", { focused })} />
        </button>
      </div>
      <div className={clsx(titleBarStyles.col, "middle", { focused })} onMouseDown={startDrag}>
        <div className={clsx(titleBarStyles.block, { focused })}>
          {text.map((s, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className={titleBarStyles.text} key={i}>
              {s}
            </div>
          ))}
        </div>
      </div>
      <div className={clsx(titleBarStyles.col, { focused })}>
        <div className={clsx(titleBarStyles.col, { focused })}>
          <button className={clsx(titleBarStyles.block, { focused })} onClick={closeWindow}>
            <div className={clsx(titleBarStyles.block, "w3", "h3", { focused })} />
          </button>
        </div>
        <div className={clsx(titleBarStyles.col, { focused })}>
          <button className={clsx(titleBarStyles.block, { focused })} onClick={toggleFullscreen}>
            <div className={clsx(titleBarStyles.block, "w8", "h8", "inverted", { focused })} />
          </button>
        </div>
      </div>
    </div>
  );
};
