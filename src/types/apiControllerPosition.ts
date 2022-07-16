import { ApiEramConfiguration } from "./apiEramConfiguration";

export type ApiControllerPosition = {
  callsign: string;
  eramConfiguration: ApiEramConfiguration | null;
  frequency: number;
  id: string;
  name: string;
  radioName: string;
};
