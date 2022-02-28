import React, {useContext, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/floating-window-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {windowEnum} from "../../enums";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {closeWindow, windowPositionSelector} from "../../redux/slices/appSlice";
import {sigmetSelector} from "../../redux/slices/weatherSlice";

export const SigmetWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const pos = useAppSelector(windowPositionSelector(windowEnum.sigmets));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<{ x: number, y: number, w: number } | null>(null);
  const sigmetList = useAppSelector(sigmetSelector);
  // const [deltaY, setDeltaY] = useState(0);
  const {startDrag} = useContext(EdstContext);
  const ref = useRef(null);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>, airport: string) => {
    if (selected !== airport) {
      setSelected(airport);
      setSelectedPos({
        x: event.currentTarget.offsetLeft,
        y: event.currentTarget.offsetTop,
        w: event.currentTarget.offsetWidth
      });
    } else {
      setSelected(null);
      setSelectedPos(null);
    }
  };

  return pos && (<div className="floating-window sigmet-window"
                      ref={ref}
                      id="edst-status"
                      style={{left: pos.x + "px", top: pos.y + "px"}}
    >
      <div className="floating-window-header no-select">
        <div className="floating-window-header-left">
          M
        </div>
        <div className="floating-window-header-middle"
             onMouseDown={(event) => startDrag(event, ref, windowEnum.sigmets)}
        >
          SIGMETS
        </div>
        <div className="floating-window-header-right" onMouseDown={() => dispatch(closeWindow(windowEnum.sigmets))}>
          <div className="floating-window-header-block-6-2"/>
        </div>
      </div>
      {Object.values(sigmetList).length > 0 && <div className="floating-window-body scroll-container sigmet-scroll-container">
        {Object.entries(sigmetList).map(([sigmetId, sigmetEntry]) =>
          <span className="floating-window-outer-row sigmet" key={`sigmet-list-key-${sigmetId}`}>
            <div className={`floating-window-row no-select margin ${selected === sigmetId ? 'selected' : ''}`}
                 onMouseDown={(event) => handleMouseDown(event, sigmetId)}
            >
              {sigmetEntry.sigmetString}
            </div>
            {selected === sigmetId && selectedPos &&
            <div className="delete-button no-select"
                 onMouseDown={() => {
                   // dispatch(removeAirportMetar(airport));
                   setSelected(null);
                   setSelectedPos(null);
                 }}
                 style={{left: (selectedPos.x + selectedPos.w) + "px", top: selectedPos.y + "px"}}
            >
              SUPPRESS
            </div>}
          </span>)}
      </div>}
    </div>
  );
};