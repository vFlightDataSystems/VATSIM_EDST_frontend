import React, { useState } from "react";
import { FloatingWindow } from "components/utils/FloatingWindow";
import { outageSelector } from "~redux/slices/appSlice";
import { useRootSelector } from "~redux/hooks";

export const Outage = () => {
  const [showOptions, setShowOptions] = useState(false);
  const outages = useRootSelector(outageSelector);

  return (
    <FloatingWindow title="OUTAGE" optionsHeaderTitle="OUTAGE" width="40ch" window="OUTAGE" showOptions={showOptions} setShowOptions={setShowOptions}>
      {outages.length === 0 && <p>NO OUTAGES</p>}
      {outages.map((o) => (
        <p key={o.id}>{o.message}</p>
      ))}
    </FloatingWindow>
  );
};
