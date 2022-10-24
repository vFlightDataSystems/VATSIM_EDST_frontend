import React, { useEffect, useState } from "react";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { useRootSelector } from "../../../redux/hooks";
import { aselEntrySelector } from "../../../redux/slices/entrySlice";
import { EquipmentTemplateBodyProps, EquipmentTemplateRow } from "./EquipmentTemplateMenu";
import { EdstInput, OptionsBodyRow, OptionIndicatorCircle } from "../../../styles/optionMenuStyles";
import { EqpCol, EqpColTitle, EqpContentCol, EqpContentRow, EqpInput, EqpInputContainer, EqpInputContainer60, EqpInputRow } from "./EqpStyled";
import { isEnum } from "../../../utility-functions";

enum NavCat {
  F = "F",
  O = "O",
  D = "D",
  T = "T"
}

const navCatText = {
  F: "(ADF)",
  O: "(VOR)",
  D: "(DME)",
  T: "(TACAN)"
};

enum RnavCat {
  G = "G",
  I = "I",
  C = "C",
  R = "R",
  X = "X"
}

const rnavCatText = {
  G: "(GPS/GNSS)",
  I: "(INS)",
  C: "(LORAN C)",
  R: "(PBN APPROVED)",
  X: "(MNPS APPROVED)"
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
    const field10a = entry?.equipment
      ?.split("/")
      ?.slice(1)?.[0]
      ?.split("-")?.[1]
      ?.match(/[A-Z]\d?/g);
    const navaidCats: NavCat[] = field10a?.filter(isNavCat) ?? [];
    const rnavCats: RnavCat[] = field10a?.filter(isRnavCat) ?? [];
    const initialRvsm = !!field10a?.includes("W");

    const reset = () => {
      setNavCategories(navaidCats);
      setRnavCategories(rnavCats);
      setRvsm(initialRvsm);
    };

    setReset(reset);
    reset();
  }, [entry?.equipment, setReset]);

  return (
    <>
      <OptionsBodyRow margin="10px 0 0 0" padding="4px 0 0 0">
        <EqpCol>
          <EqpColTitle>NAVAIDS</EqpColTitle>
          {Object.values(NavCat).map(category => (
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
          {Object.values(RnavCat).map(category => (
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
            <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_Rnav}>
              <EqpContentCol>
                <OptionIndicatorCircle />
                RNAV
              </EqpContentCol>
            </EdstTooltip>
            <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_Rnp}>
              <EqpContentCol>
                <OptionIndicatorCircle />
                RNP
              </EqpContentCol>
            </EdstTooltip>
          </EqpContentRow>
          <EqpContentRow>
            <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <EqpInputContainer>
                <EdstInput />
              </EqpInputContainer>
            </EdstTooltip>
            D (DEPARTURE)
          </EqpContentRow>
          <EqpContentRow>
            <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <EqpInputContainer>
                <EdstInput />
              </EqpInputContainer>
            </EdstTooltip>
            E (EN ROUTE)
          </EqpContentRow>
          <EqpContentRow>
            <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <EqpInputContainer>
                <EdstInput />
              </EqpInputContainer>
            </EdstTooltip>
            A (ARRIVAL)
          </EqpContentRow>
          <EqpContentRow>
            <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <EqpInputContainer>
                <EdstInput />
              </EqpInputContainer>
            </EdstTooltip>
            G (GLOBAL/OCEAN)
          </EqpContentRow>
          <EqpContentRow>
            <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <EqpInputContainer>
                <EdstInput />
              </EqpInputContainer>
            </EdstTooltip>
            L (LANDING)
          </EqpContentRow>
          <EqpContentRow>
            <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
              <EqpInputContainer>
                <EdstInput />
              </EqpInputContainer>
            </EdstTooltip>
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
        <EdstTooltip style={{ display: "flex", justifyContent: "left", flexGrow: "1" }} title={Tooltips.equipmentTemplateMenuNAV_Nav}>
          <EqpInputContainer60>
            <EqpInput
              value={
                [...(navCategories as string[])]
                  .concat([...(rnavCategories as string[])])
                  .sort((u, v) => u.localeCompare(v))
                  .join("") + (rvsm ? "W" : "")
              }
              // onChange={() => {}}
            />
          </EqpInputContainer60>
        </EdstTooltip>
      </EqpInputRow>
    </>
  );
};
