import styled from "styled-components";
import { SpecialBox } from "../components/edst-windows/acl-components/AclStyled";
import { edstFontBlue } from "./colors";

type ColProps = {
  hover?: boolean;
  disabled?: boolean;
  color?: string;
  width?: number;
  selected?: boolean;
  hidden?: boolean;
  contentHidden?: boolean;
};

export const Col = styled.div.attrs((props: ColProps) => ({
  // eslint-disable-next-line no-nested-ternary
  width: props.contentHidden || props.hidden ? "30px" : props.width ? `${props.width}px` : "auto"
}))<ColProps>`
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

  width: ${props => props.width};
  ${props => props.color && { color: props.color }};
  ${props =>
    props.selected && {
      "background-color": "#ADADAD",
      color: "#000000"
    }};
  ${props => props.hover && { "&:hover": { border: "1px solid #F0F0F0" } }};
  ${props => props.contentHidden && { visibility: "hidden" }};
`;
export const FidCol = styled(Col)`
  justify-content: left;
  width: 130px;
  padding: 0 2px;
`;
export const HotBox = styled(SpecialBox)`
  border-top: 1px solid #575757;
  border-left: 1px solid #575757;
  border-bottom: 1px solid #414141;
  border-right: 1px solid #414141;
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
export const EmbeddedRouteTextSpan = styled(RouteSpan)`
  color: ${edstFontBlue};
  ${props =>
    props.selected && {
      "background-color": edstFontBlue,
      color: "#000000"
    }}
`;
export const RouteDepAirportSpan = styled(RouteSpan)<{ amendmentPending?: boolean }>`
  ${props =>
    props.amendmentPending && {
      color: props.selected ? "#000000" : edstFontBlue,
      "background-color": props.selected ? edstFontBlue : "#000000"
    }}
  }
`;
