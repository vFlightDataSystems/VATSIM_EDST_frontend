import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, RootThunkAction } from "../store";
import { WindowPosition } from "../../typeDefinitions/types/windowPosition";
import { EDST_MENU_LIST, EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { openWindowThunk } from "../thunks/openWindowThunk";
import { OutageEntry } from "../../typeDefinitions/types/outageEntry";
import sharedSocket from "../../sharedState/socket";
import { Asel } from "../../typeDefinitions/types/asel";

export const AIRCRAFT_MENUS = [
  EdstWindow.PLAN_OPTIONS,
  EdstWindow.ALTITUDE_MENU,
  EdstWindow.ROUTE_MENU,
  EdstWindow.PREV_ROUTE_MENU,
  EdstWindow.SPEED_MENU,
  EdstWindow.HEADING_MENU,
  EdstWindow.HOLD_MENU,
  EdstWindow.CANCEL_HOLD_MENU,
  EdstWindow.TEMPLATE_MENU,
  EdstWindow.EQUIPMENT_TEMPLATE_MENU
];

export const FULLSCREEN_WINDOWS = [EdstWindow.ACL, EdstWindow.DEP, EdstWindow.GPD, EdstWindow.PLANS_DISPLAY];

type AppWindow = {
  open: boolean;
  window: EdstWindow;
  position: WindowPosition | null;
  isFullscreen: boolean;
};

type AppState = {
  windows: Record<EdstWindow, AppWindow>;
  anyDragging: boolean;
  mraMsg: string;
  mcaCommandString: string;
  mcaFeedbackString: string;
  tooltipsEnabled: boolean;
  showSectorSelector: boolean;
  asel: Asel | null;
  zStack: EdstWindow[];
  outages: OutageEntry[];
};

export const defaultWindowPositions: Partial<Record<EdstWindow, WindowPosition>> = {
  [EdstWindow.STATUS]: { x: 400, y: 100 },
  [EdstWindow.OUTAGE]: { x: 400, y: 100 },
  [EdstWindow.MESSAGE_COMPOSE_AREA]: { x: 100, y: 600 }
};

const initialWindowState: Record<EdstWindow, AppWindow> = Object.fromEntries(
  Object.values(EdstWindow).map(value => [
    value,
    {
      open: false,
      isFullscreen: FULLSCREEN_WINDOWS.includes(value),
      position: defaultWindowPositions[value] ?? { x: 100, y: 100 }
    } as AppWindow
  ])
) as Record<EdstWindow, AppWindow>;

const initialState: AppState = {
  windows: initialWindowState,
  anyDragging: false,
  mraMsg: "",
  mcaCommandString: "",
  mcaFeedbackString: "",
  tooltipsEnabled: true,
  showSectorSelector: false,
  asel: null,
  zStack: [],
  outages: []
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    closeWindow(state, action: PayloadAction<EdstWindow | EdstWindow[]>) {
      if (Array.isArray(action.payload)) {
        action.payload.forEach(window => {
          state.windows[window].open = false;
        });
      } else {
        state.windows[action.payload].open = false;
      }
    },
    openWindow(state, action: PayloadAction<EdstWindow>) {
      state.windows[action.payload].open = true;
      const zStack = new Set([...state.zStack]);
      zStack.delete(action.payload);
      state.zStack = [...zStack, action.payload];
    },
    setIsFullscreen(state, action: PayloadAction<{ window: EdstWindow; value: boolean }>) {
      state.windows[action.payload.window].isFullscreen = action.payload.value;
    },
    setTooltipsEnabled(state, action: PayloadAction<boolean>) {
      state.tooltipsEnabled = action.payload;
    },
    setShowSectorSelector(state, action: PayloadAction<boolean>) {
      state.showSectorSelector = action.payload;
    },
    setWindowPosition(state, action: PayloadAction<{ window: EdstWindow; pos: WindowPosition | null }>) {
      state.windows[action.payload.window].position = action.payload.pos;
    },
    setMraMessage(state, action: PayloadAction<string>) {
      state.mraMsg = action.payload;
    },
    setMcaCommandString(state, action: PayloadAction<string>) {
      state.mcaCommandString = action.payload;
    },
    setMcaFeedbackString(state, action: PayloadAction<string>) {
      state.mcaFeedbackString = action.payload;
    },
    setAsel(state, action: PayloadAction<Asel | null>) {
      state.asel = action.payload;
    },
    setAnyDragging(state, action: PayloadAction<boolean>) {
      state.anyDragging = action.payload;
    },
    pushZStack(state, action: PayloadAction<EdstWindow>) {
      const zStack = new Set([...state.zStack]);
      zStack.delete(action.payload);
      state.zStack = [...zStack, action.payload];
    },
    addOutageMessage(state, action: PayloadAction<OutageEntry>) {
      state.outages = [...state.outages, action.payload];
    },
    // removes outage message at index
    removeOutageMessage(state, action: PayloadAction<number>) {
      if (action.payload > -1 && action.payload < state.outages.length) {
        state.outages.splice(action.payload, 1);
      }
    }
  }
});

export const closeAllWindows = (triggerSharedState = false): RootThunkAction => {
  return dispatch => {
    Object.values(EdstWindow).forEach(window => {
      dispatch(closeWindow(window, triggerSharedState));
    });
  };
};

export const closeAllMenus = (triggerSharedState = true): RootThunkAction => {
  return dispatch => {
    EDST_MENU_LIST.forEach(window => {
      dispatch(closeWindow(window, triggerSharedState));
    });
    dispatch(setAsel(null, null, triggerSharedState));
  };
};

export const closeAircraftMenus = (triggerSharedState = false): RootThunkAction => {
  return dispatch => {
    AIRCRAFT_MENUS.forEach(window => {
      dispatch(closeWindow(window, triggerSharedState));
    });
  };
};

export function setAsel(asel: Asel | null, eventId?: string | null, triggerSharedState = true): RootThunkAction {
  return (dispatch, getState) => {
    if (asel === null || Object.keys(getState().entries).includes(asel.aircraftId)) {
      dispatch(closeAircraftMenus());
      dispatch(appSlice.actions.setAsel(asel));
      if (triggerSharedState) {
        sharedSocket.setAircraftSelect(asel, eventId ?? null);
      }
    }
  };
}

export const setMcaResponse = (message: string): RootThunkAction => {
  return dispatch => {
    dispatch(openWindowThunk(EdstWindow.MESSAGE_COMPOSE_AREA));
    dispatch(appSlice.actions.setMcaFeedbackString(message));
  };
};

export const setMcaAcceptMessage = (message: string) => setMcaResponse(`ACCEPT\n${message}`);

export const setMcaRejectMessage = (message: string) => setMcaResponse(`REJECT\n${message}`);

export const setMraMessage = (message: string): RootThunkAction => {
  return dispatch => {
    dispatch(pushZStack(EdstWindow.MESSAGE_RESPONSE_AREA));
    dispatch(appSlice.actions.setMraMessage(message));
  };
};

export const closeWindow = (edstWindow: EdstWindow, triggerSharedState = true): RootThunkAction => {
  return dispatch => {
    dispatch(appSlice.actions.closeWindow(edstWindow));
    if (triggerSharedState) {
      sharedSocket.closeSharedWindow(edstWindow);
    }
  };
};

export const toggleWindow = (edstWindow: EdstWindow): RootThunkAction => {
  return (dispatch, getState) => {
    const isOpen = getState().app.windows[edstWindow].open;
    if (isOpen) {
      dispatch(closeWindow(edstWindow));
      sharedSocket.closeSharedWindow(edstWindow);
    } else {
      dispatch(openWindow(edstWindow));
      sharedSocket.openSharedWindow(edstWindow);
    }
  };
};

export const {
  setIsFullscreen,
  setTooltipsEnabled,
  setShowSectorSelector,
  setWindowPosition,
  setMcaCommandString,
  openWindow,
  setAnyDragging,
  pushZStack,
  addOutageMessage,
  removeOutageMessage
} = appSlice.actions;
export default appSlice.reducer;

export const mcaCommandStringSelector = (state: RootState) => state.app.mcaCommandString;
export const mcaFeedbackSelector = (state: RootState) => state.app.mcaFeedbackString;
export const mraMsgSelector = (state: RootState) => state.app.mraMsg;
export const windowSelector = (window: EdstWindow) => (state: RootState) => state.app.windows[window];
export const windowPositionSelector = (window: EdstWindow) => (state: RootState) => state.app.windows[window].position;
export const windowIsFullscreenSelector = (window: EdstWindow) => (state: RootState) => state.app.windows[window].isFullscreen;
export const aselSelector = (state: RootState) => state.app.asel;
export const aclAselSelector = (state: RootState) => (state.app.asel?.window === EdstWindow.ACL ? state.app.asel : null);
export const depAselSelector = (state: RootState) => (state.app.asel?.window === EdstWindow.DEP ? state.app.asel : null);
export const gpdAselSelector = (state: RootState) => (state.app.asel?.window === EdstWindow.GPD ? state.app.asel : null);
export const anyDraggingSelector = (state: RootState) => state.app.anyDragging;
export const zStackSelector = (state: RootState) => state.app.zStack;
export const outageSelector = (state: RootState) => state.app.outages;
export const windowsSelector = (state: RootState) => state.app.windows;
export const tooltipsEnabledSelector = (state: RootState) => state.app.tooltipsEnabled;
export const showSectorSelectorSelector = (state: RootState) => state.app.showSectorSelector;
