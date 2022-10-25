import styled, { css, CSSProperties } from "styled-components";

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

export const createBorder = (
  width: CSSProperties["width"],
  topLeftColor: CSSProperties["borderColor"],
  bottomRightColor: CSSProperties["borderColor"]
) => css`
  border-bottom: ${width} solid ${bottomRightColor};
  border-right: ${width} solid ${bottomRightColor};
  border-top: ${width} solid ${topLeftColor};
  border-left: ${width} solid ${topLeftColor};
`;

export const buttonBorder2px = createBorder("2px", "#888888", "#575757");

export const buttonBorderInverted2px = createBorder("2px", "#575757", "#888888");

export const BodyRowContainerDiv = styled.div`
  margin: 3px 0;
  flex-flow: wrap;
  border: none;
`;

export const RowSeparator = styled.div`
  width: 100%;
  height: 1px;
  border-bottom: 1px solid #252525;
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
type InnerRowProps = { highlight?: boolean };
export const InnerRow = styled.div<InnerRowProps>`
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
export const InnerRow2 = styled(InnerRow)<Pick<CSSProperties, "minWidth">>`
  min-height: 1em;
  min-width: ${props => props.minWidth};
`;
export const FreeTextRow = styled(BodyRowDiv)<Pick<CSSProperties, "marginLeft">>`
  margin-left: ${props => props.marginLeft};
  padding: 0;
  width: 100%;
  display: flex;
  align-items: center;
  height: 1em;
  border: 1px solid transparent;

  input {
    width: 100%;
    background-color: transparent;
    font-size: ${props => props.theme.fontProps.fontSize};
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
