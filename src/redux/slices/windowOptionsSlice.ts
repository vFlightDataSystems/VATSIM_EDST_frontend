import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";

export const WINDOW_OPTION_PREFIXES = {
  [EdstWindow.ALTIMETER]: {
    brightness: "BRIGHT",
    columns: "COL",
    lines: "LINES",
    fontSize: "FONT"
  },
  [EdstWindow.METAR]: {
    brightness: "BRIGHT",
    lines: "LINES",
    fontSize: "FONT"
  },
  [EdstWindow.MESSAGE_COMPOSE_AREA]: {
    brightness: "BRIGHT",
    lines: "PA LINES",
    width: "WIDTH",
    fontSize: "FONT"
  },
  [EdstWindow.MESSAGE_RESPONSE_AREA]: {
    brightness: "BRIGHT",
    width: "WIDTH",
    fontSize: "FONT"
  },
  [EdstWindow.GI]: {
    brightness: "BRIGHT",
    lines: "LINES",
    fontSize: "FONT"
  },
  [EdstWindow.SIGMETS]: {
    brightness: "BRIGHT",
    lines: "LINES",
    fontSize: "FONT"
  }
};

const initialState = {
  [EdstWindow.ALTIMETER]: {
    brightness: 80,
    columns: 1,
    lines: 5,
    fontSize: 2
  },
  [EdstWindow.METAR]: {
    brightness: 80,
    lines: 5,
    fontSize: 2
  },
  [EdstWindow.MESSAGE_COMPOSE_AREA]: {
    brightness: 80,
    lines: 2,
    width: 45,
    fontSize: 2
  },
  [EdstWindow.MESSAGE_RESPONSE_AREA]: {
    brightness: 80,
    width: 45,
    fontSize: 2
  },
  [EdstWindow.GI]: {
    brightness: 80,
    lines: 10,
    fontSize: 2
  },
  [EdstWindow.SIGMETS]: {
    brightness: 80,
    lines: 10,
    fontSize: 2
  }
};

type WindowOptions = typeof initialState;
export type ModifiableWindowOptions = WindowOptions;

const maxOptionValues = {
  [EdstWindow.ALTIMETER]: {
    brightness: 100,
    fontSize: 3
  },
  [EdstWindow.METAR]: {
    brightness: 100,
    fontSize: 3
  },
  [EdstWindow.MESSAGE_COMPOSE_AREA]: {
    brightness: 100,
    lines: 30,
    width: 50,
    fontSize: 3
  },
  [EdstWindow.MESSAGE_RESPONSE_AREA]: {
    brightness: 100,
    width: 50,
    fontSize: 3
  },
  [EdstWindow.GI]: {
    brightness: 100,
    lines: 21,
    fontSize: 3
  },
  [EdstWindow.SIGMETS]: {
    brightness: 100,
    lines: 21,
    fontSize: 3
  }
};

const minOptionValues = {
  [EdstWindow.ALTIMETER]: {
    brightness: 2,
    fontSize: 1
  },
  [EdstWindow.METAR]: {
    brightness: 2,
    fontSize: 1
  },
  [EdstWindow.MESSAGE_COMPOSE_AREA]: {
    brightness: 2,
    lines: 1,
    width: 30,
    fontSize: 1
  },
  [EdstWindow.MESSAGE_RESPONSE_AREA]: {
    brightness: 2,
    width: 25,
    fontSize: 1
  },
  [EdstWindow.GI]: {
    brightness: 2,
    lines: 3,
    fontSize: 1
  },
  [EdstWindow.SIGMETS]: {
    brightness: 2,
    lines: 3,
    fontSize: 1
  }
};

const windowOptionsSlice = createSlice({
  name: "windowOptions",
  initialState,
  reducers: {
    incOptionValue(state, action: PayloadAction<{ window: keyof ModifiableWindowOptions; key: any }>) {
      const { window, key } = action.payload;
      if (key in maxOptionValues[window]) {
        if ((state[window] as Record<string, number>)[key] < (maxOptionValues[window] as Record<string, number>)[key]) {
          (state[window] as Record<string, number>)[key] += 1;
        }
      }
    },
    decOptionValue(state, action: PayloadAction<{ window: keyof ModifiableWindowOptions; key: any }>) {
      const { window, key } = action.payload;
      if (key in minOptionValues[window]) {
        if ((state[window] as Record<string, number>)[key] > (minOptionValues[window] as Record<string, number>)[key]) {
          (state[window] as Record<string, number>)[key] -= 1;
        }
      }
    }
  }
});

const { incOptionValue: _incOptionValue, decOptionValue: _decOptionValue } = windowOptionsSlice.actions;

export const incOptionValue = <T extends keyof ModifiableWindowOptions, K extends keyof ModifiableWindowOptions[T]>(window: T, key: K) =>
  _incOptionValue({ window, key });
export const decOptionValue = <T extends keyof ModifiableWindowOptions, K extends keyof ModifiableWindowOptions[T]>(window: T, key: K) =>
  _decOptionValue({ window, key });

export default windowOptionsSlice.reducer;

export function windowOptionsSelector<T extends keyof WindowOptions>(window: T) {
  return (state: RootState) => state.windowOptions[window];
}