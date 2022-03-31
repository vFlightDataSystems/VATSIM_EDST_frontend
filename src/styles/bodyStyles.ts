import styled from "styled-components";
import {edstFontGrey} from "./colors";
import {defaultFontSize} from "./styles";


export const BodyRowContainerDiv = styled.div<{ separator?: boolean }>`
  margin: 3px 0;
  flex-flow: wrap;

  ${props => props.separator && {
    border: "none",
    "border-bottom": "1px solid #252525"
  }}
`;

export const BodyRowDiv = styled.div<{pendingRemoval?: boolean, separator?: boolean}>`
  display: flex;
  align-items: center;
  min-height: 2px;
  //flex-grow: 2;
  padding: 0 10px;
  ${props => props.pendingRemoval && {color: "#595959"}};
  ${props => props.separator && {
    height: 0,
    "border-bottom": "2px solid #AA8800"
  }};
`;
export const InnerRow = styled.div<{ highlight?: boolean }>`
  display: flex;
  align-items: center;
  min-height: 20px;
  border-bottom: 1px solid transparent;
  ${props => props.highlight && {
    outline: "1px solid #414141",
    "border-bottom": "1px solid #414141",
    "background-color": "#414141"
  }}
`;
export const InnerRow2 = styled(InnerRow)<{minWidth: number}>`
  min-height: 22px;
  min-width: ${props => props.minWidth}px;
`;
export const FreeTextRow = styled(BodyRowDiv)<{marginLeft: number}>`
  margin-left: ${props => props.marginLeft}px;
  width: 100%;
  display: flex;
  align-items: center;
  height: 18px;
  border: 1px solid transparent;

  input {
    margin-left: 2px;
    width: 100%;
    background-color: transparent;
    font-size: ${defaultFontSize};
    outline: none;
    border: none;
    color: ${edstFontGrey};
    //caret: #FFFFFF;
  }

  &:hover {
    border: 1px solid #F0F0F0;
  }
`;

export const BodyRowHeaderDiv = styled(BodyRowDiv)`
  margin-bottom: 2px;
  min-height: 24px;
  max-height: 24px;
  border-bottom: 1px solid #ADADAD;
`;