import React, {useEffect, useRef} from 'react'
import '../css/boundary-selector.scss';

// Create new boundary-selector css file and import it here.

export function BoundarySelector(props){
    return(
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
                        {props.boundaries.map((name, index) => {
                            return(
                                [
                                    <input type="checkbox" className="checkbox-effect checkbox-effect-2" onChange={() => props.updateSelected(name)} id={index} value={name} name={name} />,
                                    <label htmlFor={index}>{name}</label>
                                ]
                            )
                        })}
                    </div>
                </form>
                {/*<button className="close-btn" onClick={() => props.changer(false)}>Close</button>*/}
                <button className="save-btn" onClick={() => {
                    props.updatePolygon()
                    props.changer(false)
                }}>Save</button>
                {props.children}
            </div>
        </div>
    );
}