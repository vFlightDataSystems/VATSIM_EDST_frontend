import styled from "styled-components";
import {OptionsBodyRow} from "../../../styles/optionMenuStyles";

export const Row = styled(OptionsBodyRow)`padding: 4px 0`;
export const Row2 = styled(OptionsBodyRow)`
  padding: 6px;
  min-height: 4px;
  display: flex;
  align-items: center;
`;
export const Row3 = styled(Row2)`justify-content: left`;
export const Col1 = styled.div`
  margin-right: auto;
  display: flex;
  justify-content: left;
  align-items: center;
`;
export const Col2 = styled.div`
  margin-left: auto;
  margin-right: 14px;
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
  height: 20px;
  color: #ADADAD;
  border: 1px solid #000000;
`;
export const ScrollCol = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ADADAD;
  border: 1px solid transparent;
  width: 42px;

  &:hover {
    border: 1px solid #F0F0F0;
  }
`;
export const ScrollCol2 = styled(ScrollCol)`
  width: 30px;
  margin-left: 15px;
`;
export const ScrollCol3 = styled(ScrollCol)`
  width: 30px;
  margin-left: 30px;
`;