import React from "react";
import { PlansDisplayHeader } from "./plans-display-components/PlansDisplayHeader";
import { PlansDisplayTable } from "./plans-display-components/PlansDisplayTable";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { FullscreenWindow } from "./FullscreenWindow";

export const PlansDisplay = () => (
  <FullscreenWindow edstWindow={EdstWindow.PLANS_DISPLAY} HeaderComponent={PlansDisplayHeader} BodyComponent={PlansDisplayTable} />
);
