import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";

export const windowOptionLabel = {
  brightness: "BRIGHT",
  fontSizeIndex: "FONT",
  columns: "COL",
  lines: "LINES",
  paLines: "PA LINES",
  width: "WIDTH"
};

const initialState = {
  [EdstWindow.ALTIMETER]: {
    lines: 5,
    columns: 1,
    fontSizeIndex: 2,
    brightness: 80
  },
  [EdstWindow.METAR]: {
    lines: 5,
    fontSizeIndex: 2,
    brightness: 80
  },
  [EdstWindow.MESSAGE_COMPOSE_AREA]: {
    paLines: 2,
    width: 35,
    fontSizeIndex: 2,
    brightness: 80
  },
  [EdstWindow.MESSAGE_RESPONSE_AREA]: {
    width: 45,
    fontSizeIndex: 2,
    brightness: 80
  },
  [EdstWindow.GI]: {
    lines: 10,
    fontSizeIndex: 2,
    brightness: 80
  },
  [EdstWindow.SIGMETS]: {
    lines: 10,
    fontSizeIndex: 2,
    brightness: 80
  },
  [EdstWindow.STATUS]: {
    fontSizeIndex: 2
  },
  [EdstWindow.OUTAGE]: {
    fontSizeIndex: 2
  }
};

export type WindowOptions = typeof initialState;
export type ModifiableWindowOptions = WindowOptions;

const maxOptionValues = {
  [EdstWindow.ALTIMETER]: {
    brightness: 100,
    fontSizeIndex: 3
  },
  [EdstWindow.METAR]: {
    brightness: 100,
    fontSizeIndex: 3
  },
  [EdstWindow.MESSAGE_COMPOSE_AREA]: {
    brightness: 100,
    paLines: 2,
    width: 50,
    fontSizeIndex: 3
  },
  [EdstWindow.MESSAGE_RESPONSE_AREA]: {
    brightness: 100,
    width: 50,
    fontSizeIndex: 3
  },
  [EdstWindow.GI]: {
    brightness: 100,
    lines: 21,
    fontSizeIndex: 3
  },
  [EdstWindow.SIGMETS]: {
    brightness: 100,
    lines: 21,
    fontSizeIndex: 3
  },
  [EdstWindow.STATUS]: {
    fontSizeIndex: 3
  },
  [EdstWindow.OUTAGE]: {
    fontSizeIndex: 3
  }
};

const minOptionValues = {
  [EdstWindow.ALTIMETER]: {
    brightness: 2,
    fontSizeIndex: 1
  },
  [EdstWindow.METAR]: {
    brightness: 2,
    fontSizeIndex: 1
  },
  [EdstWindow.MESSAGE_COMPOSE_AREA]: {
    brightness: 2,
    paLines: 2,
    width: 30,
    fontSizeIndex: 1
  },
  [EdstWindow.MESSAGE_RESPONSE_AREA]: {
    brightness: 2,
    width: 25,
    fontSizeIndex: 1
  },
  [EdstWindow.GI]: {
    brightness: 2,
    lines: 3,
    fontSizeIndex: 1
  },
  [EdstWindow.SIGMETS]: {
    brightness: 2,
    lines: 3,
    fontSizeIndex: 1
  },
  [EdstWindow.STATUS]: {
    fontSizeIndex: 1
  },
  [EdstWindow.OUTAGE]: {
    fontSizeIndex: 1
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
