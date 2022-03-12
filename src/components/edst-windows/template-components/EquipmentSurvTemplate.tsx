import {EdstTooltip} from "../../resources/EdstTooltip";
import React, {useState} from "react";
import {Tooltips} from "../../../tooltips";
import {useAppSelector} from "../../../redux/hooks";
import {aselEntrySelector} from "../../../redux/slices/entriesSlice";
import {EquipmentTemplateRow} from "./EquipmentTemplateMenu";

enum TransponderCatEnum {
  A = 'A',
  C = 'C',
  X = 'X',
  P = 'P',
  I = 'I',
  S = 'S',
  H = 'H',
  L = 'L',
  E = 'E'
}

const transponderCatText = {
  A: '(MODE A WITH NO MODE C)',
  C: '(MODE A WITH MODE C)',
  X: '(MODE S ONLY)',
  P: '(MODE S & PRESSURE ALTITUDE)',
  I: '(MODE S & ACID TRANSMISSION)',
  S: '(MODE S & ACID & PRESSURE ALTITUDE)',
  H: '(MODE S & ACID TRANSMISSION & ENHANCED)',
  L: '(MODE S & ACID & PRESSURE ALTITUDE & ENHANCED)',
  E: '(MODE S & ACID & PRESSURE ALTITUDE & EXTENDED SQUITTER)'
}

enum AdsbBTypeEnum {
  B1 = 'B1',
  B2 = 'B2'
}

enum AdsbUTypeEnum {
  U1 = 'U1',
  U2 = 'U2'
}

enum AdsbVTypeEnum {
  V1 = 'V1',
  V2 = 'V2'
}

export const EquipmentSurvTemplate: React.FC = () => {
  const entry = useAppSelector(aselEntrySelector);
  const equipment = (entry?.flightplan?.aircraft as string)?.split('/')?.slice(1);
  const transponderType = equipment?.[1]?.[0];
  const [transponderCategory, setTransponderCategory] = useState<TransponderCatEnum | null>(
    Object.keys(TransponderCatEnum).includes(transponderType) ? transponderType as TransponderCatEnum : null);
  const [adsbBType, setAdsbBType] = useState<AdsbBTypeEnum | null>(null);
  const [adsbUType, setAdsbUType] = useState<AdsbUTypeEnum | null>(null);
  const [adsbVType, setAdsbVType] = useState<AdsbVTypeEnum | null>(null);

  return (<div>
      <div className="options-row margin-top">
        <div className="eqp-col">
          <div className="eqp-template-row col-title">
            TRANSPONDER CATEGORY
          </div>
          <div className="eqp-template-row">
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuSurv_NoXpdr}
                         onMouseDown={() => setTransponderCategory(null)}
            >
              <div
                className={`button-indicator circle ${transponderCategory === null ? 'selected' : ''}`}/>
              No Transponder
            </EdstTooltip>
          </div>
          {Object.keys(TransponderCatEnum).map((category) =>
            <EquipmentTemplateRow
              buttonClassName="circle"
              key={`transponder-type-row-${category}`}
              buttonText={category}
              text={transponderCatText[category as TransponderCatEnum]}
              tooltip={Tooltips[`equipmentTemplateMenuSurv_${category as TransponderCatEnum}`]}
              selected={transponderCategory === (category as TransponderCatEnum)}
              toggleSelect={() => setTransponderCategory(category as TransponderCatEnum)}
            />
          )}
        </div>
        <div className="eqp-col">
          <div className="eqp-template-row col-title">
            ADS-B CATEGORY
          </div>
          <EquipmentTemplateRow
            buttonClassName="circle"
            key={`adsb-b-type-row-no-b`}
            buttonText="No 1090"
            tooltip={Tooltips.equipmentTemplateMenuSurv_No1090}
            selected={adsbBType === null}
            toggleSelect={() => setAdsbBType(null)}
          />
          <EquipmentTemplateRow
            buttonClassName="circle"
            key={`adsb-b-type-row-b1`}
            buttonText="B1"
            text="(1090 OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_B1}
            selected={adsbBType === AdsbBTypeEnum.B1}
            toggleSelect={() => setAdsbBType(AdsbBTypeEnum.B1)}
          />
          <EquipmentTemplateRow
            buttonClassName="circle"
            key={`adsb-b-type-row-b2`}
            buttonText="B2"
            text="(1090 IN/OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_B2}
            selected={adsbBType === AdsbBTypeEnum.B2}
            toggleSelect={() => setAdsbBType(AdsbBTypeEnum.B2)}
          />
          <EquipmentTemplateRow
            rowClassName="margin-top"
            buttonClassName="circle"
            key={`adsb-b-type-row-no-uat`}
            buttonText="No UAT"
            tooltip={Tooltips.equipmentTemplateMenuSurv_NoUat}
            selected={adsbUType === null}
            toggleSelect={() => setAdsbUType(null)}
          />
          <EquipmentTemplateRow
            buttonClassName="circle"
            key={`adsb-b-type-row-u1`}
            buttonText="U1"
            text="(UAT OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_U1}
            selected={adsbUType === AdsbUTypeEnum.U1}
            toggleSelect={() => setAdsbUType(AdsbUTypeEnum.U1)}
          />
          <EquipmentTemplateRow
            buttonClassName="circle"
            key={`adsb-b-type-row-u2`}
            buttonText="U2"
            text="(UAT IN/OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_U2}
            selected={adsbUType === AdsbUTypeEnum.U2}
            toggleSelect={() => setAdsbUType(AdsbUTypeEnum.U2)}
          />
          <EquipmentTemplateRow
            rowClassName="margin-top"
            buttonClassName="circle"
            key={`adsb-b-type-row-no-vdl`}
            buttonText="No VDL"
            tooltip={Tooltips.equipmentTemplateMenuSurv_NoVdl}
            selected={adsbVType === null}
            toggleSelect={() => setAdsbVType(null)}
          />
          <EquipmentTemplateRow
            buttonClassName="circle"
            key={`adsb-b-type-row-v1`}
            buttonText="V1"
            text="(VDL OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_V1}
            selected={adsbVType === AdsbVTypeEnum.V1}
            toggleSelect={() => setAdsbVType(AdsbVTypeEnum.V1)}
          />
          <EquipmentTemplateRow
            buttonClassName="circle"
            key={`adsb-b-type-row-v2`}
            buttonText="V2"
            text="(VDL IN/OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_V2}
            selected={adsbVType === AdsbVTypeEnum.V2}
            toggleSelect={() => setAdsbVType(AdsbVTypeEnum.V2)}
          />
        </div>
        <div className="eqp-col">
          <div className="eqp-template-row col-title">
            ADS-B<br/> CERTIFICATION
          </div>
          <div className="eqp-template-row margin">
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuSurv_260b}>
              <div className={`button-indicator`}/>
              260B (1090)
            </EdstTooltip>
          </div>
          <div className="eqp-template-row margin">
            <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuSurv_262b}>
              <div className={`button-indicator`}/>
              282B (UAT)
            </EdstTooltip>
          </div>
        </div>
      </div>
      <div className="eqp-template-row bottom-row">
        SUR/
        <EdstTooltip className="input-container flex" title={Tooltips.equipmentTemplateMenuSurv_Sur}>
          <input/>
        </EdstTooltip>
      </div>
    </div>
  );
};