import React from "react";
import {useAppSelector} from "../../../redux/hooks";
import {entrySelector} from "../../../redux/slices/entriesSlice";

type GpdDataBlockProps = {
  cid: string
}

export const GpdDataBlock: React.FC<GpdDataBlockProps> = ({cid}) => {
  const entry = useAppSelector(entrySelector(cid));

  return <div/>
}