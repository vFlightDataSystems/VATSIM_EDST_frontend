import styled, { css } from "styled-components";
import { Col, FidCol } from "../../../styles/sharedColumns";
import { borderHover } from "../../../styles/styles";

export const DepFidCol = styled(FidCol)`
  justify-content: left;
  margin-right: 2ch;
`;
export const DepCol1 = styled(Col)<{ border?: boolean }>`
  margin: 0 2px;
  width: 1ch;
  ${props =>
    props.border && {
      outline: "1px solid #ADADAD"
    }};
`;
export const DepCol2 = styled(Col)`
  width: 6ch;
`;
export const RadioCol = styled(DepCol1)<{ checked?: boolean; header?: boolean; keep?: boolean }>`
  border-top: 1px solid #575757;
  border-left: 1px solid #575757;
  border-bottom: 1px solid #414141;
  border-right: 1px solid #414141;

  ${borderHover};

  ${props => props.disabled && { "border-color": "transparent" }};
  ${props =>
    props.header &&
    css`
      margin: 0 2px;
      width: 1ch;
      pointer-events: none;
    `};

  ${props =>
    props.checked &&
    css`
      color: #adadad;
    `};
  ${props => props.keep && { "background-color": "#414141" }};
`;
