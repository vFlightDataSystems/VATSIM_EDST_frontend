import React, { useState } from "react";
import styled from "styled-components";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { useRootSelector } from "../../../redux/hooks";
import { aselEntrySelector } from "../../../redux/slices/entrySlice";
import { EquipmentTemplateRow } from "./EquipmentTemplateMenu";
import { OptionsBodyRow, OptionSelectedIndicator } from "../../../styles/optionMenuStyles";
import { EqpInput, EqpRow, EqpColTitle, EqpInputRow, EqpCol, EqpInputContainer60 } from "./EqpStyled";

const ContentCol = styled.div`
  justify-content: left;
  align-items: center;
  display: inline-flex;
  flex-grow: 0;
  border: 1px solid transparent;
  padding: 1px 6px;
  text-indent: 0;

  &:hover {
    border: 1px solid #adadad;
  }
`;

enum TransponderCat {
  A = "A",
  C = "C",
  X = "X",
  P = "P",
  I = "I",
  S = "S",
  H = "H",
  L = "L",
  E = "E"
}

const transponderCatText = {
  A: "(MODE A WITH NO MODE C)",
  C: "(MODE A WITH MODE C)",
  X: "(MODE S ONLY)",
  P: "(MODE S & PRESSURE ALTITUDE)",
  I: "(MODE S & ACID TRANSMISSION)",
  S: "(MODE S & ACID & PRESSURE ALTITUDE)",
  H: "(MODE S & ACID TRANSMISSION & ENHANCED)",
  L: "(MODE S & ACID & PRESSURE ALTITUDE & ENHANCED)",
  E: "(MODE S & ACID & PRESSURE ALTITUDE & EXTENDED SQUITTER)"
};

enum AdsbB {
  B1 = "B1",
  B2 = "B2"
}

enum AdsbU {
  U1 = "U1",
  U2 = "U2"
}

enum AdsbV {
  V1 = "V1",
  V2 = "V2"
}

export const EquipmentSurvTemplate = () => {
  const entry = useRootSelector(aselEntrySelector);
  const field10b = entry?.equipment
    ?.split("/")
    ?.slice(2)?.[0]
    ?.match(/[A-Z]\d?/g);

  const transponderType = field10b?.[0];
  const [transponderCategory, setTransponderCategory] = useState<TransponderCat | null>(
    transponderType && Object.keys(TransponderCat).includes(transponderType) ? (transponderType as TransponderCat) : null
  );
  const adsbBInitialType = Object.keys(AdsbB).filter(t => field10b?.includes(t))?.[0];
  const adsbUInitialType = Object.keys(AdsbU).filter(t => field10b?.includes(t))?.[0];
  const adsbVInitialType = Object.keys(AdsbV).filter(t => field10b?.includes(t))?.[0];
  const [adsbBType, setAdsbBType] = useState<AdsbB | null>((adsbBInitialType as AdsbB) ?? null);
  const [adsbUType, setAdsbUType] = useState<AdsbU | null>((adsbUInitialType as AdsbU) ?? null);
  const [adsbVType, setAdsbVType] = useState<AdsbV | null>((adsbVInitialType as AdsbV) ?? null);

  return (
    <div>
      <OptionsBodyRow margin="10px 0 0 0">
        <EqpCol>
          <EqpColTitle>TRANSPONDER CATEGORY</EqpColTitle>
          <EqpRow>
            <EdstTooltip title={Tooltips.equipmentTemplateMenuSurv_NoXpdr} onMouseDown={() => setTransponderCategory(null)}>
              <ContentCol>
                <OptionSelectedIndicator selected={transponderCategory === null} circle />
                No Transponder
              </ContentCol>
            </EdstTooltip>
          </EqpRow>
          {Object.keys(TransponderCat).map(category => (
            <EquipmentTemplateRow
              circle
              key={`transponder-type-row-${category}`}
              buttonText={category}
              text={transponderCatText[category as TransponderCat]}
              tooltip={Tooltips[`equipmentTemplateMenuSurv_${category as TransponderCat}`]}
              selected={transponderCategory === (category as TransponderCat)}
              toggleSelect={() => setTransponderCategory(category as TransponderCat)}
            />
          ))}
        </EqpCol>
        <EqpCol>
          <EqpColTitle>ADS-B CATEGORY</EqpColTitle>
          <EquipmentTemplateRow
            circle
            key="adsb-b-type-row-no-b"
            buttonText="No 1090"
            tooltip={Tooltips.equipmentTemplateMenuSurv_No1090}
            selected={adsbBType === null}
            toggleSelect={() => setAdsbBType(null)}
          />
          <EquipmentTemplateRow
            circle
            key="adsb-b-type-row-b1"
            buttonText="B1"
            text="(1090 OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_B1}
            selected={adsbBType === AdsbB.B1}
            toggleSelect={() => setAdsbBType(AdsbB.B1)}
          />
          <EquipmentTemplateRow
            circle
            key="adsb-b-type-row-b2"
            buttonText="B2"
            text="(1090 IN/OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_B2}
            selected={adsbBType === AdsbB.B2}
            toggleSelect={() => setAdsbBType(AdsbB.B2)}
          />
          <EquipmentTemplateRow
            margin="10px 0 0 0"
            circle
            key="adsb-b-type-row-no-uat"
            buttonText="No UAT"
            tooltip={Tooltips.equipmentTemplateMenuSurv_NoUat}
            selected={adsbUType === null}
            toggleSelect={() => setAdsbUType(null)}
          />
          <EquipmentTemplateRow
            circle
            key="adsb-b-type-row-u1"
            buttonText="U1"
            text="(UAT OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_U1}
            selected={adsbUType === AdsbU.U1}
            toggleSelect={() => setAdsbUType(AdsbU.U1)}
          />
          <EquipmentTemplateRow
            circle
            key="adsb-b-type-row-u2"
            buttonText="U2"
            text="(UAT IN/OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_U2}
            selected={adsbUType === AdsbU.U2}
            toggleSelect={() => setAdsbUType(AdsbU.U2)}
          />
          <EquipmentTemplateRow
            margin="10px 0 0 0"
            circle
            key="adsb-b-type-row-no-vdl"
            buttonText="No VDL"
            tooltip={Tooltips.equipmentTemplateMenuSurv_NoVdl}
            selected={adsbVType === null}
            toggleSelect={() => setAdsbVType(null)}
          />
          <EquipmentTemplateRow
            circle
            key="adsb-b-type-row-v1"
            buttonText="V1"
            text="(VDL OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_V1}
            selected={adsbVType === AdsbV.V1}
            toggleSelect={() => setAdsbVType(AdsbV.V1)}
          />
          <EquipmentTemplateRow
            circle
            key="adsb-b-type-row-v2"
            buttonText="V2"
            text="(VDL IN/OUT)"
            tooltip={Tooltips.equipmentTemplateMenuSurv_V2}
            selected={adsbVType === AdsbV.V2}
            toggleSelect={() => setAdsbVType(AdsbV.V2)}
          />
        </EqpCol>
        <EqpCol>
          <EqpColTitle>
            ADS-B
            <br /> CERTIFICATION
          </EqpColTitle>
          <EqpRow margin="18px 0">
            <EdstTooltip title={Tooltips.equipmentTemplateMenuSurv_260b}>
              <ContentCol>
                <OptionSelectedIndicator />
                260B (1090)
              </ContentCol>
            </EdstTooltip>
          </EqpRow>
          <EqpRow margin="18px 0">
            <EdstTooltip title={Tooltips.equipmentTemplateMenuSurv_262b}>
              <ContentCol>
                <OptionSelectedIndicator />
                282B (UAT)
              </ContentCol>
            </EdstTooltip>
          </EqpRow>
        </EqpCol>
      </OptionsBodyRow>
      <EqpInputRow>
        SUR/
        <EdstTooltip style={{ display: "flex", justifyContent: "left", flexGrow: "1" }} title={Tooltips.equipmentTemplateMenuSurv_Sur}>
          <EqpInputContainer60>
            <EqpInput
              value={`${transponderCategory ?? ""}${adsbBType ?? ""}${adsbUType ?? ""}${adsbVType ?? ""}`}
              // onChange={() => {}}
            />
          </EqpInputContainer60>
        </EdstTooltip>
      </EqpInputRow>
    </div>
  );
};
