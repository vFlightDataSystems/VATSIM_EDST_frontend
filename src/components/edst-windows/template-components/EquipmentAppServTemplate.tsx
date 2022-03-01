import {EdstTooltip} from "../../resources/EdstTooltip";
import React from "react";
import {Tooltips} from "../../../tooltips";


export const EquipmentAppServTemplate: React.FC = () => {
  return (<div>
    <div className="options-row eqp-comm-row margin-top">
      <div className="eqp-col eqp-comm-col">
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuAppServ_L}>
            <div className={`button-indicator`}/>
            L
          </EdstTooltip>
          (ILS)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuAppServ_K}>
            <div className={`button-indicator`}/>
            K
          </EdstTooltip>
          (MLS)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuAppServ_A}>
            <div className={`button-indicator`}/>
            A
          </EdstTooltip>
          (GBAS)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuAppServ_B}>
            <div className={`button-indicator`}/>
            B
          </EdstTooltip>
          (LPV)
        </div>
      </div>
      <div className="eqp-col eqp-comm-col">
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuAppServ_S}>
            <div className={`button-indicator`}/>
            S
          </EdstTooltip>
          (STANDARD)
        </div>
      </div>
    </div>
  </div>);
};