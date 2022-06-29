import styled from "styled-components";
import { edstFontBlue, edstFontGreen, edstFontYellow } from "../../../styles/colors";

const Col = styled.div<{
  hover?: boolean;
  disabled?: boolean;
  color?: string;
  width?: number;
  selected?: boolean;
  hidden?: boolean;
  contentHidden?: boolean;
}>`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  height: 18px;
  border: 1px solid transparent;

  &[disabled] {
    pointer-events: none;
    color: #000000;
  }

  width: ${props => (props.width ? `${props.width}px` : "auto")};
  ${props => props.color && { color: props.color }};
  ${props =>
    props.selected && {
      "background-color": "#ADADAD",
      color: "#000000"
    }};
  ${props => props.hover && { "&:hover": { border: "1px solid #F0F0F0" } }};
  ${props => props.contentHidden && { visibility: "hidden" }};
  ${props => (props.contentHidden || props.hidden) && { width: "30px" }};
`;
export const FidCol = styled(Col)`
  justify-content: left;
  width: 130px;
  padding: 0 2px;
`;
export const AclCol1 = styled(Col)<{ border?: boolean }>`
  margin: 0 2px;
  width: 14px;
  ${props =>
    props.border && {
      outline: "1px solid #ADADAD"
    }};
`;
export const RadioCol = styled(AclCol1)<{ hoverGreen?: boolean; header?: boolean }>`
  width: 10px;

  &:hover {
    border: 1px solid ${props => (props.hoverGreen ? edstFontGreen : "#F0F0F0")};
  }

  ${props =>
    props.header && {
      "font-size": "14px",
      margin: "0 2px",
      width: "10px",
      "pointer-events": "none"
    }};
`;
export const SpecialBox = styled(Col)`
  margin: 0 2px;
  width: 8px;

  &:hover {
    border: 1px solid #f0f0f0;
  }

  ${props =>
    props.selected && {
      "background-color": "#ADADAD",
      color: "#000000"
    }};
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
export const HotBox = styled(SpecialBox)`
  border-top: 1px solid #575757;
  border-left: 1px solid #575757;
  border-bottom: 1px solid #414141;
  border-right: 1px solid #414141;
`;
export const VoiceTypeSpan = styled.span`
  color: #989898;
`;
export const PointOutCol = styled(Col)`
  width: 30px;
  justify-content: left;
`;
export const AircraftTypeCol = styled(Col)`
  min-width: 30px;
  justify-content: left;
  width: 100px;
  margin-right: 0;
  margin-left: 10px;
  padding-left: 4px;

  div {
    border: 1px solid transparent;
    align-items: center;
    min-width: 20px;
    display: flex;
    padding: 0 2px;

    &:hover {
      border: 1px solid #f0f0f0;
    }
  }

  ${props => props.contentHidden && { visibility: "hidden" }};
  ${props => (props.contentHidden || props.hidden) && { width: "30px" }};
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
export const AltColDiv = styled(Col)<{ headerMouseDown?: boolean }>`
  border: 1px solid transparent;

  ${props => props.headerMouseDown && { border: "1px solid #AD3636" }},
  &:hover {
    border: 1px solid #f0f0f0;
  }
`;
export const CodeCol = styled(Col)`
  padding: 0 2px;
  justify-content: left;
  width: 40px;
  margin-left: 0;
  margin-right: 10px;
  ${props => props.contentHidden && { visibility: "hidden" }};
  ${props => (props.contentHidden || props.hidden) && { width: "20px" }};
`;
export const RouteCol = styled(Col)`
  height: calc(100% - 4px);
  white-space: nowrap;
  justify-content: left;
  border: 1px solid transparent;
  margin-left: 4px;
  padding-right: 2px;
`;
export const RouteSpan = styled(RouteCol)<{ padding?: string }>`
  max-width: 50vw;
  pointer-events: none;
  border: none;
  margin: 0;
  border: transparent;
  padding: ${props => props.padding ?? "0"};
  overflow: hidden;
  text-overflow: ellipsis;
`;
export const RouteAmendmentSpan = styled(RouteSpan)`
  color: ${edstFontBlue};
  ${props =>
    props.selected && {
      "background-color": edstFontBlue,
      color: "#000000"
    }}
`;
export const RouteDepSpan = styled(RouteSpan)<{ amendmentPending?: boolean }>`
  ${props => props.amendmentPending && RouteAmendmentSpan}
`;
export const HdgCol = styled(Col)<{ scratchpad?: boolean }>`
  width: 38px;
  margin: 0;
  justify-content: right;
  padding-right: 1px;
  ${props => props.scratchpad && { color: edstFontYellow }}
  ${props =>
    props.selected && {
      color: "#000000",
      "background-color": props.scratchpad ? edstFontYellow : "#ADADAD"
    }};
  ${props => props.contentHidden && { visibility: "hidden" }};
  ${props => (props.contentHidden || props.hidden) && { width: "20px" }};
`;
export const HdgSpdSlashCol = styled(Col)`
  width: 10px;
  margin: 0;
`;
export const SpdCol = styled(Col)<{ scratchpad?: boolean }>`
  width: 38px;
  margin: 0;
  justify-content: left;
  padding-left: 1px;
  ${props => props.scratchpad && { color: edstFontYellow }}
  ${props =>
    props.selected && {
      color: "#000000",
      "background-color": props.scratchpad ? edstFontYellow : "#ADADAD"
    }};
  ${props => props.contentHidden && { visibility: "hidden" }};
  ${props => (props.contentHidden || props.hidden) && { width: "20px" }};
`;
