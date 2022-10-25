import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { EquipmentTemplateBodyProps, EquipmentTemplateRow } from "./EquipmentTemplateMenu";
import { useRootSelector } from "../../../redux/hooks";
import { aselEntrySelector } from "../../../redux/slices/entrySlice";
import { EqpCol, EqpColTitle, EqpInput, EqpInputContainer60, EqpInputRow } from "./EqpStyled";
import { OptionsBodyRow } from "../../../styles/optionMenuStyles";
import { isEnum } from "../../../utility-functions";

const EqpCol2 = styled(EqpCol)`
  margin: 0 16px;
`;

enum VoiceCat {
  H = "H",
  V = "V",
  U = "U",
  Y = "Y"
}

const voiceCatText = {
  H: "(HF)",
  V: "(VHF)",
  U: "(UHF)",
  Y: "(8.33 kHZ)"
};

enum CpdlcCat {
  J1 = "J1",
  J2 = "J2",
  J3 = "J3",
  J4 = "J4",
  J5 = "J5",
  J6 = "J6",
  J7 = "J7"
}

const cpdlcCatText = {
  J1: "(ATN VDL MODE 2)",
  J2: "(FANS1/A HF)",
  J3: "(FANS1/A VDL MODE A)",
  J4: "(FANS1/A VDL MODE 2)",
  J5: "(FANS1/A INMARSAT)",
  J6: "(FANS1/A MTSAT)",
  J7: "(FANS1/A IRIDIUM)"
};

enum AcarsCat {
  E1 = "E1",
  E2 = "E2",
  E3 = "E3"
}

const acarsCatText = {
  E1: "(FMCWPR)",
  E2: "(D-FIS)",
  E3: "(PDC)"
};

enum SatCat {
  M1 = "M1",
  M2 = "M2",
  M3 = "M3"
}

const satCatText = {
  M1: "(INMARSAT)",
  M2: "(MTSAT)",
  M3: "(IRIDIUM)"
};

const isVoiceCat = isEnum(VoiceCat);
const isCpdlcCat = isEnum(CpdlcCat);
const isAcarsCat = isEnum(AcarsCat);
const isSatCat = isEnum(SatCat);

export const EquipmentCommTemplate = ({ setReset }: EquipmentTemplateBodyProps) => {
  const entry = useRootSelector(aselEntrySelector);

  const [voiceCategories, setVoiceCategories] = useState<VoiceCat[]>([]);

  const [cpdlcCategories, setCpdlcCategories] = useState<CpdlcCat[]>([]);

  const [acarsCategories, setAcarsCategories] = useState<AcarsCat[]>([]);

  const [satelliteCategories, setSatelliteCategories] = useState<SatCat[]>([]);

  const toggleCategory = (cat: CpdlcCat | AcarsCat | SatCat | VoiceCat) => {
    if (isCpdlcCat(cat)) {
      const cpdlcCats = [...cpdlcCategories];
      const index = cpdlcCats.indexOf(cat);
      if (index < 0) {
        setCpdlcCategories([...cpdlcCats, cat]);
      } else {
        cpdlcCats.splice(index, 1);
        setCpdlcCategories(cpdlcCats);
      }
    } else if (isAcarsCat(cat)) {
      const acarsCats = [...acarsCategories];
      const index = acarsCats.indexOf(cat);
      if (index < 0) {
        setAcarsCategories([...acarsCats, cat]);
      } else {
        acarsCats.splice(index, 1);
        setAcarsCategories(acarsCats);
      }
    } else if (isSatCat(cat)) {
      const satCats = [...satelliteCategories];
      const index = satCats.indexOf(cat);
      if (index < 0) {
        setSatelliteCategories([...satCats, cat]);
      } else {
        satCats.splice(index, 1);
        setSatelliteCategories(satCats);
      }
    } else if (isVoiceCat(cat)) {
      const voiceCats = [...voiceCategories];
      const index = voiceCats.indexOf(cat);
      if (index < 0) {
        setVoiceCategories([...voiceCats, cat]);
      } else {
        voiceCats.splice(index, 1);
        setVoiceCategories(voiceCats);
      }
    }
  };

  useEffect(() => {
    const field10a = entry?.icaoEquipmentCodes?.match(/[A-Z]\d?/g) ?? [];

    const voiceCats = field10a.filter(isVoiceCat);
    const cpdlcCats = field10a.filter(isCpdlcCat);
    const acarsCats = field10a.filter(isAcarsCat);
    const satCats = field10a.filter(isSatCat);

    const reset = () => {
      setVoiceCategories(voiceCats);
      setCpdlcCategories(cpdlcCats);
      setAcarsCategories(acarsCats);
      setSatelliteCategories(satCats);
    };

    setReset(reset);
    reset();
  }, [entry?.icaoEquipmentCodes, setReset]);

  return (
    <>
      <OptionsBodyRow padding="4px 0 0 0" margin="10px 0 0 0">
        <EqpCol2>
          <EqpColTitle>VOICE CATEGORY</EqpColTitle>
          {Object.values(VoiceCat).map(category => (
            <EquipmentTemplateRow
              key={`voice-cat-row-${category}`}
              buttonText={category}
              text={voiceCatText[category]}
              tooltip={Tooltips[`equipmentTemplateMenuComm_${category}`]}
              selected={voiceCategories.includes(category)}
              toggleSelect={() => toggleCategory(category)}
            />
          ))}
        </EqpCol2>
        <EqpCol2>
          <EqpColTitle>CPDLC CATEGORY</EqpColTitle>
          {Object.values(CpdlcCat).map(category => (
            <EquipmentTemplateRow
              key={`cpdlc-cat-row-${category}`}
              buttonText={category}
              text={cpdlcCatText[category]}
              tooltip={Tooltips[`equipmentTemplateMenuComm_${category}`]}
              selected={cpdlcCategories.includes(category)}
              toggleSelect={() => toggleCategory(category)}
            />
          ))}
        </EqpCol2>
        <EqpCol2>
          <EqpColTitle>ACARS CATEGORY</EqpColTitle>
          {Object.values(AcarsCat).map(category => (
            <EquipmentTemplateRow
              key={`acars-cat-row-${category}`}
              buttonText={category}
              text={acarsCatText[category]}
              tooltip={Tooltips[`equipmentTemplateMenuComm_${category}`]}
              selected={acarsCategories.includes(category)}
              toggleSelect={() => toggleCategory(category)}
            />
          ))}
        </EqpCol2>
        <EqpCol2>
          <EqpColTitle>SATELLITE RTF</EqpColTitle>
          {Object.values(SatCat).map(category => (
            <EquipmentTemplateRow
              key={`satellite-cat-row-${category}`}
              buttonText={category}
              text={satCatText[category]}
              tooltip={Tooltips[`equipmentTemplateMenuComm_${category}`]}
              selected={satelliteCategories.includes(category)}
              toggleSelect={() => toggleCategory(category)}
            />
          ))}
        </EqpCol2>
      </OptionsBodyRow>
      <EqpInputRow>
        DAT/
        <EdstTooltip style={{ display: "flex", justifyContent: "left", flexGrow: "1" }} title={Tooltips.equipmentTemplateMenuComm_Dat}>
          <EqpInputContainer60>
            <EqpInput
              value={[...(acarsCategories as string[])]
                .concat([...(satelliteCategories as string[])])
                .sort((u, v) => u.localeCompare(v))
                .join("")}
              // onChange={() => {}}
            />
          </EqpInputContainer60>
        </EdstTooltip>
      </EqpInputRow>
      <EqpInputRow>
        COM/
        <EdstTooltip style={{ display: "flex", justifyContent: "left", flexGrow: "1" }} title={Tooltips.equipmentTemplateMenuComm_Com}>
          <EqpInputContainer60>
            <EqpInput
              value={[...(voiceCategories as string[])]
                .concat([...(cpdlcCategories as string[])])
                .sort((u, v) => u.localeCompare(v))
                .join("")}
              // onChange={() => {}}
            />
          </EqpInputContainer60>
        </EdstTooltip>
      </EqpInputRow>
    </>
  );
};
