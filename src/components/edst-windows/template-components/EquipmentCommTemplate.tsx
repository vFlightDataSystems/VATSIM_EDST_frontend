import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { EquipmentTemplateBodyProps, EquipmentTemplateRow } from "./EquipmentTemplateMenu";
import { useRootSelector } from "../../../redux/hooks";
import { aselEntrySelector } from "../../../redux/slices/entrySlice";
import { EqpCol, EqpColTitle, EqpInput, EqpInputContainer60, EqpInputRow } from "./EqpStyled";
import { OptionsBodyRow } from "../../../styles/optionMenuStyles";
import { strIsEnum, unsafeKeys } from "../../../utility-functions";

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

export const EquipmentCommTemplate = ({ setReset }: EquipmentTemplateBodyProps) => {
  const entry = useRootSelector(aselEntrySelector);

  const [voiceCategories, setVoiceCategories] = useState<VoiceCat[]>([]);

  const [cpdlcCategories, setCpdlcCategories] = useState<CpdlcCat[]>([]);

  const [acarsCategories, setAcarsCategories] = useState<AcarsCat[]>([]);

  const [satelliteCategories, setSatelliteCategories] = useState<SatCat[]>([]);

  const toggleCategory = (cat: CpdlcCat | AcarsCat | SatCat | VoiceCat) => {
    if (strIsEnum(cat, CpdlcCat)) {
      const cpdlcCats = [...cpdlcCategories];
      const index = cpdlcCats.indexOf(cat);
      if (index < 0) {
        setCpdlcCategories([...cpdlcCats, cat]);
      } else {
        cpdlcCats.splice(index, 1);
        setCpdlcCategories(cpdlcCats);
      }
    } else if (strIsEnum(cat, AcarsCat)) {
      const acarsCats = [...acarsCategories];
      const index = acarsCats.indexOf(cat);
      if (index < 0) {
        setAcarsCategories([...acarsCats, cat]);
      } else {
        acarsCats.splice(index, 1);
        setAcarsCategories(acarsCats);
      }
    } else if (strIsEnum(cat, SatCat)) {
      const satCats = [...satelliteCategories];
      const index = satCats.indexOf(cat);
      if (index < 0) {
        setSatelliteCategories([...satCats, cat]);
      } else {
        satCats.splice(index, 1);
        setSatelliteCategories(satCats);
      }
    } else if (strIsEnum(cat, VoiceCat)) {
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
    const field10a = entry?.equipment
      ?.split("/")
      ?.slice(1)?.[0]
      ?.split("-")?.[1]
      ?.match(/[A-Z]\d?/g);

    const voiceCats = (field10a?.[0]?.split("")?.filter(s => strIsEnum(s, VoiceCat)) ?? []) as VoiceCat[];
    const cpdlcCats = (field10a?.filter(s => strIsEnum(s, CpdlcCat)) ?? []) as CpdlcCat[];
    const acarsCats = (field10a?.filter(s => strIsEnum(s, AcarsCat)) ?? []) as AcarsCat[];
    const satCats = (field10a?.filter(s => strIsEnum(s, SatCat)) ?? []) as SatCat[];

    const reset = () => {
      setVoiceCategories(voiceCats);
      setCpdlcCategories(cpdlcCats);
      setAcarsCategories(acarsCats);
      setSatelliteCategories(satCats);
    };

    setReset(reset);
    reset();
  }, [entry?.equipment, setReset]);

  return (
    <>
      <OptionsBodyRow padding="4px 0 0 0" margin="10px 0 0 0">
        <EqpCol2>
          <EqpColTitle>VOICE CATEGORY</EqpColTitle>
          {unsafeKeys(VoiceCat).map(category => (
            <EquipmentTemplateRow
              key={`voice-cat-row-${category}`}
              buttonText={category}
              text={voiceCatText[category]}
              tooltip={Tooltips[`equipmentTemplateMenuComm_${category}`]}
              selected={voiceCategories.includes(category as VoiceCat)}
              toggleSelect={() => toggleCategory(category as VoiceCat)}
            />
          ))}
        </EqpCol2>
        <EqpCol2>
          <EqpColTitle>CPDLC CATEGORY</EqpColTitle>
          {unsafeKeys(CpdlcCat).map(category => (
            <EquipmentTemplateRow
              key={`cpdlc-cat-row-${category}`}
              buttonText={category}
              text={cpdlcCatText[category]}
              tooltip={Tooltips[`equipmentTemplateMenuComm_${category}`]}
              selected={cpdlcCategories.includes(category as CpdlcCat)}
              toggleSelect={() => toggleCategory(category as CpdlcCat)}
            />
          ))}
        </EqpCol2>
        <EqpCol2>
          <EqpColTitle>ACARS CATEGORY</EqpColTitle>
          {unsafeKeys(AcarsCat).map(category => (
            <EquipmentTemplateRow
              key={`acars-cat-row-${category}`}
              buttonText={category}
              text={acarsCatText[category]}
              tooltip={Tooltips[`equipmentTemplateMenuComm_${category}`]}
              selected={acarsCategories.includes(category as AcarsCat)}
              toggleSelect={() => toggleCategory(category as AcarsCat)}
            />
          ))}
        </EqpCol2>
        <EqpCol2>
          <EqpColTitle>SATELLITE RTF</EqpColTitle>
          {unsafeKeys(SatCat).map(category => (
            <EquipmentTemplateRow
              key={`satellite-cat-row-${category}`}
              buttonText={category}
              text={satCatText[category]}
              tooltip={Tooltips[`equipmentTemplateMenuComm_${category}`]}
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
    </>
  );
};
