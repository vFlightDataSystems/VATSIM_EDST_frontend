import React from "react";
import { EdstWindow } from "enums/edstWindow";
import { PlansDisplayHeader } from "components/PlansDisplayHeader";
import { PlansDisplayTable } from "components/PlansDisplayTable";
import { FullscreenWindow } from "components/utils/FullscreenWindow";

export const PlansDisplay = () => (
  <FullscreenWindow edstWindow={EdstWindow.PLANS_DISPLAY} HeaderComponent={PlansDisplayHeader} BodyComponent={PlansDisplayTable} />
);
