import type React from "react";
import { useCallback, useMemo } from "react";
import type { ModifiableWindowOptions } from "~redux/slices/windowOptionsSlice";
import { decOptionValue, incOptionValue, windowOptionLabel, windowOptionsSelector } from "~redux/slices/windowOptionsSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import type { FloatingWindowOptions } from "components/utils/FloatingWindowOptionContainer";
import { colors } from "~/edstTheme";

type PickByValue<T, V> = Pick<T, { [K in keyof T]: T[K] extends V ? K : never }[keyof T]>;
type Entries<T> = {
  [K in keyof T]: [keyof PickByValue<T, T[K]>, T[K]];
}[keyof T][];

function getEntries<T extends object>(obj: T) {
  return Object.entries(obj) as Entries<T>;
}

export const useWindowOptions = <T extends keyof ModifiableWindowOptions>(window: T, extraOptions?: FloatingWindowOptions) => {
  const dispatch = useRootDispatch();
  const windowOptions = useRootSelector(windowOptionsSelector(window));

  const mouseDownHandler = useCallback(
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

  const options: FloatingWindowOptions = useMemo(
    () => ({
      ...Object.fromEntries(
        getEntries(windowOptions).map(([key, value]) => [
          key,
          {
            value: `${windowOptionLabel[key as keyof typeof windowOptionLabel]} ${value}`,
            backgroundColor: colors.optionsBackgroundGreen,
            onMouseDown: (event) => mouseDownHandler(event, key),
          },
        ])
      ),
      ...extraOptions,
    }),
    [mouseDownHandler, extraOptions, windowOptions]
  );

  return options;
};
