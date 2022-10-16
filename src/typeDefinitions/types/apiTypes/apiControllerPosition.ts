import { ApiEramConfiguration } from "./apiEramConfiguration";
import { Nullable } from "../../utility-types";

export type ApiControllerPosition = {
  callsign: string;
  eramConfiguration: Nullable<ApiEramConfiguration>;
  frequency: number;
  id: string;
  name: string;
  radioName: string;
};
