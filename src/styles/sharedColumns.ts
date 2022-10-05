import styled from "styled-components";
import { borderHover, createBorder } from "./styles";

const hotboxBorder = createBorder("1px", "#575757", "#414141");

export type ColProps = {
  hover?: boolean;
  disabled?: boolean;
  color?: string;
  selected?: boolean;
  hidden?: boolean;
  visibilityHidden?: boolean;
};

export const Col = styled.div.attrs((props: ColProps) => ({
  width: props.visibilityHidden || props.hidden ? "30px" : "auto",
  visibility: props.visibilityHidden ? "hidden" : "initial"
}))<ColProps>`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  height: 18px;
  border: 1px solid transparent;

  &[disabled] {
    pointer-events: none;
  }

  width: ${props => props.width};
  visibility: ${props => props.visibility};
  ${props => props.color && { color: props.color }};
  ${props =>
    props.selected && {
      "background-color": "#ADADAD",
      color: "#000000"
    }};
  ${props => props.hover && borderHover};
`;
export const FidCol = styled(Col)`
  justify-content: left;
  width: 14ch;
  padding: 0 2px;
`;
export const SpecialBox = styled(Col)`
  margin: 0 1px;
  width: 1ch;
  ${borderHover}
`;
export const HotBox = styled(SpecialBox)`
  ${hotboxBorder}
`;
export const AircraftTypeCol = styled(Col).attrs((props: ColProps) => ({
  width: props.visibilityHidden || props.hidden ? "3ch" : "100px"
}))`
  min-width: 30px;
  justify-content: left;
  width: ${props => props.width};
  margin-right: 0;
  margin-left: 10px;
  padding-left: 4px;
  div {
    border: 1px solid transparent;
    align-items: center;
    min-width: 20px;
    display: flex;
    padding: 0 2px;

    ${borderHover}
  }
`;
export const CodeCol = styled(Col).attrs((props: ColProps) => ({
  width: props.visibilityHidden || props.hidden ? "2ch" : "6ch"
}))`
  padding: 0 2px;
  justify-content: left;
  width: ${props => props.width};
  margin-left: 0;
  margin-right: 10px;
`;
export const AltCol = styled(Col)<{ headerCol?: boolean }>`
  display: flex;
  justify-content: left;
  padding: 0 2px;
  width: 7ch;
  margin-right: 8px;
`;
export const AltColDiv = styled(Col)<{ headerMouseDown?: boolean }>`
  border: 1px solid transparent;
  ${props => props.headerMouseDown && { border: "1px solid #AD3636" }};
  ${borderHover}
`;
type RouteColProps = { padding?: string };
export const RouteCol = styled(Col).attrs((props: RouteColProps) => ({
  padding: props.padding ?? "0 2px 0 0"
}))<RouteColProps>`
  height: calc(100% - 4px);
  white-space: nowrap;
  justify-content: left;
  border: 1px solid transparent;
  margin-left: 4px;
  padding: ${props => props.padding};
`;
type RouteSpanProps = { padding?: string };
export const RouteSpan = styled(RouteCol).attrs((props: RouteSpanProps) => ({
  padding: props.padding ?? "0"
}))<RouteSpanProps>`
  max-width: 50vw;
  pointer-events: none;
  border: none;
  margin: 0;
  border: transparent;
  padding: ${props => props.padding};
  overflow: hidden;
  text-overflow: ellipsis;
`;
export const EmbeddedRouteTextSpan = styled(RouteSpan)`
  color: ${props => props.theme.colors.blue};
  ${props =>
    props.selected && {
      "background-color": props.theme.colors.blue,
      color: "#000000"
    }}
`;
export const RouteDepAirportSpan = styled(RouteSpan)<{ amendmentPending?: boolean }>`
  ${props =>
    props.amendmentPending && {
      color: props.selected ? "#000000" : props.theme.colors.blue,
      "background-color": props.selected ? props.theme.colors.blue : "#transparent"
    }}
  }
`;
