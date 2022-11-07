import type { CSSProperties } from "styled-components";
import styled from "styled-components";
import { EdstInput, OptionsBodyRow } from "styles/optionMenuStyles";
import { borderHover } from "styles/styles";
import { EdstTooltip } from "components/utils/EdstTooltip";

export const EqpRow = styled(OptionsBodyRow)`
  display: flex;
  align-items: center;
`;
export const EqpInputRow = styled(EqpRow)`
  margin: 6px 20px;
`;
export const EqpContentRow = styled(EqpRow)`
  float: left;
  display: inline-flex;
  text-indent: 6px;
`;

export const EqpInputContainer = styled(EdstTooltip)`
  display: flex;
  flex-grow: 1;
  border: 1px solid transparent;
  max-width: 50px;
`;
export const EqpInputContainer60 = styled(EqpInputContainer)`
  max-width: 60%;
`;
export const EqpInput = styled(EdstInput)`
  cursor: default;
  font-size: 16px;
  outline: none;
  flex: 1;
  color: ${(props) => props.theme.colors.grey};
  background-color: #000000;
  width: calc(100% - 7px);
  display: flex;
  overflow: hidden;
  resize: none;
`;

type EqpColProps = { width?: CSSProperties["width"] };
export const EqpCol = styled.div<EqpColProps>`
  display: flex;
  flex-flow: column;
  margin: 0 4px;
  width: ${(props) => props.width ?? "auto"};
  min-width: 18%;
  height: 100%;
`;
export const EqpColTitle = styled(EqpCol)`
  text-indent: 0;
  margin: 5px auto 5px 10px;
  border-bottom: 1px solid #adadad;
  text-align: center;
`;

export const EqpContentCol = styled(EdstTooltip)`
  justify-content: left;
  align-items: center;
  display: inline-flex;
  flex-grow: 0;
  border: 1px solid transparent;
  padding: 1px 6px;
  text-indent: 0;

  ${borderHover}
`;
