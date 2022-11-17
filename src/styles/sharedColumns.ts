import type { CSSProperties } from "styled-components";
import styled, { css } from "styled-components";
import { borderHover, createBorder } from "styles/styles";
import { EdstTooltip } from "components/utils/EdstTooltip";

const hotboxBorder = createBorder("1px", "#575757", "#414141");

export type ColProps = {
  hover?: boolean;
  disabled?: boolean;
  color?: CSSProperties["color"];
  selected?: boolean;
  hidden?: boolean;
  visibilityHidden?: boolean;
};

export const Col = styled(EdstTooltip)<ColProps>`
  ${(props) => css`
    width: ${props.visibilityHidden || props.hidden ? "2ch" : "auto"};
    visibility: ${props.visibilityHidden ? "hidden" : "initial"};
    ${props.color && { color: props.color }};
    ${props.selected &&
    css`
      background-color: ${props.theme.colors.grey};
      color: #000000;
    `};
    ${props.hover && borderHover};
  `}
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  height: 1em;
  border: 1px solid transparent;

  &[disabled] {
    pointer-events: none;
  }
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
  width: ${(props) => (props.visibilityHidden || props.hidden ? "2ch" : "7ch")};
  margin-right: 0;
  padding-left: 4px;
`;
export const CodeCol = styled(Col)<ColProps>`
  padding: 0 2px;
  justify-content: left;
  width: ${(props) => (props.visibilityHidden || props.hidden ? "2ch" : "5ch")};
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
  ${(props) => props.headerMouseDown && { border: "1px solid #AD3636" }};
  ${borderHover}
`;
type RouteColProps = { padding?: CSSProperties["padding"] };
export const RouteCol = styled(Col)<RouteColProps>`
  height: calc(100% - 4px);
  white-space: nowrap;
  justify-content: left;
  border: 1px solid transparent;
  margin-left: 4px;
  padding: ${(props) => props.padding ?? "0 2px 0 0"};
`;
type RouteContentProps = { padding?: CSSProperties["padding"] };
export const RouteContent = styled(Col)<RouteContentProps>`
  justify-content: left;
  max-width: 50vw;
  pointer-events: none;
  white-space: nowrap;
  border: none;
  margin: 0;
  border: transparent;
  padding: ${(props) => props.padding ?? "0"};
  overflow: hidden;
  text-overflow: ellipsis;
`;
export const EmbeddedRouteText = styled(RouteContent)`
  color: ${(props) => props.theme.colors.blue};
  ${(props) =>
    props.selected && {
      "background-color": props.theme.colors.blue,
      color: "#000000",
    }}
`;
export const RouteDepAirport = styled(RouteContent)<{ amendmentPending?: boolean }>`
  ${(props) =>
    props.amendmentPending && {
      color: props.selected ? "#000000" : props.theme.colors.blue,
      "background-color": props.selected ? props.theme.colors.blue : "transparent",
    }}
  }
`;
