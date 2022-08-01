import React, { useState } from "react";
import styled from "styled-components";
import { Tooltips } from "../../../tooltips";
import { useRootSelector } from "../../../redux/hooks";
import { aselEntrySelector } from "../../../redux/slices/entrySlice";
import { EquipmentTemplateRow } from "./EquipmentTemplateMenu";
import { OptionsBodyRow } from "../../../styles/optionMenuStyles";
import { EqpCol } from "./EqpStyled";

export const EqpCol2 = styled(EqpCol)`
  margin: 0 20px;
`;

enum AppCategory {
  L = "L",
  K = "K",
  A = "A",
  B = "B",
  S = "S"
}

export const EquipmentAppServTemplate = () => {
  const entry = useRootSelector(aselEntrySelector);
  const field10a = entry?.equipment
    ?.split("/")
    ?.slice(1)?.[0]
    ?.split("-")?.[1]
    ?.match(/[A-Z]\d?/g);
  const appCats = field10a?.[0]?.split("")?.filter(s => Object.keys(AppCategory).includes(s)) as AppCategory[];
  const [appCategories, setAppCategories] = useState<AppCategory[]>(appCats ?? []);

  const toggleCategory = (cat: AppCategory) => {
    const appCats = [...appCategories];
    const index = appCats.indexOf(cat);
    if (index < 0) {
      setAppCategories([...appCats, cat]);
    } else {
      appCats.splice(index, 1);
      setAppCategories(appCats);
    }
  };

  return (
    <div>
      <OptionsBodyRow padding="4px 0 0 0" margin="10px 0 0 0">
        <EqpCol2>
          <EquipmentTemplateRow
            key="eqp-app-serv-L"
            buttonText="L"
            text="(ILS)"
            tooltip={Tooltips.equipmentTemplateMenuAppServ_L}
            selected={appCategories.includes(AppCategory.L)}
            toggleSelect={() => toggleCategory(AppCategory.L)}
          />
          <EquipmentTemplateRow
            key="eqp-app-serv-K"
            buttonText="K"
            text="(MLS)"
            tooltip={Tooltips.equipmentTemplateMenuAppServ_K}
            selected={appCategories.includes(AppCategory.K)}
            toggleSelect={() => toggleCategory(AppCategory.K)}
          />
          <EquipmentTemplateRow
            key="eqp-app-serv-A"
            buttonText="A"
            text="(GBAS)"
            tooltip={Tooltips.equipmentTemplateMenuAppServ_A}
            selected={appCategories.includes(AppCategory.A)}
            toggleSelect={() => toggleCategory(AppCategory.A)}
          />
          <EquipmentTemplateRow
            key="eqp-app-serv-B"
            buttonText="B"
            text="(LPV)"
            tooltip={Tooltips.equipmentTemplateMenuAppServ_B}
            selected={appCategories.includes(AppCategory.B)}
            toggleSelect={() => toggleCategory(AppCategory.B)}
          />
        </EqpCol2>
        <EqpCol2>
          <EquipmentTemplateRow
            key="eqp-app-serv-S"
            buttonText="S"
            text="(STANDARD)"
            tooltip={Tooltips.equipmentTemplateMenuAppServ_S}
            selected={appCategories.includes(AppCategory.S)}
            toggleSelect={() => toggleCategory(AppCategory.S)}
          />
        </EqpCol2>
      </OptionsBodyRow>
    </div>
  );
};
