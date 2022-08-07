import styled from "styled-components";
import { edstFontGrey, stripHighlightColor, stripPendingRemovalColor } from "./colors";
import { defaultFontSize } from "./styles";

type BodyRowContainerProps = { separator?: boolean };
export const BodyRowContainerDiv = styled.div<BodyRowContainerProps>`
  margin: 3px 0;
  flex-flow: wrap;
  border: none;
  ${props =>
    props.separator && {
      "border-bottom": "1px solid #252525"
    }};
`;

export const BodyRowDiv = styled.div<{ pendingRemoval?: boolean; separator?: boolean }>`
  display: flex;
  align-items: center;
  min-height: 2px;
  padding: 0 10px;
  ${props => props.pendingRemoval && { color: stripPendingRemovalColor }};
  ${props =>
    props.separator && {
      height: 0,
      "border-bottom": "2px solid #AA8800"
    }};
`;
export const InnerRow = styled.div<{ highlight?: boolean }>`
  display: flex;
  align-items: center;
  min-height: 1em;
  border-bottom: 1px solid transparent;
  ${props =>
    props.highlight && {
      outline: `1px solid ${stripHighlightColor}`,
      "border-bottom": `1px solid ${stripHighlightColor}`,
      "background-color": stripHighlightColor
    }}
`;
export const InnerRow2 = styled(InnerRow)<{ minWidth: number }>`
  min-height: 22px;
  min-width: ${props => props.minWidth}px;
`;
export const FreeTextRow = styled(BodyRowDiv)<{ marginLeft: number }>`
  margin-left: ${props => props.marginLeft}px;
  padding: 0;
  width: 100%;
  display: flex;
  align-items: center;
  height: 18px;
  border: 1px solid transparent;

  input {
    width: 100%;
    background-color: transparent;
    font-size: ${defaultFontSize};
    outline: none;
    border: none;
    color: ${edstFontGrey};
    caret: #ffffff;
    text-transform: uppercase;
  }

  &:hover {
    border: 1px solid #f0f0f0;
  }
`;

export const BodyRowHeaderDiv = styled(BodyRowDiv)`
  margin-bottom: 2px;
  min-height: 24px;
  max-height: 24px;
  border-bottom: 1px solid #adadad;
`;
