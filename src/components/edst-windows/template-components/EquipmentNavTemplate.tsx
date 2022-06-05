import React, { useState } from "react";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { useRootSelector } from "../../../redux/hooks";
import { aselEntrySelector } from "../../../redux/slices/entriesSlice";
import { EquipmentTemplateRow } from "./EquipmentTemplateMenu";
import { EdstInput, OptionsBodyRow, OptionSelectedIndicator } from "../../../styles/optionMenuStyles";
import { EqpCol, EqpColTitle, EqpContentCol, EqpContentRow, EqpInput, EqpInputContainer, EqpInputContainer60, EqpInputRow } from "./styled";

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

export const EquipmentNavTemplate: React.FC = () => {
  const entry = useRootSelector(aselEntrySelector);
  const field10a = entry?.equipment
    ?.split("/")
    ?.slice(1)?.[0]
    ?.split("-")?.[1]
    ?.match(/[A-Z]\d?/g);
  const navaidCats = field10a?.filter(s => Object.keys(NavCat).includes(s)) as NavCat[];
  const [navCategories, setNavCategories] = useState<NavCat[]>(navaidCats ?? []);

  const rnavCats = field10a?.filter(s => Object.keys(RnavCat).includes(s)) as RnavCat[];
  const [rnavCategories, setRnavCategories] = useState<RnavCat[]>(rnavCats ?? []);

  const initialRvsm = !!field10a?.includes("W");
  const [rvsm, setRvsm] = useState<boolean>(initialRvsm);

  const toggleCategory = (cat: NavCat | RnavCat) => {
    if (Object.keys(NavCat).includes(cat)) {
      const navCats = [...navCategories];
      const index = navCats.indexOf(cat as NavCat);
      if (index < 0) {
        setNavCategories([...navCats, cat as NavCat]);
      } else {
        navCats.splice(index, 1);
        setNavCategories(navCats);
      }
    } else if (Object.keys(RnavCat).includes(cat)) {
      const rnavCats = [...rnavCategories];
      const index = rnavCats.indexOf(cat as RnavCat);
      if (index < 0) {
        setRnavCategories([...rnavCats, cat as RnavCat]);
      } else {
        rnavCats.splice(index, 1);
        setRnavCategories(rnavCats);
      }
    }
  };

  return (
    <div>
      <OptionsBodyRow margin="10px 0 0 0" padding="4px 0 0 0">
        <EqpCol>
          <EqpColTitle>NAVAIDS</EqpColTitle>
          {Object.keys(NavCat).map(category => (
            <EquipmentTemplateRow
              key={`nav-cat-row-${category}`}
              buttonText={category}
              text={navCatText[category as NavCat]}
              tooltip={Tooltips[`equipmentTemplateMenuNAV_${category as NavCat}`]}
              selected={navCategories.includes(category as NavCat)}
              toggleSelect={() => toggleCategory(category as NavCat)}
            />
          ))}
        </EqpCol>
        <EqpCol>
          <EqpColTitle>RNAV</EqpColTitle>
          {Object.keys(RnavCat).map(category => (
            <EquipmentTemplateRow
              key={`rnav-cat-row-${category}`}
              buttonText={category}
              text={rnavCatText[category as RnavCat]}
              tooltip={Tooltips[`equipmentTemplateMenuNAV_${category as RnavCat}`]}
              selected={rnavCategories.includes(category as RnavCat)}
              toggleSelect={() => toggleCategory(category as RnavCat)}
            />
          ))}
        </EqpCol>
        <EqpCol>
          <EqpContentRow>
            <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_Rnav}>
              <EqpContentCol>
                <OptionSelectedIndicator circle />
                RNAV
              </EqpContentCol>
            </EdstTooltip>
            <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_Rnp}>
              <EqpContentCol>
                <OptionSelectedIndicator circle />
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
          <EqpInputContainer60 width="60%">
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
    </div>
  );
};
