import type { Nullable } from "types/utility-types";
import type { TurnDirection } from "./turnDirection";
import type { CompassDirection } from "./compassDirection";

export type HoldAnnotations = {
  fix: Nullable<string>;
  direction: CompassDirection;
  turns: TurnDirection;
  // null for STD
  legLength: Nullable<number>;
  legLengthInNm: boolean;
  efc: number;
};
