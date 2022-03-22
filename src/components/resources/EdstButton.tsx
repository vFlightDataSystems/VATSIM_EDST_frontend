import '../../css/resources/button.scss';
import {EdstTooltip} from './EdstTooltip';
import React from "react";
// import styled from "styled-components";
// import {edstFontGrey} from "../../styles/colors";

// const EdstButtonDiv = styled.div`
//   display: inline-flex;
//   //height: 20px;
//   border: 1px solid #000000;
//   font-size: 16px;
//
//   &.exit-button {
//     .edst-inner-button {
//       padding: 0 6px;
//     }
//   }
//
//   &:hover {
//     border: 1px solid #FFFFFF;
//   }
//
//   &[disabled] {
//     pointer-events: none;
//     border: 1px solid #000000;
//   }
//
//   &.window-header-button {
//     font-size: 17px;
//     margin-left: 6px;
//     margin-right: 6px;
//     margin-bottom: 1px;
//   }
//
//   &.medium {
//     width: 20px;
//     height: 20px;
//   }
//
//   &.tiny {
//     width: 12px;
//     height: 12px;
//   }
//
//   .edst-inner-button {
//     display: flex;
//     flex-grow: 1;
//     justify-content: center;
//     align-items: center;
//     background-color: #000000;
//     color: ${edstFontGrey};
//     border-bottom: 2px solid #575757;
//     border-right: 2px solid #575757;
//     border-top: 2px solid #888888;
//     border-left: 2px solid #888888;
//     padding: 0 4px;
//
//     &.selected {
//       background-color: #ADADAD;
//       color: #000000;
//       border-bottom: 2px solid #888888;
//       border-right: 2px solid #888888;
//       border-top: 2px solid #575757;
//       border-left: 2px solid #575757;
//     }
//
//     &[disabled] {
//       pointer-events: none;
//       color: #ADADAD;
//     }
//   }
// `;

type EdstButtonProps = {
  disabled?: boolean,
  selected?: boolean,
  className?: string,
  content?: string,
  id?: string,
  title?: string,
  onMouseDown?: (event: React.MouseEvent) => void
}

export const EdstButton: React.FC<EdstButtonProps> = ({onMouseDown, className, id, ...props}) => {

  return (<EdstTooltip title={props.title}>
    <div className={`edst-outer-button ${className ?? ''}`} // @ts-ignore
         disabled={props.disabled}
         id={id}
         onMouseDownCapture={onMouseDown}>
      <div className={`edst-inner-button ${props.selected ? 'selected' : ''}`} // @ts-ignore
           disabled={props.disabled}
      >
        {props.content ?? props.children}
      </div>
    </div>
  </EdstTooltip>);
};

export const EdstWindowHeaderButton: React.FC<any> = ({className, ...props}) => {
  return (<EdstButton {...props} className={`${className ?? ''} window-header-button`}/>);
};
