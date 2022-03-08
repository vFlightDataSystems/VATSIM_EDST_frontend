import React from 'react';
import '../css/sector-selector.scss';
import {EdstButton} from "./resources/EdstButton";
import {useAppDispatch, useAppSelector} from "../redux/hooks";
import {toggleSector} from "../redux/slices/sectorSlice";
import {setShowSectorSelector} from "../redux/slices/appSlice";
import {refreshEntriesThunk} from "../redux/slices/entriesSlice";
import {EdstTooltip} from "./resources/EdstTooltip";

export const SectorSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const sectors = useAppSelector((state) => state.sectorData.sectors);
  const selectedSectors = useAppSelector((state) => state.sectorData.selectedSectors);

  return (
    <div className="sector-selector">
      <link
        rel="stylesheet"
        href={"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"}
      />
      <div>
        <hr style={{color: '#000000', padding: 20, border: 'none'}}/>
        <h1>Pick your sectors</h1>
        <form>
          <div className="checkbox-block">
            {Object.entries(sectors).map(([id, sector]) =>
              <EdstTooltip title={sector?.properties?.name} key={`sector-selector-${id}-container`}>
                {[<input key={`sector-selector-${id}-input`} type="checkbox" className="checkbox-effect checkbox-effect-2"
                       onChange={() => dispatch(toggleSector(id))} id={id} value={id} name={id} checked={selectedSectors.includes(id)}
                />,
                <label key={`sector-selector-${id}-label`} htmlFor={id}>{id}</label>]}
              </EdstTooltip>)}
          </div>
        </form>
        <EdstButton className="no-select" content="Save" onMouseDown={() => {
          dispatch(refreshEntriesThunk());
          dispatch(setShowSectorSelector(false));
        }}/>
      </div>
    </div>
  );
};