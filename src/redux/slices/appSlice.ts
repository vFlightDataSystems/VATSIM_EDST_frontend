import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { EDST_MENU_LIST, EdstWindow, AclRowField, DepRowField, PlanRowField } from "../../namespaces";
import { Plan } from "../../types/plan";
import { WindowPosition } from "../../types/windowPosition";

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

type AppWindow = {
  open: boolean;
  window: EdstWindow;
  position: WindowPosition | null;
  openedBy?: EdstWindow;
};

enum outageTypeEnum {
  facilityDown,
  facilityUp,
  serviceDown,
  serviceUp
}

type OutageEntry = {
  message: string;
  outageType: outageTypeEnum;
  canDelete: boolean;
  acknowledged: boolean;
};

export type Asel = { aircraftId: string; window: EdstWindow; field: AclRowField | DepRowField | PlanRowField };

export type AppState = {
  disabledHeaderButtons: edstHeaderButton[];
  planQueue: Plan[];
  windows: Record<EdstWindow, AppWindow>;
  dragging: boolean;
  mraMsg: string;
  mcaCommandString: string;
  tooltipsEnabled: boolean;
  showSectorSelector: boolean;
  asel: Asel | null;
  zStack: EdstWindow[];
  outage: OutageEntry[];
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

const defaultWindowPositions: Partial<Record<EdstWindow, WindowPosition | null>> = {
  [EdstWindow.STATUS]: { x: 400, y: 100 },
  [EdstWindow.OUTAGE]: { x: 400, y: 100 },
  [EdstWindow.MESSAGE_COMPOSE_AREA]: { x: 100, y: 600 },
  [EdstWindow.MESSAGE_RESPONSE_AREA]: { x: 100, y: 100 },
  [EdstWindow.ALTIMETER]: { x: 100, y: 100 },
  [EdstWindow.METAR]: { x: 100, y: 100 },
  [EdstWindow.SIGMETS]: { x: 100, y: 100 }
};

const initialWindowState: Record<EdstWindow, AppWindow> = Object.fromEntries(
  Object.values(EdstWindow).map(value => [
    value as EdstWindow,
    {
      open: false,
      position: defaultWindowPositions[value as EdstWindow] ?? null
    } as AppWindow
  ])
) as Record<EdstWindow, AppWindow>;

const initialState: AppState = {
  disabledHeaderButtons: DISABLED_HEADER_BUTTONS,
  planQueue: [],
  windows: initialWindowState,
  dragging: false,
  mraMsg: "",
  mcaCommandString: "",
  tooltipsEnabled: true,
  showSectorSelector: false,
  asel: null,
  zStack: [],
  outage: []
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleWindow(state, action: PayloadAction<EdstWindow>) {
      state.windows[action.payload].open = !state.windows[action.payload].open;
      const zStack = new Set([...state.zStack]);
      zStack.delete(action.payload);
      state.zStack = [action.payload, ...zStack];
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
      state.zStack = [action.payload.window, ...zStack];
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
      state.windows[EdstWindow.MESSAGE_RESPONSE_AREA].open = true;
      state.mraMsg = action.payload;
    },
    setMcaCommandString(state, action: PayloadAction<string>) {
      state.mcaCommandString = action.payload;
    },
    closeAllWindows(state) {
      Object.values(EdstWindow).forEach(window => {
        state.windows[window as EdstWindow].open = false;
      });
    },
    closeAllMenus(state) {
      EDST_MENU_LIST.forEach(menu => {
        state.windows[menu as EdstWindow].open = false;
      });
      state.asel = null;
    },
    closeAircraftMenus(state) {
      AIRCRAFT_MENUS.forEach(menu => {
        state.windows[menu as EdstWindow].open = false;
      });
    },
    setAsel(state, action: PayloadAction<Asel | null>) {
      state.asel = action.payload;
    },
    setAnyDragging(state, action: PayloadAction<boolean>) {
      state.dragging = action.payload;
    },
    pushZStack(state, action: PayloadAction<EdstWindow>) {
      const zStack = new Set([...state.zStack]);
      zStack.delete(action.payload);
      state.zStack = [...zStack, action.payload];
    },
    addOutageMessage(state, action: PayloadAction<OutageEntry>) {
      state.outage = [...state.outage, action.payload];
    },
    // removes outage message at index
    removeOutageMessage(state, action: PayloadAction<number>) {
      if (action.payload > -1 && action.payload < state.outage.length) {
        state.outage.splice(action.payload, 1);
      }
    }
  }
});

export const {
  setTooltipsEnabled,
  setShowSectorSelector,
  setWindowPosition,
  setMraMessage,
  setMcaCommandString,
  openWindow,
  closeWindow,
  toggleWindow,
  closeAllWindows,
  closeAllMenus,
  closeAircraftMenus,
  setAsel,
  setAnyDragging,
  pushZStack,
  addOutageMessage,
  removeOutageMessage
} = appSlice.actions;
export default appSlice.reducer;

export const mcaCommandStringSelector = (state: RootState) => state.app.mcaCommandString;
export const mraMsgSelector = (state: RootState) => state.app.mraMsg;
export const windowSelector = (window: EdstWindow) => (state: RootState) => state.app.windows[window];
export const windowPositionSelector = (window: EdstWindow) => (state: RootState) => state.app.windows[window].position;
export const aselSelector = (state: RootState) => state.app.asel;
export const aclAselSelector = (state: RootState) => (state.app.asel?.window === EdstWindow.ACL ? state.app.asel : null);
export const depAselSelector = (state: RootState) => (state.app.asel?.window === EdstWindow.DEP ? state.app.asel : null);
export const gpdAselSelector = (state: RootState) => (state.app.asel?.window === EdstWindow.GPD ? state.app.asel : null);
export const anyDraggingSelector = (state: RootState) => state.app.dragging;
export const zStackSelector = (state: RootState) => state.app.zStack;
export const outageSelector = (state: RootState) => state.app.outage;
export const windowsSelector = (state: RootState) => state.app.windows;
export const tooltipsEnabledSelector = (state: RootState) => state.app.tooltipsEnabled;
export const showSectorSelectorSelector = (state: RootState) => state.app.showSectorSelector;
export const disabledHeaderButtonsSelector = (state: RootState) => state.app.disabledHeaderButtons;
