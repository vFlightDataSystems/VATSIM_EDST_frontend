import styled from "styled-components";
import { EdstInput, OptionsBodyRow } from "../../../styles/optionMenuStyles";
import { edstFontGrey } from "../../../styles/colors";

export const EqpRow = styled(OptionsBodyRow)`
  display: flex;
  align-items: center;
`;
export const EqpInputRow = styled(EqpRow)`
  margin: 6px 20px;
`;
export const EqpContentRow = styled(EqpRow)`
  align-items: center;
  float: left;
  display: inline-flex;
  text-indent: 6px;
`;

export const EqpInputContainer = styled.div<{ width?: string }>`
  display: flex;
  flex-grow: 1;
  //max-width: 57%;
  border: 1px solid transparent;
  max-width: ${props => props.width ?? "50px"};
`;
export const EqpInputContainer60 = styled(EqpInputContainer)`
  max-width: 60%;
`;
export const EqpInput = styled(EdstInput)`
  cursor: default;
  font-size: 16px;
  outline: none;
  flex: 1;
  color: ${edstFontGrey};
  background-color: #000000;
  width: calc(100% - 7px);
  display: flex;
  overflow: hidden;
  resize: none;
`;

export const EqpCol = styled.div`
  display: flex;
  flex-flow: column;
  margin: 0 4px;
  width: auto;
  min-width: 15%;
  height: 100%;
`;
export const EqpColRow = styled(EqpRow)`
  align-items: center;
  float: left;
  display: inline-flex;
  text-indent: 6px;
`;
export const EqpColTitle = styled(EqpCol)`
  text-indent: 0;
  margin: 5px auto 5px 10px;
  border-bottom: 1px solid #adadad;
  text-align: center;
`;

export const EqpContentCol = styled.div`
  justify-content: left;
  align-items: center;
  display: inline-flex;
  flex-grow: 0;
  border: 1px solid transparent;
  padding: 1px 6px;
  text-indent: 0;

  &:hover {
    border: 1px solid #adadad;
  }
`;
