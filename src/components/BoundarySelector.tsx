import React from 'react';
import '../css/boundary-selector.scss';
import {EdstButton} from "./resources/EdstButton";

// Create new boundary-selector css file and import it here.
interface BoundarySelectorProps {
  boundary_ids: string[];
  updateSelected: (name: string) => void;
  toggle: (bool: boolean) => void;
  updatePolygons: () => void;
}

export const BoundarySelector: React.FC<BoundarySelectorProps> = (props) => {
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
            {Object.entries(props.boundary_ids).map(([index, name]) => {
              return (
                [
                  <input type="checkbox" className="checkbox-effect checkbox-effect-2"
                         onChange={() => props.updateSelected(name)} id={index} value={name} name={name}/>,
                  <label htmlFor={index}>{name}</label>
                ]
              );
            })}
          </div>
        </form>
        {/*<button className="close-btn" onClick={() => props.changer(false)}>Close</button>*/}
        <EdstButton className="no-select" content="Save" onMouseDown={() => {
          props.updatePolygons();
          props.toggle(false);
        }}/>
      </div>
    </div>
  );
};