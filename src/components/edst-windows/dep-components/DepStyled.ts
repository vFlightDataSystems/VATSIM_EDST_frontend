import styled, { css } from "styled-components";
import { Col, FidCol } from "../../../styles/sharedColumns";

export const DepFidCol = styled(FidCol)`
  justify-content: left;
  width: 130px;
  padding: 0 2px;
  margin-right: 30px;
`;
export const DepCol1 = styled(Col)<{ border?: boolean }>`
  margin: 0 2px;
  width: 14px;
  ${props =>
    props.border && {
      outline: "1px solid #ADADAD"
    }};
`;
export const DepCol2 = styled(Col)`
  width: 55px;
`;
export const RadioCol = styled(DepCol1)<{ checked?: boolean; header?: boolean; keep?: boolean }>`
  width: 10px;
  border-top: 1px solid #575757;
  border-left: 1px solid #575757;
  border-bottom: 1px solid #414141;
  border-right: 1px solid #414141;

  &:hover {
    border: 1px solid #f0f0f0;
  }

  ${props => props.disabled && { "border-color": "transparent" }};
  ${props =>
    props.header &&
    css`
      font-size: 10px;
      margin: 0 2px;
      width: 10px;
      pointer-events: none;
    `};

  ${props =>
    props.checked &&
    css`
      color: #ffffff;
      font-size: 10px;
    `};
  ${props => props.keep && { "background-color": "#414141" }};
`;
