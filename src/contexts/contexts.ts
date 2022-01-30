import React, {createContext} from "react";
import {AselProps, EdstEntryProps, PlanDataProps} from "../interfaces";

interface EdstContextProps {
  edst_data: { [cid: string]: EdstEntryProps };
  asel: AselProps | null;
  plan_queue: Array<any>;
  sector_id: string;
  menu: any;
  dragging: boolean;
  unmount: () => void;
  openMenu: (ref: EventTarget | any, name: string, plan?: boolean, asel?: AselProps) => void;
  closeMenu: (name: string) => void;
  updateEntry: (cid: string, data: any) => void;
  amendEntry: (cid: string, plan_data: any) => void;
  deleteEntry: (window: string, cid: string) => void;
  trialPlan: (p: PlanDataProps) => void;
  aircraftSelect: (event: any & Event, window: string | null, cid: string, field: string) => void;
  openWindow: (name: string) => void;
  closeWindow: (name: string) => void;
  startDrag: (event: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<any>) => void;
  stopDrag: (event: React.MouseEvent<HTMLDivElement>) => void;
  setMcaInputRef: (ref: React.RefObject<any> | null) => void;
  setInputFocused: (v: boolean) => void;
  setMraMessage: (msg: string) => void;
}

interface AclContextProps {
  cid_list: Set<string>;
  sort_data: { sector: boolean, name: string };
  asel: AselProps | null;
  manual_posting: boolean;
  togglePosting: () => void;
  addEntry: (fid: string) => void;
}

interface DepContextProps {
  cid_list: Set<string>;
  sort_data: { name: string };
  asel: AselProps | null;
  manual_posting: boolean;
  togglePosting: () => void;
  addEntry: (fid: string) => void;
}

interface TooltipContextProps {
  global_tooltips_enabled: boolean;
  show_all_tooltips: boolean;
}

// @ts-ignore
export const EdstContext = createContext<EdstContextProps>();
// @ts-ignore
export const AclContext = createContext<AclContextProps>();
// @ts-ignore
export const DepContext = createContext<DepContextProps>();
// @ts-ignore
export const TooltipContext = createContext<TooltipContextProps>();