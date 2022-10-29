import type { ApiEramConfiguration } from "./apiEramConfiguration";
import type { Nullable } from "../utility-types";

export type ApiControllerPosition = {
  callsign: string;
  eramConfiguration: Nullable<ApiEramConfiguration>;
  frequency: number;
  id: string;
  name: string;
  radioName: string;
};
