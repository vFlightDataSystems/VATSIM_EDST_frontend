import React from 'react';
import '../css/boundary-selector.scss';
import {EdstButton} from "./resources/EdstButton";
import {useAppDispatch, useAppSelector} from "../redux/hooks";
import {toggleSector} from "../redux/reducers/sectorReducer";

export const BoundarySelector: React.FC<{ toggle: (v: boolean) => void }> = ({toggle}) => {
  const dispatch = useAppDispatch();
  const sectors = useAppSelector((state) => state.sectorData.sectors);

  return (
    <div className="boundary-selector">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />
      <div className="boundary-selector-innner">
        <hr style={{color: '#000000', padding: 20, border: 'none'}}/>
        <h1>Pick your sectors</h1>
        <form>
          <div className="checkbox-block">
            {Object.keys(sectors).map((id) =>
              [<input key={`boundary-selector-${id}-input`} type="checkbox" className="checkbox-effect checkbox-effect-2"
                      onChange={() => dispatch(toggleSector(id))} id={id} value={id} name={id}
              />,
                <label key={`boundary-selector-${id}-label`} htmlFor={id}>{id}</label>
              ])}
          </div>
        </form>
        {/*<button className="close-btn" onClick={() => props.changer(false)}>Close</button>*/}
        <EdstButton className="no-select" content="Save" onMouseDown={() => {
          toggle(false);
        }}/>
      </div>
    </div>
  );
};