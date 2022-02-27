import React, {createContext} from "react";
import {menuEnum, windowEnum} from "../enums";

type EdstContextProps = {
  startDrag: (event: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<any>, window: windowEnum | menuEnum) => void,
  stopDrag: (event: React.MouseEvent<HTMLDivElement>) => void
}

// @ts-ignore
export const EdstContext = createContext<EdstContextProps>();