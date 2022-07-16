import { ApiFlightplan } from "./apiFlightplan";
import { LocalVEdstEntry } from "./localVEdstEntry";
import { DerivedFlightplanData } from "./derivedFlightplanData";

export type EdstEntry = ApiFlightplan & DerivedFlightplanData & LocalVEdstEntry;