import type { OutageType } from "types/outageType";

export type OutageEntry = {
  message: string;
  outageType: OutageType;
  canDelete: boolean;
  acknowledged: boolean;
};
