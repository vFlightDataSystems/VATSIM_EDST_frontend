import React, { useState } from "react";
import styled from "styled-components";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { EquipmentTemplateRow } from "./EquipmentTemplateMenu";
import { useRootSelector } from "../../../redux/hooks";
import { aselEntrySelector } from "../../../redux/slices/entrySlice";
import { EqpCol, EqpColTitle, EqpInput, EqpInputContainer60, EqpInputRow } from "./EqpStyled";
import { OptionsBodyRow } from "../../../styles/optionMenuStyles";

const EqpCol2 = styled(EqpCol)`
  margin-left: 30px;
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

export const EquipmentCommTemplate = () => {
  const entry = useRootSelector(aselEntrySelector);
  const field10a = entry?.equipment
    ?.split("/")
    ?.slice(1)?.[0]
    ?.split("-")?.[1]
    ?.match(/[A-Z]\d?/g);
  const voiceCat = field10a?.[0]?.split("")?.filter(s => Object.keys(VoiceCat).includes(s)) as VoiceCat[];
  const [voiceCategories, setVoiceCategories] = useState<VoiceCat[]>(voiceCat ?? []);

  const cpdlcCats = field10a?.filter(s => Object.keys(CpdlcCat).includes(s)) as CpdlcCat[];
  const [cpdlcCategories, setCpdlcCategories] = useState<CpdlcCat[]>(cpdlcCats ?? []);

  const acarsCats = field10a?.filter(s => Object.keys(AcarsCat).includes(s)) as AcarsCat[];
  const [acarsCategories, setAcarsCategories] = useState<AcarsCat[]>(acarsCats ?? []);

  const satCats = field10a?.filter(s => Object.keys(SatCat).includes(s)) as SatCat[];
  const [satelliteCategories, setSatelliteCategories] = useState<SatCat[]>(satCats ?? []);

  const toggleCategory = (cat: CpdlcCat | AcarsCat | SatCat | VoiceCat) => {
    if (Object.keys(CpdlcCat).includes(cat)) {
      const cpdlcCats = [...cpdlcCategories];
      const index = cpdlcCats.indexOf(cat as CpdlcCat);
      if (index < 0) {
        setCpdlcCategories([...cpdlcCats, cat as CpdlcCat]);
      } else {
        cpdlcCats.splice(index, 1);
        setCpdlcCategories(cpdlcCats);
      }
    } else if (Object.keys(AcarsCat).includes(cat)) {
      const acarsCats = [...acarsCategories];
      const index = acarsCats.indexOf(cat as AcarsCat);
      if (index < 0) {
        setAcarsCategories([...acarsCats, cat as AcarsCat]);
      } else {
        acarsCats.splice(index, 1);
        setAcarsCategories(acarsCats);
      }
    } else if (Object.keys(SatCat).includes(cat)) {
      const satCats = [...satelliteCategories];
      const index = satCats.indexOf(cat as SatCat);
      if (index < 0) {
        setSatelliteCategories([...satCats, cat as SatCat]);
      } else {
        satCats.splice(index, 1);
        setSatelliteCategories(satCats);
      }
    } else if (Object.keys(VoiceCat).includes(cat)) {
      const voiceCats = [...voiceCategories];
      const index = voiceCats.indexOf(cat as VoiceCat);
      if (index < 0) {
        setVoiceCategories([...voiceCats, cat as VoiceCat]);
      } else {
        voiceCats.splice(index, 1);
        setVoiceCategories(voiceCats);
      }
    }
  };

  return (
    <div>
      <OptionsBodyRow padding="4px 0 0 0" margin="10px 0 0 0">
        <EqpCol2>
          <EqpColTitle>VOICE CATEGORY</EqpColTitle>
          {Object.keys(VoiceCat).map(category => (
            <EquipmentTemplateRow
              key={`voice-cat-row-${category}`}
              buttonText={category}
              text={voiceCatText[category as VoiceCat]}
              tooltip={Tooltips[`equipmentTemplateMenuComm_${category as VoiceCat}`]}
              selected={voiceCategories.includes(category as VoiceCat)}
              toggleSelect={() => toggleCategory(category as VoiceCat)}
            />
          ))}
        </EqpCol2>
        <EqpCol2>
          <EqpColTitle>CPDLC CATEGORY</EqpColTitle>
          {Object.keys(CpdlcCat).map(category => (
            <EquipmentTemplateRow
              key={`cpdlc-cat-row-${category}`}
              buttonText={category}
              text={cpdlcCatText[category as CpdlcCat]}
              tooltip={Tooltips[`equipmentTemplateMenuComm_${category as CpdlcCat}`]}
              selected={cpdlcCategories.includes(category as CpdlcCat)}
              toggleSelect={() => toggleCategory(category as CpdlcCat)}
            />
          ))}
        </EqpCol2>
        <EqpCol2>
          <EqpColTitle>ACARS CATEGORY</EqpColTitle>
          {Object.keys(AcarsCat).map(category => (
            <EquipmentTemplateRow
              key={`acars-cat-row-${category}`}
              buttonText={category}
              text={acarsCatText[category as AcarsCat]}
              tooltip={Tooltips[`equipmentTemplateMenuComm_${category as AcarsCat}`]}
              selected={acarsCategories.includes(category as AcarsCat)}
              toggleSelect={() => toggleCategory(category as AcarsCat)}
            />
          ))}
        </EqpCol2>
        <EqpCol2>
          <EqpColTitle>SATELLITE RTF</EqpColTitle>
          {Object.keys(SatCat).map(category => (
            <EquipmentTemplateRow
              key={`satellite-cat-row-${category}`}
              buttonText={category}
              text={satCatText[category as SatCat]}
              tooltip={Tooltips[`equipmentTemplateMenuComm_${category as SatCat}`]}
              selected={satelliteCategories.includes(category as SatCat)}
              toggleSelect={() => toggleCategory(category as SatCat)}
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
    </div>
  );
};
