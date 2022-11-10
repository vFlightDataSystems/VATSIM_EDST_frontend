import styled, { css } from "styled-components";
import { Col, SpecialBox } from "styles/sharedColumns";

type AclCol1Props = { border?: boolean };
export const AclCol1 = styled(Col)<AclCol1Props>`
  margin: 0 2px;
  width: 14px;
  ${(props) =>
    props.border && {
      border: "1px solid #ADADAD",
    }};
`;
type RadioColProps = { green?: boolean; header?: boolean; keep?: boolean };
export const RadioCol = styled(Col)<RadioColProps>`
  color: ${(props) => (props.green ? props.theme.colors.green : props.theme.colors.grey)};
  width: 10px;
  margin: 0 2px;
  &:hover {
    border: 1px solid ${(props) => (props.green ? props.theme.colors.green : "#F0F0F0")};
  }
  ${(props) =>
    props.header &&
    css`
      font-size: 14px;
      pointer-events: none;
    `};
  ${(props) => props.keep && { "background-color": "#414141" }};
`;
export const CoralBox = styled(SpecialBox)`
  margin: 0 2px;
  width: 8px;
  height: 100%;
  border: 1px solid #d698a5;
  pointer-events: none;
`;
type RemarksBoxProps = { unchecked?: boolean };
export const RemarksBox = styled(SpecialBox)<RemarksBoxProps>((props) => {
  return (
    props.unchecked && {
      color: props.theme.colors.yellow,
      border: `1px solid ${props.theme.colors.yellow}`,
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
type HdgSpdColProps = { scratchpad?: boolean };
const HdgSpdCol = styled(Col)<HdgSpdColProps>`
  ${(props) => props.scratchpad && { color: props.theme.colors.yellow }}
  width: ${(props) => (props.visibilityHidden || props.hidden ? "2ch" : "4ch")};
  ${(props) =>
    props.selected &&
    css`
      color: #000000;
      background-color: ${props.scratchpad ? props.theme.colors.yellow : props.theme.colors.grey};
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
