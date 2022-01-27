import '../../css/resources/button.scss';
import {EdstTooltip} from './EdstTooltip';
import {EventHandler, FunctionComponent} from "react";

interface EdstButtonProps {
    disabled?: boolean;
    selected?: boolean;
    className?: string;
    content?: string;
    id?: string;
    title?: string;
    onMouseDown?: EventHandler<any>;
    props?: any;
}

export const EdstButton: FunctionComponent<EdstButtonProps> = ({onMouseDown, ...props}) => {
    // @ts-ignore
    return (<div className={`edst-outer-button ${props.className ?? ''}`} disabled={props.disabled}>
        <div className={`edst-inner-button ${props.selected ? 'selected' : ''}`}
            // @ts-ignore
             disabled={props.disabled}
             id={props.id}
             onMouseDown={onMouseDown}
        >
            <EdstTooltip {... props}/>
        </div>
    </div>);
}

export const EdstWindowHeaderButton: FunctionComponent<EdstButtonProps> = ({className, ...props}) => {
    return (<EdstButton {... props} className={`${className} window-header-button`}/>);
}
