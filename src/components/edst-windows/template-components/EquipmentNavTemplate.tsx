import {EdstTooltip} from "../../resources/EdstTooltip";
import React from "react";


export const EquipmentNavTemplate: React.FC = () => {
  return (<div>
      <div className="options-row margin-top">
        <div className="eqp-col">
          <div className="eqp-template-row col-title">
            NAVAIDS
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              F
            </EdstTooltip>
            (ADF)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              O
            </EdstTooltip>
            (VOR)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              D
            </EdstTooltip>
            (DME)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              T
            </EdstTooltip>
            (TACAN)
          </div>
        </div>
        <div className="eqp-col">
          <div className="eqp-template-row col-title">
            RNAV
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              G
            </EdstTooltip>
            (GPS/GNSS)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              I
            </EdstTooltip>
            (INS)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              C
            </EdstTooltip>
            (LORAN C)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              R
            </EdstTooltip>
            (PBN APPROVED)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              X
            </EdstTooltip>
            (MNPS APPROVED)
          </div>
        </div>
        <div className="eqp-col">
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator circle`}/>
              RNAV
            </EdstTooltip>
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator circle`}/>
              RNP
            </EdstTooltip>
          </div>
          <div className="eqp-template-row">
            <div className="input-container small">
              <input/>
            </div>
            D (DEPARTURE)
          </div>
          <div className="eqp-template-row">
            <div className="input-container small">
              <input/>
            </div>
            E (EN ROUTE)
          </div>
          <div className="eqp-template-row">
            <div className="input-container small">
              <input/>
            </div>
            A (ARRIVAL)
          </div>
          <div className="eqp-template-row">
            <div className="input-container small">
              <input/>
            </div>
            G (GLOBAL/OCEAN)
          </div>
          <div className="eqp-template-row">
            <div className="input-container small">
              <input/>
            </div>
            L (LANDING)
          </div>
          <div className="eqp-template-row">
            <div className="input-container small">
              <input/>
            </div>
            S (SPECIAL)
          </div>
        </div>
        <div className="eqp-col">
          <div className="eqp-template-row col-title">
            RVSM
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              W
            </EdstTooltip>
            (RVSM)
          </div>
        </div>
      </div>
      <div className="eqp-template-row bottom-row">
        NAV/
        <div className="input-container flex">
          <input/>
        </div>
      </div>
    </div>);
};