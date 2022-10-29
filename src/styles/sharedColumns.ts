import styled, { css, CSSProperties } from "styled-components";
import { borderHover, createBorder } from "./styles";

const hotboxBorder = createBorder("1px", "#575757", "#414141");

export type ColProps = {
  hover?: boolean;
  disabled?: boolean;
  color?: CSSProperties["color"];
  selected?: boolean;
  hidden?: boolean;
  visibilityHidden?: boolean;
};

export const Col = styled.div<ColProps>`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  height: 1em;
  border: 1px solid transparent;

  &[disabled] {
    pointer-events: none;
  }

  width: ${props => (props.visibilityHidden || props.hidden ? "2ch" : "auto")};
  visibility: ${props => (props.visibilityHidden ? "hidden" : "initial")};
  ${props => props.color && { color: props.color }};
  ${props =>
    props.selected &&
    css`
      background-color: ${props.theme.colors.grey};
      color: #000000;
    `};
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
export const AircraftTypeCol = styled(Col)<ColProps>`
  min-width: 2ch;
  justify-content: left;
  width: ${props => (props.visibilityHidden || props.hidden ? "2ch" : "7ch")};
  margin-right: 0;
  padding-left: 4px;
  div {
    border: 1px solid transparent;
    align-items: center;
    min-width: 2ch;
    display: flex;
    padding: 0 2px;

    ${borderHover}
  }
`;
export const CodeCol = styled(Col)<ColProps>`
  padding: 0 2px;
  justify-content: left;
  width: ${props => (props.visibilityHidden || props.hidden ? "2ch" : "5ch")};
`;
type AltColProps = { headerCol?: boolean };
export const AltCol = styled(Col)<AltColProps>`
  display: flex;
  justify-content: left;
  padding: 0 2px;
  width: 7ch;
  margin-right: 8px;
`;
type AltColDivProps = { headerMouseDown?: boolean };
export const AltColDiv = styled(Col)<AltColDivProps>`
  border: 1px solid transparent;
  ${props => props.headerMouseDown && { border: "1px solid #AD3636" }};
  ${borderHover}
`;
type RouteColProps = { padding?: CSSProperties["padding"] };
export const RouteCol = styled(Col)<RouteColProps>`
  height: calc(100% - 4px);
  white-space: nowrap;
  justify-content: left;
  border: 1px solid transparent;
  margin-left: 4px;
  padding: ${props => props.padding ?? "0 2px 0 0"};
`;
type RouteSpanProps = { padding?: CSSProperties["padding"] };
export const RouteSpan = styled(RouteCol)<RouteSpanProps>`
  max-width: 50vw;
  pointer-events: none;
  border: none;
  margin: 0;
  border: transparent;
  padding: ${props => props.padding ?? 0};
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
