import React from "react";
import styled from "styled-components";
import { EdstTooltip } from "./resources/EdstTooltip";
import { EdstInput } from "../styles/optionMenuStyles";

type InputProps = {
  title?: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  rows?: number;
};

const AddFindContainer = styled.div`
  border: 1px solid #000000;
  display: inline-flex;
  margin: 1px 20px 1px 14px;
  width: 100px;
`;

export const AddFindInput = ({ title, ...props }: InputProps) => {
  return (
    <EdstTooltip title={title}>
      <AddFindContainer>
        <EdstInput {...props} />
      </AddFindContainer>
    </EdstTooltip>
  );
};

export const InputContainer = styled.div`
  display: inline-flex;
  border: 1px solid transparent;
  width: 60px;
`;
