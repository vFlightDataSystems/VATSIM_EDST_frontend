import React from "react";

type FloatingWindowOptionsProps = {
  pos: { x: number, y: number },
  closeOptions?: () => void,
  header?: string,
  options?: string[],
  selectedOptions?: string[],
  handleOptionClick?: (option?: string) => void
}

export const FloatingWindowOptions: React.FC<FloatingWindowOptionsProps> = ({pos, ...props}) => {
  return <div className="floating-window-options" style={{left: pos.x + "px", top: pos.y + "px"}}>
    {props.header && <div className="floating-window-header no-select">
      <div className="floating-window-header-middle">
        {props.header}
      </div>
      <div className="floating-window-header-right" onMouseDown={props.closeOptions}>
        X
      </div>
    </div>}
    {props.options?.map((option) =>
      <div className={`floating-window-option ${(!props.selectedOptions?.includes(option) ?? false) ? 'unselected' : ''}`}
           key={`sigmet-option-${option}`}
           onMouseDown={() => props.handleOptionClick?.(option)}
      >
        {option}
      </div>)}
  </div>;
};