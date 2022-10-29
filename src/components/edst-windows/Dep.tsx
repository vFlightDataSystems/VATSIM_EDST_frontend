import React from "react";
import { EdstWindow } from "enums/edstWindow";
import { FullscreenWindow } from "../utils/FullscreenWindow";
import { DepTable } from "./dep-components/DepTable";
import { DepHeader } from "./dep-components/DepHeader";

export const Dep = () => <FullscreenWindow edstWindow={EdstWindow.DEP} HeaderComponent={DepHeader} BodyComponent={DepTable} />;
