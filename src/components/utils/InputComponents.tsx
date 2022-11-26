import React from "react";
import inputStyles from "css/input.module.scss";

type InputProps = {
  title?: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  rows?: number;
};

export const AddFindInput = ({ title, ...props }: InputProps) => {
  return (
    <div className={inputStyles.addFindContainer} title={title}>
      <input spellCheck={false} {...props} />
    </div>
  );
};
