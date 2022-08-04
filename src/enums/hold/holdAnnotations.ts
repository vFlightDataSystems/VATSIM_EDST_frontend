import { TurnDirection } from "./turnDirection";
import { CompassDirection } from "./compassDirection";

export type HoldAnnotations = {
  fix: string | null;
  direction: CompassDirection;
  turns: TurnDirection;
  // null for STD
  legLength: number | null;
  legLengthInNm: boolean;
  efc: number;
};
