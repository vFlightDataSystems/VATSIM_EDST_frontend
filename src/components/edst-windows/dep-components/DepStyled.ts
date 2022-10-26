import styled, { css } from "styled-components";
import { Col, FidCol } from "../../../styles/sharedColumns";
import { borderHover, createBorder } from "../../../styles/styles";

export const DepFidCol = styled(FidCol)`
  justify-content: left;
  margin-right: 2ch;
`;
export const DepPTimeCol = styled(Col)`
  width: 6ch;
`;
type RadioColProps = { border?: boolean; checked?: boolean; header?: boolean; keep?: boolean };
export const RadioCol = styled(Col)<RadioColProps>`
  ${createBorder("1px", "#575757", "#414141")}

  ${borderHover};

  margin: 0 2px;
  width: 1ch;
  ${props =>
    props.border && {
      outline: "1px solid #ADADAD"
    }};

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
