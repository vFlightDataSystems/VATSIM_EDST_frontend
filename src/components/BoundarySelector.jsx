import React from 'react'

export function BoundarySelector(props){
    return(
        <div class="boundary-selector">
            <div className="boundary-selector-innner">
                <button className="close-btn" onClick={() => props.changer(false)}>Close</button>
                <button className="save-btn" onClick={() => props.updatePolygon()}>Save</button>
                <h1>Pick your sectors</h1>
                <ul>
                    {props.boundaries.map((name) => {
                        return(
                            <li><label><input type="checkbox" onChange={() => props.updateSelected(name)} value={name}/> {name}</label></li>
                        )
                    })}
                </ul>
                {props.children}
            </div>
        </div>
    );
}