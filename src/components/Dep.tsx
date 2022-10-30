import React from "react";
import { EdstWindow } from "enums/edstWindow";
import { DepTable } from "components/DepTable";
import { DepHeader } from "components/DepHeader";
import { FullscreenWindow } from "components/utils/FullscreenWindow";

export const Dep = () => <FullscreenWindow edstWindow={EdstWindow.DEP} HeaderComponent={DepHeader} BodyComponent={DepTable} />;
