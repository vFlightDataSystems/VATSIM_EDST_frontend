import '../../css/resources/button.scss';
import {EdstTooltip} from './EdstTooltip';

export function EdstButton({onMouseDown, ...props}) {
    return (<div className={`edst-outer-button ${props.className ?? ''}`} disabled={props.disabled}>
    <div className={`edst-inner-button ${props.selected ? 'selected' : ''}`}
         disabled={props.disabled}
         id={props.id}
         onMouseDown={onMouseDown}
    >
      <EdstTooltip {...props}/>
    </div>
  </div>);
}

export function EdstWindowHeaderButton({className, ...props}) {
    return (<EdstButton {...props} className={`${className} window-header-button`}/>);
}
