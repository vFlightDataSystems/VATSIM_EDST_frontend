import React from "react";
import { PlansDisplayHeader } from "components/PlansDisplayHeader";
import { PlansDisplayTable } from "components/PlansDisplayTable";
import { FullscreenWindow } from "components/utils/FullscreenWindow";

export const PlansDisplay = () => (
  <FullscreenWindow edstWindow="PLANS_DISPLAY" HeaderComponent={PlansDisplayHeader} BodyComponent={PlansDisplayTable} />
);
