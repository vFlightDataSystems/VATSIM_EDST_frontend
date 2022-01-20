import React from 'react'

export function BoundarySelector(props){
    return(
        <div class="boundary-selector">
            <div className="boundary-selector-innner">
                <hr style={{color: '#000000', padding: 20, border: 'none'}}/>
                <h1>Pick your sectors</h1>
                <ul>
                    {props.boundaries.map((name, index) => {
                        return(
                            <li key={index}><label><input type="checkbox" onChange={() => props.updateSelected(name)} value={name}/>{name}</label></li>
                        )
                    })}
                </ul>
                <button className="close-btn" onClick={() => props.changer(false)}>Close</button>
                <button className="save-btn" onClick={() => props.updatePolygon()}>Save</button>
                {props.children}
            </div>
        </div>
    );
}