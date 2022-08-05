import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, RootThunkAction } from "../store";
import { Plan } from "../../types/plan";
import { WindowPosition } from "../../types/windowPosition";
import { AircraftId } from "../../types/aircraftId";
import { EDST_MENU_LIST, EdstWindow } from "../../enums/edstWindow";
import { AclRowField } from "../../enums/acl/aclRowField";
import { DepRowField } from "../../enums/dep/depRowField";
import { PlanRowField } from "../../enums/planRowField";

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
  openedBy?: EdstWindow;
};

enum OutageType {
  facilityDown,
  facilityUp,
  serviceDown,
  serviceUp
}

type OutageEntry = {
  message: string;
  outageType: OutageType;
  canDelete: boolean;
  acknowledged: boolean;
};

export type Asel = { aircraftId: AircraftId; window: EdstWindow; field: AclRowField | DepRowField | PlanRowField };

export type AppState = {
  disabledHeaderButtons: edstHeaderButton[];
  planQueue: Plan[];
  windows: Record<EdstWindow, AppWindow>;
  anyDragging: boolean;
  mraMsg: string;
  mcaCommandString: string;
  mcaResponseString: string;
  tooltipsEnabled: boolean;
  showSectorSelector: boolean;
  asel: Asel | null;
  zStack: EdstWindow[];
  outages: OutageEntry[];
};

export enum edstHeaderButton {
  more = "more",
  acl = "acl",
  dep = "dep",
  gpd = "gpd",
  wx = "wx",
  sig = "sig",
  not = "not",
  gi = "gi",
  ua = "ua",
  keep = "keep",
  status = "status",
  outage = "outage",
  adsb = "adsb",
  sat = "sat",
  msg = "msg",
  wind = "wind",
  altim = "altim",
  mca = "mca",
  mra = "mra",
  fel = "fel",
  cpdlcHist = "cpdlcHist",
  cpdlcMsgOut = "cpdlcMsgOut"
}

export const DISABLED_HEADER_BUTTONS = [
  edstHeaderButton.not,
  edstHeaderButton.gi,
  edstHeaderButton.ua,
  edstHeaderButton.keep,
  edstHeaderButton.adsb,
  edstHeaderButton.sat,
  edstHeaderButton.msg,
  edstHeaderButton.wind,
  edstHeaderButton.fel,
  edstHeaderButton.cpdlcHist,
  edstHeaderButton.cpdlcMsgOut
];

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
  disabledHeaderButtons: DISABLED_HEADER_BUTTONS,
  planQueue: [],
  windows: initialWindowState,
  anyDragging: false,
  mraMsg: "",
  mcaCommandString: "",
  mcaResponseString: "",
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
    toggleWindow(state, action: PayloadAction<EdstWindow>) {
      state.windows[action.payload].open = !state.windows[action.payload].open;
      const zStack = new Set([...state.zStack]);
      zStack.delete(action.payload);
      state.zStack = [...zStack, action.payload];
    },
    closeWindow(state, action: PayloadAction<EdstWindow | EdstWindow[]>) {
      if (Array.isArray(action.payload)) {
        action.payload.forEach(window => {
          state.windows[window].open = false;
        });
      } else {
        state.windows[action.payload].open = false;
      }
    },
    openWindow(state, action: PayloadAction<{ window: EdstWindow; openedBy?: EdstWindow }>) {
      state.windows[action.payload.window].open = true;
      if (action.payload.openedBy) {
        state.windows[action.payload.window].openedBy = action.payload.openedBy;
      }
      const zStack = new Set([...state.zStack]);
      zStack.delete(action.payload.window);
      state.zStack = [...zStack, action.payload.window];
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
    setMcaResponseString(state, action: PayloadAction<string>) {
      state.mcaResponseString = action.payload;
    },
    closeAllWindows(state) {
      Object.values(EdstWindow).forEach(window => {
        state.windows[window].open = false;
      });
    },
    closeAllMenus(state) {
      EDST_MENU_LIST.forEach(menu => {
        state.windows[menu].open = false;
      });
      state.asel = null;
    },
    closeAircraftMenus(state) {
      AIRCRAFT_MENUS.forEach(menu => {
        state.windows[menu].open = false;
      });
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

export function setAsel(asel: Asel | null): RootThunkAction {
  return (dispatch, getState) => {
    if (asel === null || Object.keys(getState().entries).includes(asel.aircraftId)) {
      dispatch(appSlice.actions.setAsel(asel));
    }
  };
}

export const setMcaResponse = (message: string): RootThunkAction => {
  return dispatch => {
    dispatch(pushZStack(EdstWindow.MESSAGE_COMPOSE_AREA));
    dispatch(appSlice.actions.setMcaResponseString(`ACCEPT\n${message}`));
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

export const {
  setIsFullscreen,
  setTooltipsEnabled,
  setShowSectorSelector,
  setWindowPosition,
  setMcaCommandString,
  openWindow,
  closeWindow,
  toggleWindow,
  closeAllWindows,
  closeAllMenus,
  closeAircraftMenus,
  setAnyDragging,
  pushZStack,
  addOutageMessage,
  removeOutageMessage
} = appSlice.actions;
export default appSlice.reducer;

export const mcaCommandStringSelector = (state: RootState) => state.app.mcaCommandString;
export const mcaResponseStringSelector = (state: RootState) => state.app.mcaResponseString;
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
export const disabledHeaderButtonsSelector = (state: RootState) => state.app.disabledHeaderButtons;
