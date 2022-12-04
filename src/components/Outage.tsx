import React, { useState } from "react";
import { FloatingWindow } from "components/utils/FloatingWindow";

export const Outage = () => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <FloatingWindow title="OUTAGE" optionsHeaderTitle="OUTAGE" width="40ch" window="OUTAGE" showOptions={showOptions} setShowOptions={setShowOptions}>
      <p>No Outages</p>
    </FloatingWindow>
  );
};
