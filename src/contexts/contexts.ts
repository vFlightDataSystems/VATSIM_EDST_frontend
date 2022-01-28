import {createContext} from "react";
import {AselProps, EdstEntryProps} from "../interfaces";

interface EdstContextProps {
  edst_data: { [cid: string]: EdstEntryProps };
  asel: AselProps;
  plan_queue: Array<any>;
  sector_id: string;
  menu: any;
  unmount: Function;
  openMenu: Function;
  closeMenu: Function;
  updateEntry: Function;
  amendEntry: Function;
  deleteEntry: Function;
  trialPlan: Function;
  aircraftSelect: Function;
  openWindow: Function;
  closeWindow: Function;
  startDrag: Function;
  stopDrag: Function;
  setMcaInputRef: Function;
  setInputFocused: Function;
  setMraMessage: Function;
}

interface AclContextProps {
  cid_list: Set<string>;
  sort_data: { sector: boolean, name: string };
  asel: AselProps | null;
  manual_posting: boolean;
  togglePosting: Function;
}

interface DepContextProps {
  cid_list: Set<string>;
  sort_data: { name: string };
  asel: AselProps | null;
  manual_posting: boolean;
  togglePosting: Function;
}

interface TooltipContextProps {
  global_tooltips_enabled: boolean;
  show_all_tooltips: boolean;
}

export const EdstContext = createContext<EdstContextProps>(null);
export const AclContext = createContext<AclContextProps>(null);
export const DepContext = createContext<DepContextProps>(null);
export const TooltipContext = createContext<TooltipContextProps>(null);