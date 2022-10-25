import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { useRootSelector } from "../../../redux/hooks";
import { aselEntrySelector } from "../../../redux/slices/entrySlice";
import { EquipmentTemplateBodyProps, EquipmentTemplateRow } from "./EquipmentTemplateMenu";
import { OptionsBodyRow, OptionIndicator, OptionIndicatorCircle } from "../../../styles/optionMenuStyles";
import { EqpInput, EqpRow, EqpColTitle, EqpInputRow, EqpCol, EqpInputContainer60 } from "./EqpStyled";
import { borderHover } from "../../../styles/styles";
import { Nullable } from "../../../typeDefinitions/utility-types";
import { isEnum } from "../../../utility-functions";

const ContentCol = styled.div`
  justify-content: left;
  align-items: center;
  display: inline-flex;
  flex-grow: 0;
  border: 1px solid transparent;
  padding: 1px 6px;
  text-indent: 0;

  ${borderHover}
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

export const EquipmentSurvTemplate = ({ setReset }: EquipmentTemplateBodyProps) => {
  const entry = useRootSelector(aselEntrySelector);
  const [transponderCategory, setTransponderCategory] = useState<Nullable<TransponderCat>>(null);
  const [adsbBType, setAdsbBType] = useState<Nullable<AdsbB>>(null);
  const [adsbUType, setAdsbUType] = useState<Nullable<AdsbU>>(null);
  const [adsbVType, setAdsbVType] = useState<Nullable<AdsbV>>(null);

  useEffect(() => {
    const field10b = entry?.icaoSurveillanceCodes?.match(/[A-Z]\d?/g);

    const transponderType = field10b?.[0];

    const transponderCategory = transponderType && isEnum(TransponderCat)(transponderType) ? transponderType : null;
    const adsbBInitialType = (Object.values(AdsbB).filter(t => field10b?.includes(t))?.[0] as AdsbB | undefined) ?? null;
    const adsbUInitialType = (Object.values(AdsbU).filter(t => field10b?.includes(t))?.[0] as AdsbU | undefined) ?? null;
    const adsbVInitialType = (Object.values(AdsbV).filter(t => field10b?.includes(t))?.[0] as AdsbV | undefined) ?? null;

    const reset = () => {
      setTransponderCategory(transponderCategory);
      setAdsbBType(adsbBInitialType);
      setAdsbUType(adsbUInitialType);
      setAdsbVType(adsbVInitialType);
    };

    setReset(reset);
    reset();
  }, [entry?.icaoSurveillanceCodes, setReset]);

  return (
    <>
      <OptionsBodyRow margin="10px 0 0 0">
        <EqpCol>
          <EqpColTitle>TRANSPONDER CATEGORY</EqpColTitle>
          <EqpRow>
            <EdstTooltip title={Tooltips.equipmentTemplateMenuSurv_NoXpdr} onMouseDown={() => setTransponderCategory(null)}>
              <ContentCol>
                <OptionIndicatorCircle selected={transponderCategory === null} />
                No Transponder
              </ContentCol>
            </EdstTooltip>
          </EqpRow>
          {Object.values(TransponderCat).map(category => (
            <EquipmentTemplateRow
              circle
              key={`transponder-type-row-${category}`}
              buttonText={category}
              text={transponderCatText[category]}
              tooltip={Tooltips[`equipmentTemplateMenuSurv_${category}`]}
              selected={transponderCategory === category}
              toggleSelect={() => setTransponderCategory(category)}
            />
          ))}
        </EqpCol>
        <EqpCol width="23ch">
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
                <OptionIndicator />
                260B (1090)
              </ContentCol>
            </EdstTooltip>
          </EqpRow>
          <EqpRow margin="18px 0">
            <EdstTooltip title={Tooltips.equipmentTemplateMenuSurv_262b}>
              <ContentCol>
                <OptionIndicator />
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
    </>
  );
};
