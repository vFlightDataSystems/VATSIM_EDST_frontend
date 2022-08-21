export type ModifyAircraftDto<T> = {
  sector: string;
  aircraftId: string;
  value: T;
};
