import React from "react";
import styled from "styled-components";
import { EdstInput } from "styles/optionMenuStyles";
import { EdstTooltip } from "components/utils/EdstTooltip";

type InputProps = {
  title?: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  rows?: number;
};

const AddFindContainer = styled(EdstTooltip)`
  border: 1px solid #000000;
  display: inline-flex;
  margin: 1px 20px 1px 14px;
  width: 10ch;
`;

export const AddFindInput = ({ title, ...props }: InputProps) => {
  return (
    <AddFindContainer title={title}>
      <EdstInput {...props} />
    </AddFindContainer>
  );
};

export const InputContainer = styled.div`
  display: inline-flex;
  border: 1px solid transparent;
  width: 5ch;
`;
