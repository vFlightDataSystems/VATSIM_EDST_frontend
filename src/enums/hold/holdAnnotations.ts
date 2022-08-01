import { TurnDirection } from "./turnDirection";
import { CompassDirection } from "./compassDirection";

export type HoldAnnotations = {
  isPresentPosition: boolean;
  fix: string;
  direction: CompassDirection;
  turns: TurnDirection;
  // null for STD
  legLength: number | null;
  legLengthInNm: boolean;
  efcTime: number;
};
