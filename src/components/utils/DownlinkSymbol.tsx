import React from "react";
import { DOWNLINK_SYMBOL } from "~/utils/constants";
import { EdstButton } from "./EdstButton";

type DownlinkSymbolProps = {
  disabled?: boolean;
};

export const DownlinkSymbol = ({ disabled }: DownlinkSymbolProps) => {
  return <EdstButton disabled={disabled} margin="0 4px" content={DOWNLINK_SYMBOL} />;
};
