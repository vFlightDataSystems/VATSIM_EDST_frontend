import React, { useState } from "react";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { FloatingWindow } from "../utils/FloatingWindow";

export const Outage = () => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <FloatingWindow
      title="OUTAGE"
      optionsHeaderTitle="OUTAGE"
      minWidth="340px"
      window={EdstWindow.OUTAGE}
      showOptions={showOptions}
      setShowOptions={setShowOptions}
    >
      OUTAGE TEST
    </FloatingWindow>
  );
};
