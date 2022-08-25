import { OutageType } from "../enums/outageType";

export type OutageEntry = {
  message: string;
  outageType: OutageType;
  canDelete: boolean;
  acknowledged: boolean;
};
