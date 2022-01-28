import '../../css/resources/button.scss';
import {EdstTooltip} from './EdstTooltip';
import {FunctionComponent, MouseEventHandler} from "react";

interface EdstButtonProps {
  disabled?: boolean;
  selected?: boolean;
  className?: string;
  content?: string;
  id?: string;
  title?: string;
  onMouseDown?: MouseEventHandler<any>;
}

export const EdstButton: FunctionComponent<EdstButtonProps> = ({onMouseDown, className, id, ...props}) => {
  // @ts-ignore
  return (<div className={`edst-outer-button ${className ?? ''}`} disabled={props.disabled}
               id={id}
               onMouseDownCapture={onMouseDown}>
    <div className={`edst-inner-button ${props.selected ? 'selected' : ''}`}
      // @ts-ignore
         disabled={props.disabled}
    >
      <EdstTooltip {...props}/>
    </div>
  </div>);
}

export const EdstWindowHeaderButton: FunctionComponent<any> = ({className, ...props}) => {
  return (<EdstButton {...props} className={`${className ?? ''} window-header-button`}/>);
}
