import {createSlice} from "@reduxjs/toolkit";
import {PlanDataType, WindowPositionType} from "../../types";
import {aclRowFieldEnum, depRowFieldEnum, edstHeaderButtonEnum, planRowFieldEnum, windowEnum} from "../../enums";
import {RootState} from "../store";

type AppWindowType = {
  open: boolean,
  window: windowEnum,
  position: WindowPositionType | null,
  openedBy?: windowEnum,
  openedWithCid?: string | null
};

export type AselType = { cid: string, window: windowEnum, field: aclRowFieldEnum | depRowFieldEnum | planRowFieldEnum };

export type AppStateType = {
  disabledHeaderButtons: edstHeaderButtonEnum[];
  planQueue: PlanDataType[],
  inputFocused: boolean;
  windows: { [key in windowEnum]: AppWindowType },
  dragging: boolean;
  mraMsg: string;
  mcaCommandString: string;
  tooltipsEnabled: boolean;
  showSectorSelector: boolean;
  asel: AselType | null
}

export const DISABLED_HEADER_BUTTONS = [
  edstHeaderButtonEnum.gpd,
  edstHeaderButtonEnum.wx,
  edstHeaderButtonEnum.sig,
  edstHeaderButtonEnum.not,
  edstHeaderButtonEnum.gi,
  edstHeaderButtonEnum.ua,
  edstHeaderButtonEnum.keep,
  edstHeaderButtonEnum.adsb,
  edstHeaderButtonEnum.sat,
  edstHeaderButtonEnum.msg,
  edstHeaderButtonEnum.wind,
  edstHeaderButtonEnum.altim,
  edstHeaderButtonEnum.fel,
  edstHeaderButtonEnum.cpdlc_hist,
  edstHeaderButtonEnum.cpdlc_msg_out
];

const defaultWindowPositions: { [key in windowEnum]?: { x: number, y: number } | null } = {
  [windowEnum.status]: {x: 400, y: 100},
  [windowEnum.outage]: {x: 400, y: 100},
  [windowEnum.messageComposeArea]: {x: 100, y: 600},
  [windowEnum.messageResponseArea]: {x: 100, y: 100},
  [windowEnum.templateMenu]: {x: 100, y: 100}
};

const initialWindowState: { [key in windowEnum]: AppWindowType } = Object.fromEntries(Object.values(windowEnum)
  .map((value) => [value as windowEnum, {
    open: false,
    window: value as windowEnum,
    position: defaultWindowPositions[value as windowEnum] ?? null
  } as AppWindowType])) as { [key in windowEnum]: AppWindowType };

const initialState: AppStateType = {
  disabledHeaderButtons: DISABLED_HEADER_BUTTONS,
  planQueue: [],
  inputFocused: false,
  windows: initialWindowState,
  dragging: false,
  mraMsg: '',
  mcaCommandString: '',
  tooltipsEnabled: true,
  showSectorSelector: true,
  asel: null
};

const appSlice = createSlice({
  name: 'app',
  initialState: initialState as AppStateType,
  reducers: {
    toggleWindow(state, action: { payload: windowEnum }) {
      state.windows[action.payload].open = !state.windows[action.payload].open;
    },
    closeWindow(state, action: { payload: windowEnum | windowEnum[] }) {
      if (action.payload instanceof Array) {
        for (const window of action.payload) {
          state.windows[window].open = false;
        }
      }
      else {
        state.windows[action.payload].open = false;
      }
    },
    openWindow(state, action: { payload: { window: windowEnum, openedBy?: windowEnum, openedWithCid?: string | null } }) {
      state.windows[action.payload.window].open = true;
      if (action.payload.openedBy) {
        state.windows[action.payload.window].openedBy = action.payload.openedBy;
      }
      if (action.payload.openedWithCid) {
        state.windows[action.payload.window].openedWithCid = action.payload.openedWithCid;
      }
    },
    setTooltipsEnabled(state, action: { payload: boolean }) {
      state.tooltipsEnabled = action.payload;
    },
    setShowSectorSelector(state, action: { payload: boolean }) {
      state.showSectorSelector = action.payload;
    },
    setWindowPosition(state, action: { payload: { window: windowEnum, pos: { x: number, y: number, w?: number, h?: number } | null } }) {
      state.windows[action.payload.window].position = action.payload.pos;
    },
    setMraMessage(state, action: { payload: string }) {
      state.windows[windowEnum.messageResponseArea].open = true;
      state.mraMsg = action.payload;
    },
    setMcaCommandString(state, action: { payload: string }) {
      state.mcaCommandString = action.payload;
    },
    setInputFocused(state, action: { payload: boolean }) {
      state.inputFocused = action.payload;
    },
    closeAllWindows(state) {
      for (let window of Object.values(windowEnum)) {
        state.windows[window as windowEnum].open = false;
      }
    },
    setAsel(state, action: { payload: AselType | null }) {
      state.asel = action.payload;
    },
    setDragging(state, action: { payload: boolean }) {
      state.dragging = action.payload;
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
  setInputFocused,
  closeAllWindows,
  setAsel,
  setDragging
} = appSlice.actions;
export default appSlice.reducer;

export const mcaCommandStringSelector = (state: RootState) => state.app.mcaCommandString;
export const mraMsgSelector = (state: RootState) => state.app.mraMsg;
export const windowSelector = (window: windowEnum) => (state: RootState) => state.app.windows[window];
export const windowPositionSelector = (window: windowEnum) => (state: RootState) => state.app.windows[window].position;
export const aselSelector = (state: RootState) => state.app.asel;
export const aclAselSelector = (state: RootState) => state.app.asel?.window === windowEnum.acl ? state.app.asel : null;
export const depAselSelector = (state: RootState) => state.app.asel?.window === windowEnum.dep ? state.app.asel : null;