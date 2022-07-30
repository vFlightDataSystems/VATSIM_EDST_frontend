import styled from "styled-components";
import { edstFontBlue } from "../../../styles/colors";
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
export const RadioCol = styled(DepCol1)<{ checked?: boolean; header?: boolean }>`
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
    props.header && {
      "font-size": "10px",
      margin: "0 2px",
      width: "10px",
      "pointer-events": "none"
    }};

  ${props =>
    props.checked && {
      color: "#FFFFFF",
      "font-size": "10px"
    }};
`;
export const SpecialBox = styled(Col)`
  margin: 0 2px;
  width: 8px;

  &:hover {
    border: 1px solid #f0f0f0;
  }
`;
export const AltCol = styled(Col)<{ headerCol?: boolean }>`
  display: flex;
  justify-content: left;
  width: 70px;
  margin-right: 8px;

  ${props =>
    props.headerCol && {
      width: "55px",
      "margin-right": "19px",
      "padding-left": "4px"
    }}
`;
export const AltColDiv = styled(Col)`
  border: 1px solid transparent;
  &:hover {
    border: 1px solid #f0f0f0;
  }
`;
