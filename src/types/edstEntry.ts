import type { ApiFlightplan } from "types/apiTypes/apiFlightplan";
import type { LocalVEdstEntry } from "types/localVEdstEntry";

export type EdstEntry = ApiFlightplan & LocalVEdstEntry;
