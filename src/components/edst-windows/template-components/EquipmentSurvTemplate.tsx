import {EdstTooltip} from "../../resources/EdstTooltip";
import React, {useState} from "react";
import {Tooltips} from "../../../tooltips";
import {useRootSelector} from "../../../redux/hooks";
import {aselEntrySelector} from "../../../redux/slices/entriesSlice";
import {EquipmentTemplateRow} from "./EquipmentTemplateMenu";
import {OptionsBodyRow, OptionSelectedIndicator} from "../../../styles/optionMenuStyles";
import styled from "styled-components";
import {EqpInput, EqpInputContainer, EqpRow, EqpColTitle, EqpInputRow, EqpCol} from "./styled";

const ContentCol = styled.div`
  justify-content: left;
  align-items: center;
  display: inline-flex;
  flex-grow: 0;
  border: 1px solid transparent;
  padding: 1px 6px;
  text-indent: 0;
  
  &:hover {
    border: 1px solid #ADADAD;
  }
`;

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
  const entry = useRootSelector(aselEntrySelector);
  const field10b = (entry?.flightplan?.aircraft as string)?.split('/')?.slice(2)?.[0]?.match(/[A-Z]\d?/g);

  const transponderType = field10b?.[0];
  const [transponderCategory, setTransponderCategory] = useState<TransponderCatEnum | null>(
    transponderType && Object.keys(TransponderCatEnum).includes(transponderType) ? transponderType as TransponderCatEnum : null);
  const adsbBInitialType = Object.keys(AdsbBTypeEnum).filter(t => field10b?.includes(t))?.[0];
  const adsbUInitialType = Object.keys(AdsbUTypeEnum).filter(t => field10b?.includes(t))?.[0];
  const adsbVInitialType = Object.keys(AdsbVTypeEnum).filter(t => field10b?.includes(t))?.[0];
  const [adsbBType, setAdsbBType] = useState<AdsbBTypeEnum | null>(adsbBInitialType as AdsbBTypeEnum ?? null);
  const [adsbUType, setAdsbUType] = useState<AdsbUTypeEnum | null>(adsbUInitialType as AdsbUTypeEnum ?? null);
  const [adsbVType, setAdsbVType] = useState<AdsbVTypeEnum | null>(adsbVInitialType as AdsbVTypeEnum ?? null);

  return (<div>
      <OptionsBodyRow margin="10px 0 0 0">
        <EqpCol>
          <EqpColTitle>
            TRANSPONDER CATEGORY
          </EqpColTitle>
          <EqpRow>
            <EdstTooltip title={Tooltips.equipmentTemplateMenuSurv_NoXpdr}
                         onMouseDown={() => setTransponderCategory(null)}
            >
              <ContentCol>
                <OptionSelectedIndicator selected={transponderCategory === null} circle={true}/>
                No Transponder
              </ContentCol>

            </EdstTooltip>
          </EqpRow>
          {Object.keys(TransponderCatEnum).map((category) =>
            <EquipmentTemplateRow
              circle={true}
              key={`transponder-type-row-${category}`}
              buttonText={category}
              text={transponderCatText[category as TransponderCatEnum]}
              tooltip={Tooltips[`equipmentTemplateMenuSurv_${category as TransponderCatEnum}`]}
              selected={transponderCategory === (category as TransponderCatEnum)}
              toggleSelect={() => setTransponderCategory(category as TransponderCatEnum)}
            />
          )}
        </EqpCol>
        <EqpCol>
          <EqpColTitle>
            ADS-B CATEGORY
          </EqpColTitle>
          <EquipmentTemplateRow
            circle={true}
            key={`adsb-b-type-row-no-b`}
            buttonText="No 1090"
            tooltip={Tooltips.equipmentTemplateMenuSurv_No1090}
            selected={adsbBType === null}
            toggleSelect={() => setAdsbBType(null)}
          />
          <EquipmentTemplateRow
            circle={true}
            key={`adsb-b-type-row-b1`}
            buttonText="B1"
            text="(1090 OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_B1}
            selected={adsbBType === AdsbBTypeEnum.B1}
            toggleSelect={() => setAdsbBType(AdsbBTypeEnum.B1)}
          />
          <EquipmentTemplateRow
            circle={true}
            key={`adsb-b-type-row-b2`}
            buttonText="B2"
            text="(1090 IN/OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_B2}
            selected={adsbBType === AdsbBTypeEnum.B2}
            toggleSelect={() => setAdsbBType(AdsbBTypeEnum.B2)}
          />
          <EquipmentTemplateRow
            margin="10px 0 0 0"
            circle={true}
            key={`adsb-b-type-row-no-uat`}
            buttonText="No UAT"
            tooltip={Tooltips.equipmentTemplateMenuSurv_NoUat}
            selected={adsbUType === null}
            toggleSelect={() => setAdsbUType(null)}
          />
          <EquipmentTemplateRow
            circle={true}
            key={`adsb-b-type-row-u1`}
            buttonText="U1"
            text="(UAT OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_U1}
            selected={adsbUType === AdsbUTypeEnum.U1}
            toggleSelect={() => setAdsbUType(AdsbUTypeEnum.U1)}
          />
          <EquipmentTemplateRow
            circle={true}
            key={`adsb-b-type-row-u2`}
            buttonText="U2"
            text="(UAT IN/OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_U2}
            selected={adsbUType === AdsbUTypeEnum.U2}
            toggleSelect={() => setAdsbUType(AdsbUTypeEnum.U2)}
          />
          <EquipmentTemplateRow
            margin="10px 0 0 0"
            circle={true}
            key={`adsb-b-type-row-no-vdl`}
            buttonText="No VDL"
            tooltip={Tooltips.equipmentTemplateMenuSurv_NoVdl}
            selected={adsbVType === null}
            toggleSelect={() => setAdsbVType(null)}
          />
          <EquipmentTemplateRow
            circle={true}
            key={`adsb-b-type-row-v1`}
            buttonText="V1"
            text="(VDL OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_V1}
            selected={adsbVType === AdsbVTypeEnum.V1}
            toggleSelect={() => setAdsbVType(AdsbVTypeEnum.V1)}
          />
          <EquipmentTemplateRow
            circle={true}
            key={`adsb-b-type-row-v2`}
            buttonText="V2"
            text="(VDL IN/OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_V2}
            selected={adsbVType === AdsbVTypeEnum.V2}
            toggleSelect={() => setAdsbVType(AdsbVTypeEnum.V2)}
          />
        </EqpCol>
        <EqpCol>
          <EqpColTitle>
            ADS-B<br/> CERTIFICATION
          </EqpColTitle>
          <EqpRow margin="18px 0">
            <EdstTooltip title={Tooltips.equipmentTemplateMenuSurv_260b}>
              <ContentCol>
                <OptionSelectedIndicator/>
                260B (1090)
              </ContentCol>

            </EdstTooltip>
          </EqpRow>
          <EqpRow margin="18px 0" >
            <EdstTooltip title={Tooltips.equipmentTemplateMenuSurv_262b}>
              <ContentCol>
                <OptionSelectedIndicator/>
                282B (UAT)
              </ContentCol>
            </EdstTooltip>
          </EqpRow>
        </EqpCol>
      </OptionsBodyRow>
      <EqpInputRow>
        SUR/
        <EdstTooltip style={{display: "flex", justifyContent: "left", flexGrow: "1"}} title={Tooltips.equipmentTemplateMenuSurv_Sur}>
          <EqpInputContainer width="60%">
            <EqpInput value={`${transponderCategory ?? ''}${adsbBType ?? ''}${adsbUType ?? ''}${adsbVType ?? ''}`}
                      onChange={() => {}}
            />
          </EqpInputContainer>
        </EdstTooltip>
      </EqpInputRow>
    </div>
  );
};