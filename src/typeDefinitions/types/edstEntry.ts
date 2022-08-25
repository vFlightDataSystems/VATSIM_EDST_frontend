import { ApiFlightplan } from "./apiTypes/apiFlightplan";
import { LocalVEdstEntry } from "./localVEdstEntry";

export type EdstEntry = ApiFlightplan & LocalVEdstEntry;
