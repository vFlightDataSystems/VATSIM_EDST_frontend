import { TurnDirection } from "./turnDirection";
import { CompassDirection } from "./compassDirection";
import { Nullable } from "../../utility-types";

export type HoldAnnotations = {
  fix: Nullable<string>;
  direction: CompassDirection;
  turns: TurnDirection;
  // null for STD
  legLength: Nullable<number>;
  legLengthInNm: boolean;
  efc: number;
};
