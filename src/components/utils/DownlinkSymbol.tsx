import React from "react";
import { EdstButton } from "./EdstButton";
import { DOWNLINK_SYMBOL } from "../../utils/constants";

type DownlinkSymbolProps = {
  disabled?: boolean;
};

export const DownlinkSymbol = ({ disabled }: DownlinkSymbolProps) => {
  return <EdstButton disabled={disabled} margin="0 4px" content={DOWNLINK_SYMBOL} />;
};
