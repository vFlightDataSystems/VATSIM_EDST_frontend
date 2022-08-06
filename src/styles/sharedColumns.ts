import styled from "styled-components";
import { edstFontBlue } from "./colors";

export type ColProps = {
  hover?: boolean;
  disabled?: boolean;
  color?: string;
  width?: number;
  selected?: boolean;
  hidden?: boolean;
  visibilityHidden?: boolean;
};

export const Col = styled.div.attrs((props: ColProps) => ({
  // eslint-disable-next-line no-nested-ternary
  width: props.visibilityHidden || props.hidden ? "30px" : props.width ? `${props.width}px` : "auto",
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
  ${props => props.hover && { "&:hover": { border: "1px solid #F0F0F0" } }};
`;
export const FidCol = styled(Col)`
  justify-content: left;
  width: 130px;
  padding: 0 2px;
`;
export const SpecialBox = styled(Col)`
  margin: 0 1px;
  width: 1ch;
  &:hover {
    border: 1px solid #f0f0f0;
  }
`;
export const HotBox = styled(SpecialBox)`
  border-top: 1px solid #575757;
  border-left: 1px solid #575757;
  border-bottom: 1px solid #414141;
  border-right: 1px solid #414141;
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

    &:hover {
      border: 1px solid #f0f0f0;
    }
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
  width: 9ch;
  margin-right: 8px;
`;
export const AltColDiv = styled(Col)<{ headerMouseDown?: boolean }>`
  border: 1px solid transparent;
  ${props => props.headerMouseDown && { border: "1px solid #AD3636" }};
  &:hover {
    border: 1px solid #f0f0f0;
  }
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
