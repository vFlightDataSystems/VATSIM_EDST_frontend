import styled from "styled-components";
import { edstFontGreen, edstFontGrey, edstFontYellow } from "../../../styles/colors";
import { Col, ColProps, SpecialBox } from "../../../styles/sharedColumns";

export const AclCol1 = styled(Col)<{ border?: boolean }>`
  margin: 0 2px;
  width: 14px;
  ${props =>
    props.border && {
      border: "1px solid #ADADAD"
    }};
`;
type RadioColProps = { green?: boolean; header?: boolean; keep?: boolean };
export const RadioCol = styled(AclCol1).attrs((props: RadioColProps) => ({
  color: props.green ? edstFontGreen : edstFontGrey,
  hoverBorderColor: props.green ? edstFontGreen : "#F0F0F0"
}))<RadioColProps>`
  color: ${props => props.color};
  width: 10px;
  &:hover {
    border: 1px solid ${props => props.hoverBorderColor};
  }
  ${props =>
    props.header && {
      "font-size": "14px",
      margin: "0 2px",
      width: "10px",
      "pointer-events": "none"
    }};
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
      color: edstFontYellow,
      border: `1px solid ${edstFontYellow}`
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
export const HdgCol = styled(Col).attrs((props: ColProps) => ({
  width: props.visibilityHidden || props.hidden ? "2ch" : "4ch"
}))<{ scratchpad?: boolean }>`
  margin: 0;
  justify-content: right;
  padding-right: 1px;
  ${props => props.scratchpad && { color: edstFontYellow }}
  ${props =>
    props.selected && {
      color: "#000000",
      "background-color": props.scratchpad ? edstFontYellow : "#ADADAD"
    }};
`;
export const HdgSpdSlashCol = styled(Col)`
  width: 1ch;
  margin: 0;
`;
export const SpdCol = styled(Col).attrs((props: ColProps) => ({
  width: props.visibilityHidden || props.hidden ? "2ch" : "4ch"
}))<{ scratchpad?: boolean }>`
  margin: 0;
  justify-content: left;
  padding-left: 1px;
  ${props => props.scratchpad && { color: edstFontYellow }}
  ${props =>
    props.selected && {
      color: "#000000",
      "background-color": props.scratchpad ? edstFontYellow : "#ADADAD"
    }};
`;
