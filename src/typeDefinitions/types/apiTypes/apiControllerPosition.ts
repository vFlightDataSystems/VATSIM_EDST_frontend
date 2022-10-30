import type { ApiEramConfiguration } from "types/apiTypes/apiEramConfiguration";
import type { Nullable } from "types/utility-types";

export type ApiControllerPosition = {
  callsign: string;
  eramConfiguration: Nullable<ApiEramConfiguration>;
  frequency: number;
  id: string;
  name: string;
  radioName: string;
};
