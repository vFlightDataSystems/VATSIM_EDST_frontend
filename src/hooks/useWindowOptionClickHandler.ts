import React, { useCallback } from "react";
import { decOptionValue, incOptionValue, ModifiableWindowOptions } from "../redux/slices/windowOptionsSlice";
import { useRootDispatch } from "../redux/hooks";

export const useWindowOptionClickHandler = <T extends keyof ModifiableWindowOptions>(window: T) => {
  const dispatch = useRootDispatch();

  return useCallback(
    (event: React.MouseEvent<HTMLElement>, key: keyof ModifiableWindowOptions[T]) => {
      switch (event.button) {
        case 0:
          dispatch(decOptionValue(window, key));
          break;
        case 1:
          dispatch(incOptionValue(window, key));
          break;
        default:
          break;
      }
    },
    [dispatch, window]
  );
};
