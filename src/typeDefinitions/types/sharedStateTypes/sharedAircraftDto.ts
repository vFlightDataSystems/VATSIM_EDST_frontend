import type { AircraftId } from "types/aircraftId";
import type { LocalVEdstEntry } from "types/localVEdstEntry";

export type SharedAircraftDto = { aircraftId: AircraftId } & LocalVEdstEntry;
