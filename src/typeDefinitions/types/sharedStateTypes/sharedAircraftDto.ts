import type { AircraftId } from "../aircraftId";
import type { LocalVEdstEntry } from "../localVEdstEntry";

export type SharedAircraftDto = { aircraftId: AircraftId } & LocalVEdstEntry;
