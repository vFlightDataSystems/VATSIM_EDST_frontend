import {EdstTooltip} from "../../resources/EdstTooltip";
import React from "react";


export const EquipmentSurvTemplate: React.FC = () => {
  return (<div>
      <div className="options-row margin-top">
        <div className="eqp-col">
          <div className="eqp-template-row col-title">
            TRANSPONDER CATEGORY
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              No Transponder
            </EdstTooltip>
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              A
            </EdstTooltip>
            (MODE A WITH NO MODE C)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              C
            </EdstTooltip>
            (MODE A WITH MODE C)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              X
            </EdstTooltip>
            (MODE S ONLY)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              P
            </EdstTooltip>
            (MODE S & PRESSURE ALTITUDE)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              I
            </EdstTooltip>
            (MODE S & ACID TRANSMISSION)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              S
            </EdstTooltip>
            (MODE S & ACID & PRESSURE ALTITUDE)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              H
            </EdstTooltip>
            (MODE S & ACID TRANSMISSION & ENHANCED)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              L
            </EdstTooltip>
            (MODE S & ACID & PRESSURE ALTITUDE & ENHANCED)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              E
            </EdstTooltip>
            (MODE S & ACID & PRESSURE ALTITUDE & EXTENDED SQUITTER)
          </div>
        </div>
        <div className="eqp-col">
          <div className="eqp-template-row col-title">
            ADS-B CATEGORY
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator selected`}/>
              No 1090
            </EdstTooltip>
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              B1 (1090 OUT)
            </EdstTooltip>
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              B2 (1090 IN/OUT)
            </EdstTooltip>
          </div>
          <div className="eqp-template-row margin-top">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator selected`}/>
               No UAT
            </EdstTooltip>
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              U1 (UAT OUT)
            </EdstTooltip>
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              U2 (UAT IN/OUT)
            </EdstTooltip>
          </div>
          <div className="eqp-template-row margin-top">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator selected`}/>
              No VDL
            </EdstTooltip>
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              V1 (VDL OUT)
            </EdstTooltip>
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              V2 (VDL IN/OUT)
            </EdstTooltip>
          </div>
        </div>
        <div className="eqp-col">
          <div className="eqp-template-row col-title">
            ADS-B<br/> CERTIFICATION
          </div>
          <div className="eqp-template-row margin">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              260B (1090)
            </EdstTooltip>
          </div>
          <div className="eqp-template-row margin">
            <EdstTooltip className="eqp-content-col btn">
              <div className={`button-indicator`}/>
              282B (UAT)
            </EdstTooltip>
          </div>
        </div>
      </div>
      <div className="eqp-template-row bottom-row">
        SUR/
        <div className="input-container flex">
          <input/>
        </div>
      </div>
    </div>
  );
};