import React from "react";
import { DepTable } from "components/DepTable";
import { DepHeader } from "components/DepHeader";
import { FullscreenWindow } from "components/utils/FullscreenWindow";

export const Dep = () => <FullscreenWindow edstWindow="DEP" HeaderComponent={DepHeader} BodyComponent={DepTable} />;
