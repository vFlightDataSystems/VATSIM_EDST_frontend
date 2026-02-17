import { EramPositionType } from "~/types/apiTypes/ProcessEramMessageDto";
import type { HubActions } from "~/hooks/useHubActions";

export const sendEramHeadingOrSpeedMessage = async (
  value: string,
  cid: string,
  invertNumpad: boolean,
  hubActions: HubActions,
  forceOk = false
): Promise<void> => {
  const message = {
    source: EramPositionType.DSide,
    elements: forceOk
      ? [{ token: "QS" }, { token: "/OK" }, { token: value }, { token: cid }]
      : [{ token: "QS" }, { token: value }, { token: cid }],
    invertNumericKeypad: invertNumpad,
  };
  console.log(`Sending` + message)
  await hubActions.sendEramMessage(message);
};
