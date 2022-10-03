import styled from "styled-components";
import { OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "./optionMenuStyles";
import { borderHover } from "./styles";

export const SortDiv = styled(OptionsMenu)<{ width: number }>`
  width: ${props => props.width}px;
`;
export const SortHeader = styled(OptionsMenuHeader)``;
export const SortBody = styled(OptionsBody)`
  padding: 4px 0;
`;

export const SectorRow = styled(OptionsBodyRow)`
  padding-bottom: 4px;
  margin-bottom: 20px;
  border-bottom: 1px solid #adadad;
`;

export const SortCol = styled(OptionsBodyCol)`
  //height: 20px;
  padding: 0 6px;
  ${borderHover}
`;
