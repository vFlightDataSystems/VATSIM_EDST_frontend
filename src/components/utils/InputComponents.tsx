import React from "react";
import styled from "styled-components";
import { EdstInput } from "styles/optionMenuStyles";
import { EdstTooltip } from "./EdstTooltip";

type InputProps = {
  title?: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  rows?: number;
};

const AddFindContainer = styled.div`
  border: 1px solid #000000;
  display: inline-flex;
  margin: 1px 20px 1px 14px;
  width: 10ch;
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
  width: 5ch;
`;
