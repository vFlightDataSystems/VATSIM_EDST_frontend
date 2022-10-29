import React from "react";
import { EdstWindow } from "enums/edstWindow";
import { PlansDisplayHeader } from "./plans-display-components/PlansDisplayHeader";
import { PlansDisplayTable } from "./plans-display-components/PlansDisplayTable";
import { FullscreenWindow } from "../utils/FullscreenWindow";

export const PlansDisplay = () => (
  <FullscreenWindow edstWindow={EdstWindow.PLANS_DISPLAY} HeaderComponent={PlansDisplayHeader} BodyComponent={PlansDisplayTable} />
);
