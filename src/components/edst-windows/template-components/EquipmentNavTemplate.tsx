import {EdstTooltip} from "../../resources/EdstTooltip";
import React from "react";
import {Tooltips} from "../../../tooltips";


export const EquipmentNavTemplate: React.FC = () => {
  return (<div>
      <div className="options-row margin-top">
        <div className="eqp-col">
          <div className="eqp-template-row col-title">
            NAVAIDS
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_F}>
              <div className={`button-indicator`}/>
              F
            </EdstTooltip>
            (ADF)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_O}>
              <div className={`button-indicator`}/>
              O
            </EdstTooltip>
            (VOR)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_D}>
              <div className={`button-indicator`}/>
              D
            </EdstTooltip>
            (DME)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_T}>
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
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_G}>
              <div className={`button-indicator`}/>
              G
            </EdstTooltip>
            (GPS/GNSS)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_I}>
              <div className={`button-indicator`}/>
              I
            </EdstTooltip>
            (INS)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_C}>
              <div className={`button-indicator`}/>
              C
            </EdstTooltip>
            (LORAN C)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_R}>
              <div className={`button-indicator`}/>
              R
            </EdstTooltip>
            (PBN APPROVED)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_X}>
              <div className={`button-indicator`}/>
              X
            </EdstTooltip>
            (MNPS APPROVED)
          </div>
        </div>
        <div className="eqp-col">
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_Rnav}>
              <div className={`button-indicator circle`}/>
              RNAV
            </EdstTooltip>
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_Rnp}>
              <div className={`button-indicator circle`}/>
              RNP
            </EdstTooltip>
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="input-container small" title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <input/>
            </EdstTooltip>
            D (DEPARTURE)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="input-container small" title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <input/>
            </EdstTooltip>
            E (EN ROUTE)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="input-container small" title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <input/>
            </EdstTooltip>
            A (ARRIVAL)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="input-container small" title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <input/>
            </EdstTooltip>
            G (GLOBAL/OCEAN)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="input-container small" title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <input/>
            </EdstTooltip>
            L (LANDING)
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="input-container small" title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <input/>
            </EdstTooltip>
            S (SPECIAL)
          </div>
        </div>
        <div className="eqp-col">
          <div className="eqp-template-row col-title">
            RVSM
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_W}>
              <div className={`button-indicator`}/>
              W
            </EdstTooltip>
            (RVSM)
          </div>
        </div>
      </div>
      <div className="eqp-template-row bottom-row">
        NAV/
        <EdstTooltip className="input-container flex" title={Tooltips.equipmentTemplateMenuNAV_Nav}>
          <input/>
        </EdstTooltip>
      </div>
    </div>);
};