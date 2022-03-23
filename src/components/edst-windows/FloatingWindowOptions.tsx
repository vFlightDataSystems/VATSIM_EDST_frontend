import React from "react";
import {
  FloatingWindowHeaderColDiv,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";

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

    {props.header &&
        <FloatingWindowHeaderDiv>
            <FloatingWindowHeaderColDiv
                flexGrow={1}
            >
              {props.header}
            </FloatingWindowHeaderColDiv>
            <FloatingWindowHeaderColDiv width={20} onMouseDown={props.closeOptions}>
                X
            </FloatingWindowHeaderColDiv>
        </FloatingWindowHeaderDiv>}
    {props.options?.map((option) =>
      <div className={`floating-window-option ${!(props.selectedOptions?.includes(option) ?? true) ? 'unselected' : ''}`}
           key={`sigmet-option-${option}`}
           onMouseDown={() => props.handleOptionClick?.(option)}
      >
        {option}
      </div>)}
  </div>;
};