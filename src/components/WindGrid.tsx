import React from "react";
import { FullscreenWindow } from "components/utils/FullscreenWindow";
import { WindGridHeader } from "components/wind-grid/WindGridHeader";
import { WindGridBody } from "components/wind-grid/WindGridBody";

export const WindGrid = () => <FullscreenWindow edstWindow="WIND" HeaderComponent={WindGridHeader} BodyComponent={WindGridBody} />;
