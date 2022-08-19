import React from "react";
import { EdstButton } from "./EdstButton";
import { UPLINK_SYMBOL } from "../../constants";

type DownlinkSymbolProps = {
  disabled?: boolean;
};

export const DownlinkSymbol = ({ disabled }: DownlinkSymbolProps) => {
  return (
    <EdstButton disabled={disabled} margin="0 4px">
      {UPLINK_SYMBOL}
    </EdstButton>
  );
};
