import { AircraftId } from "../aircraftId";
import { LocalVEdstEntry } from "../localVEdstEntry";

export type SharedAircraftDto = { aircraftId: AircraftId } & LocalVEdstEntry;
