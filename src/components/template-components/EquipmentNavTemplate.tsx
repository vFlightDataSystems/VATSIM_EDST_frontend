import React, { useEffect, useState } from "react";
import { Tooltips } from "~/tooltips";
import { useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { EdstInput, OptionsBodyRow, OptionIndicatorCircle } from "styles/optionMenuStyles";
import { isEnum } from "~/utility-functions";
import type { EquipmentTemplateBodyProps } from "components/EquipmentTemplateMenu";
import { EquipmentTemplateRow } from "components/EquipmentTemplateMenu";
import {
  EqpCol,
  EqpColTitle,
  EqpContentCol,
  EqpContentRow,
  EqpInput,
  EqpInputContainer,
  EqpInputContainer60,
  EqpInputRow,
} from "components/EqpStyled";

enum NavCat {
  F = "F",
  O = "O",
  D = "D",
  T = "T",
}

const navCatText = {
  F: "(ADF)",
  O: "(VOR)",
  D: "(DME)",
  T: "(TACAN)",
};

enum RnavCat {
  G = "G",
  I = "I",
  C = "C",
  R = "R",
  X = "X",
}

const rnavCatText = {
  G: "(GPS/GNSS)",
  I: "(INS)",
  C: "(LORAN C)",
  R: "(PBN APPROVED)",
  X: "(MNPS APPROVED)",
};

const isNavCat = isEnum(NavCat);
const isRnavCat = isEnum(RnavCat);

export const EquipmentNavTemplate = ({ setReset }: EquipmentTemplateBodyProps) => {
  const entry = useRootSelector(aselEntrySelector);
  const [navCategories, setNavCategories] = useState<NavCat[]>([]);

  const [rnavCategories, setRnavCategories] = useState<RnavCat[]>([]);

  const [rvsm, setRvsm] = useState<boolean>(false);

  const toggleCategory = (cat: NavCat | RnavCat) => {
    if (isNavCat(cat)) {
      const navCats = [...navCategories];
      const index = navCats.indexOf(cat);
      if (index < 0) {
        setNavCategories([...navCats, cat]);
      } else {
        navCats.splice(index, 1);
        setNavCategories(navCats);
      }
    } else if (isRnavCat(cat)) {
      const rnavCats = [...rnavCategories];
      const index = rnavCats.indexOf(cat);
      if (index < 0) {
        setRnavCategories([...rnavCats, cat]);
      } else {
        rnavCats.splice(index, 1);
        setRnavCategories(rnavCats);
      }
    }
  };

  useEffect(() => {
    const field10a = entry?.icaoEquipmentCodes?.match(/[A-Z]\d?/g) ?? [];
    const navaidCats = field10a.filter(isNavCat);
    const rnavCats = field10a.filter(isRnavCat);
    const initialRvsm = field10a.includes("W");

    const reset = () => {
      setNavCategories(navaidCats);
      setRnavCategories(rnavCats);
      setRvsm(initialRvsm);
    };

    setReset(reset);
    reset();
  }, [entry?.icaoEquipmentCodes, setReset]);

  return (
    <>
      <OptionsBodyRow margin="10px 0 0 0" padding="4px 0 0 0">
        <EqpCol>
          <EqpColTitle>NAVAIDS</EqpColTitle>
          {Object.values(NavCat).map((category) => (
            <EquipmentTemplateRow
              key={`nav-cat-row-${category}`}
              buttonText={category}
              text={navCatText[category]}
              tooltip={Tooltips[`equipmentTemplateMenuNAV_${category}`]}
              selected={navCategories.includes(category)}
              toggleSelect={() => toggleCategory(category)}
            />
          ))}
        </EqpCol>
        <EqpCol>
          <EqpColTitle>RNAV</EqpColTitle>
          {Object.values(RnavCat).map((category) => (
            <EquipmentTemplateRow
              key={`rnav-cat-row-${category}`}
              buttonText={category}
              text={rnavCatText[category]}
              tooltip={Tooltips[`equipmentTemplateMenuNAV_${category}`]}
              selected={rnavCategories.includes(category)}
              toggleSelect={() => toggleCategory(category)}
            />
          ))}
        </EqpCol>
        <EqpCol>
          <EqpContentRow>
            <EqpContentCol title={Tooltips.equipmentTemplateMenuNAV_Rnav}>
              <OptionIndicatorCircle />
              RNAV
            </EqpContentCol>
            <EqpContentCol title={Tooltips.equipmentTemplateMenuNAV_Rnp}>
              <OptionIndicatorCircle />
              RNP
            </EqpContentCol>
          </EqpContentRow>
          <EqpContentRow>
            <EqpInputContainer title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <EdstInput />
            </EqpInputContainer>
            D (DEPARTURE)
          </EqpContentRow>
          <EqpContentRow>
            <EqpInputContainer title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <EdstInput />
            </EqpInputContainer>
            E (EN ROUTE)
          </EqpContentRow>
          <EqpContentRow>
            <EqpInputContainer title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <EdstInput />
            </EqpInputContainer>
            A (ARRIVAL)
          </EqpContentRow>
          <EqpContentRow>
            <EqpInputContainer title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <EdstInput />
            </EqpInputContainer>
            G (GLOBAL/OCEAN)
          </EqpContentRow>
          <EqpContentRow>
            <EqpInputContainer title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <EdstInput />
            </EqpInputContainer>
            L (LANDING)
          </EqpContentRow>
          <EqpContentRow>
            <EqpInputContainer title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <EdstInput />
            </EqpInputContainer>
            S (SPECIAL)
          </EqpContentRow>
        </EqpCol>
        <EqpCol>
          <EqpColTitle>RVSM</EqpColTitle>
          <EquipmentTemplateRow
            key="eqp-rvsm-row"
            buttonText="W"
            text="(RVSM)"
            tooltip={Tooltips.equipmentTemplateMenuNAV_W}
            selected={rvsm}
            toggleSelect={() => setRvsm(!rvsm)}
          />
        </EqpCol>
      </OptionsBodyRow>
      <EqpInputRow>
        NAV/
        <EqpInputContainer60 title={Tooltips.equipmentTemplateMenuNAV_Nav}>
          <EqpInput
            readOnly
            value={
              [...(navCategories as string[])]
                .concat([...(rnavCategories as string[])])
                .sort((u, v) => u.localeCompare(v))
                .join("") + (rvsm ? "W" : "")
            }
          />
        </EqpInputContainer60>
      </EqpInputRow>
    </>
  );
};
