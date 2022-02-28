import {EdstTooltip} from "../../resources/EdstTooltip";
import React from "react";


export const EquipmentCommTemplate: React.FC = () => {
  return (<div>
    <div className="options-row eqp-comm-row margin-top">
      <div className="eqp-col eqp-comm-col">
        <div className="eqp-template-row col-title eqp-col-title">
          VOICE CATEGORY
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            H
          </EdstTooltip>
          (HF)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            V
          </EdstTooltip>
          (VHF)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            U
          </EdstTooltip>
          (UHF)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            Y
          </EdstTooltip>
          (8.33 KHZ)
        </div>
      </div>
      <div className="eqp-col eqp-comm-col">
        <div className="eqp-template-row col-title">
          CPDLC CATEGORY
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            J1
          </EdstTooltip>
          (ATN VDL MODE 2)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            J2
          </EdstTooltip>
          (FANS1/A HF)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            J3
          </EdstTooltip>
          (FANS1/A VDL MODE A)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            J4
          </EdstTooltip>
          (FANS1/A VDL MODE 2)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            J5
          </EdstTooltip>
          (FANS1/A INMARSAT)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            J6
          </EdstTooltip>
          (FANS1/A MTSAT)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            J7
          </EdstTooltip>
          (FANS1/A IRIDIUM)
        </div>
      </div>
      <div className="eqp-col eqp-comm-col">
        <div className="eqp-template-row col-title eqp-col-title">
          ACARS CATEGORY
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            E1
          </EdstTooltip>
          (FMCWPR)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            E2
          </EdstTooltip>
          (D-FIS)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            E3
          </EdstTooltip>
          (PDC)
        </div>
      </div>
      <div className="eqp-col eqp-comm-col">
        <div className="eqp-template-row col-title eqp-col-title">
          SATELLITE RTF
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            M1
          </EdstTooltip>
          (INMARSAT)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            M2
          </EdstTooltip>
          (MTSAT)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn">
            <div className={`button-indicator`}/>
            M3
          </EdstTooltip>
          (IRIDIUM)
        </div>
      </div>
    </div>
    <div className="eqp-template-row bottom-row">
      DAT/
      <div className="input-container flex">
        <input/>
      </div>
    </div>
    <div className="eqp-template-row bottom-row">
      COM/
      <div className="input-container flex">
        <input/>
      </div>
    </div>
  </div>);
};