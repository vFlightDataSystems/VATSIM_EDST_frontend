import type { ApiFlightplan } from "./apiTypes/apiFlightplan";
import type { LocalVEdstEntry } from "./localVEdstEntry";

export type EdstEntry = ApiFlightplan & LocalVEdstEntry;
