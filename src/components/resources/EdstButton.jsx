import React from "react";
import '../../css/resources/button.scss';

export function EdstButton(props) {
  return (<div
    className={`edst-outer-button ${props.classes ?? ''}`}
    disabled={props.disabled}
  >
    <div className={`edst-inner-button ${props.selected ? 'selected' : ''}`}
         disabled={props.disabled}
         id={props.id}
         onMouseDown={props.onMouseDown}
    >
      {props.content}
    </div>
  </div>);
}

export function EdstHeaderButton(props) {
  return <EdstButton {...props} classes="window-header-button"/>
}