import { useContext } from "react";
import { McaContext } from "contexts/McaContext";

export const useMcaInput = () => {
  return useContext(McaContext);
};
