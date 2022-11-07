import styled from "styled-components";
import { OptionsBodyRow } from "styles/optionMenuStyles";
import { borderHover } from "styles/styles";
import { EdstTooltip } from "components/utils/EdstTooltip";

export const Row = styled(OptionsBodyRow)`
  padding: 4px 0;
`;
export const Row2 = styled(OptionsBodyRow)`
  padding: 6px;
  min-height: 4px;
  display: flex;
  align-items: center;
`;
export const Row3 = styled(Row2)`
  justify-content: left;
`;
export const Col1 = styled(EdstTooltip)`
  margin-left: 0.5ch;
  margin-right: auto;
  display: flex;
  justify-content: left;
  align-items: center;
`;
export const Col2 = styled.div`
  margin-left: auto;
  margin-right: 0.5ch;
  display: flex;
  justify-content: right;
  align-items: center;
`;
export const ScrollContainer = styled.div`
  display: flex;
  flex-flow: column;
  background-color: #000000;
`;
export const ScrollRow = styled.div`
  display: flex;
  margin: 1px 6px;
  height: 1em;
  color: #adadad;
  border: 1px solid #000000;
`;
type ScrollColProps = { noHover?: boolean };
export const ScrollCol = styled.div<ScrollColProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #adadad;
  border: 1px solid transparent;
  width: 4ch;
  margin: 0 2px;

  ${borderHover};
  ${(props) => props.noHover && { "pointer-events": "none" }};
`;
export const ScrollCol2 = styled(ScrollCol)`
  width: 2ch;
  margin-right: 1ch;
  margin-left: auto;
`;
export const ScrollCol3 = styled(ScrollCol)`
  margin-left: auto;
`;
