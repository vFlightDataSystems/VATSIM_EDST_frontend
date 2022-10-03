import styled, { css } from "styled-components";
import { Col, ColProps, SpecialBox } from "../../../styles/sharedColumns";
import { colors } from "../../../edstTheme";

export const AclCol1 = styled(Col)<{ border?: boolean }>`
  margin: 0 2px;
  width: 14px;
  ${props =>
    props.border && {
      border: "1px solid #ADADAD"
    }};
`;
type RadioColProps = { green?: boolean; header?: boolean; keep?: boolean };
export const RadioCol = styled(AclCol1)<RadioColProps>`
  color: ${props => (props.green ? props.theme.colors.green : props.theme.colors.grey)};
  width: 10px;
  &:hover {
    border: 1px solid ${props => (props.green ? props.theme.colors.green : "#F0F0F0")};
  }
  ${props =>
    props.header &&
    css`
      font-size: 14px;
      margin: 0 2px;
      width: 10px;
      pointer-events: none;
    `};
  ${props => props.keep && { "background-color": "#414141" }};
`;
export const CoralBox = styled(SpecialBox)`
  margin: 0 2px;
  width: 8px;
  height: 100%;
  border: 1px solid #d698a5;
  pointer-events: none;
`;
export const RemarksBox = styled(SpecialBox)<{ unchecked?: boolean }>(props => {
  return (
    props.unchecked && {
      color: colors.yellow,
      border: `1px solid ${colors.yellow}`
    }
  );
});
export const VoiceTypeSpan = styled.span`
  color: #989898;
`;
export const PointOutCol = styled(Col)`
  width: 30px;
  justify-content: left;
`;
const HdgSpdCol = styled(Col).attrs((props: ColProps) => ({
  width: props.visibilityHidden || props.hidden ? "2ch" : "4ch"
}))<{ scratchpad?: boolean }>`
  ${props => props.scratchpad && { color: colors.yellow }}
  ${props =>
    props.selected &&
    css`
      color: #000000;
      background-color: ${props.scratchpad ? colors.yellow : "#ADADAD"};
    `}};
`;
export const HdgCol = styled(HdgSpdCol)`
  justify-content: right;
  padding-right: 1px;
`;
export const HdgSpdSlashCol = styled(Col)`
  width: 1ch;
  margin: 0;
`;
export const SpdCol = styled(HdgSpdCol)`
  justify-content: left;
  padding-left: 1px;
`;
