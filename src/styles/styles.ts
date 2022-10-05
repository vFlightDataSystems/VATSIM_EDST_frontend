import styled, { css } from "styled-components";

export const borderHover = css`
  &:hover {
    border: 1px solid #f0f0f0;
  }
`;

export const outlineHover = css`
  &:hover {
    outline: 1px solid #f0f0f0;
  }
`;

export const createBorder = (width: string, topLeftColor: string, bottomRightColor: string) => css`
  border-bottom: ${width} solid ${bottomRightColor};
  border-right: ${width} solid ${bottomRightColor};
  border-top: ${width} solid ${topLeftColor};
  border-left: ${width} solid ${topLeftColor};
`;

export const buttonBorder2px = createBorder("2px", "#888888", "#575757");

export const buttonBorderInverted2px = createBorder("2px", "#575757", "#888888");

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

type BodyRowDivProps = { pendingRemoval?: boolean; separator?: boolean };
export const BodyRowDiv = styled.div<BodyRowDivProps>`
  display: flex;
  align-items: center;
  min-height: 2px;
  padding: 0 10px;
  ${props => props.pendingRemoval && { color: props.theme.colors.stripPendingRemovalColor }};
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
      outline: `1px solid ${props.theme.colors.stripHighlightColor}`,
      "border-bottom": `1px solid ${props.theme.colors.stripHighlightColor}`,
      "background-color": props.theme.colors.stripHighlightColor
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
  height: 1em;
  border: 1px solid transparent;

  input {
    width: 100%;
    background-color: transparent;
    font-size: ${props => props.theme.fontProperties.fontSize};
    outline: none;
    border: none;
    color: ${props => props.theme.colors.grey};
    caret: #ffffff;
    text-transform: uppercase;
  }
  ${borderHover}
`;

export const BodyRowHeaderDiv = styled(BodyRowDiv)`
  margin-bottom: 2px;
  min-height: 24px;
  max-height: 24px;
  border-bottom: 1px solid #adadad;
`;
