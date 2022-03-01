import {EdstTooltip} from "../../resources/EdstTooltip";
import React from "react";
import {Tooltips} from "../../../tooltips";


export const EquipmentCommTemplate: React.FC = () => {
  return (<div>
    <div className="options-row eqp-comm-row margin-top">
      <div className="eqp-col eqp-comm-col">
        <div className="eqp-template-row col-title eqp-col-title">
          VOICE CATEGORY
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_H}>
            <div className={`button-indicator`}/>
            H
          </EdstTooltip>
          (HF)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_V}>
            <div className={`button-indicator`}/>
            V
          </EdstTooltip>
          (VHF)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_U}>
            <div className={`button-indicator`}/>
            U
          </EdstTooltip>
          (UHF)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_Y}>
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
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_J1}>
            <div className={`button-indicator`}/>
            J1
          </EdstTooltip>
          (ATN VDL MODE 2)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_J2}>
            <div className={`button-indicator`}/>
            J2
          </EdstTooltip>
          (FANS1/A HF)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_J3}>
            <div className={`button-indicator`}/>
            J3
          </EdstTooltip>
          (FANS1/A VDL MODE A)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_J4}>
            <div className={`button-indicator`}/>
            J4
          </EdstTooltip>
          (FANS1/A VDL MODE 2)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_J5}>
            <div className={`button-indicator`}/>
            J5
          </EdstTooltip>
          (FANS1/A INMARSAT)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_J6}>
            <div className={`button-indicator`}/>
            J6
          </EdstTooltip>
          (FANS1/A MTSAT)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_J7}>
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
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_E1}>
            <div className={`button-indicator`}/>
            E1
          </EdstTooltip>
          (FMCWPR)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_E2}>
            <div className={`button-indicator`}/>
            E2
          </EdstTooltip>
          (D-FIS)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_E3}>
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
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_M1}>
            <div className={`button-indicator`}/>
            M1
          </EdstTooltip>
          (INMARSAT)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_M2}>
            <div className={`button-indicator`}/>
            M2
          </EdstTooltip>
          (MTSAT)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuComm_M3}>
            <div className={`button-indicator`}/>
            M3
          </EdstTooltip>
          (IRIDIUM)
        </div>
      </div>
    </div>
    <div className="eqp-template-row bottom-row">
      DAT/
      <EdstTooltip className="input-container flex" title={Tooltips.equipmentTemplateMenuComm_Dat}>
        <input/>
      </EdstTooltip>
    </div>
    <div className="eqp-template-row bottom-row">
      COM/
      <EdstTooltip className="input-container flex" title={Tooltips.equipmentTemplateMenuComm_Com}>
        <input/>
      </EdstTooltip>
    </div>
  </div>);
};