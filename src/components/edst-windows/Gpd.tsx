import React, {useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/gpd-styles.scss';
import {useAppSelector} from "../../redux/hooks";
import {draggingSelector} from "../../redux/slices/appSlice";
import {useFocused} from "../../hooks";
import {GpdHeader} from "./gpd-components/GpdHeader";
import {GpdBody} from "./gpd-components/GpdBody";

export const Gpd: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const dragging = useAppSelector(draggingSelector);
  const [zoomLevel, setZoomLevel] = useState(6);

  return (<div
    ref={ref}
    className={`gpd ${dragging ? 'dragging' : ''}`}
  >
    <GpdHeader focused={focused} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel}/>
    <GpdBody zoomLevel={zoomLevel}/>
  </div>);
}
