import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Tooltips } from "../../../tooltips";
import { useRootSelector } from "../../../redux/hooks";
import { aselEntrySelector } from "../../../redux/slices/entrySlice";
import { EquipmentTemplateBodyProps, EquipmentTemplateRow } from "./EquipmentTemplateMenu";
import { OptionsBodyRow } from "../../../styles/optionMenuStyles";
import { EqpCol } from "./EqpStyled";
import { isEnum } from "../../../utility-functions";

export const EqpCol2 = styled(EqpCol)`
  margin: 0 20px;
`;

enum ApproachCategory {
  L = "L",
  K = "K",
  A = "A",
  B = "B",
  S = "S"
}

const isApproachCat = isEnum(ApproachCategory);

export const EquipmentAppServTemplate = ({ setReset }: EquipmentTemplateBodyProps) => {
  const entry = useRootSelector(aselEntrySelector);
  const [appCategories, setAppCategories] = useState<ApproachCategory[]>([]);

  const toggleCategory = (cat: ApproachCategory) => {
    const appCats = [...appCategories];
    const index = appCats.indexOf(cat);
    if (index < 0) {
      setAppCategories([...appCats, cat]);
    } else {
      appCats.splice(index, 1);
      setAppCategories(appCats);
    }
  };

  useEffect(() => {
    const field10a = entry?.equipment
      ?.split("/")
      ?.slice(1)?.[0]
      ?.split("-")?.[1]
      ?.match(/[A-Z]\d?/g);
    const appCats: ApproachCategory[] = field10a?.[0]?.split("")?.filter(isApproachCat) ?? [];

    const reset = () => {
      setAppCategories(appCats);
    };

    setReset(reset);
    reset();
  }, [entry?.equipment, setReset]);

  return (
    <div>
      <OptionsBodyRow padding="4px 0 0 0" margin="10px 0 0 0">
        <EqpCol2>
          <EquipmentTemplateRow
            key="eqp-app-serv-L"
            buttonText="L"
            text="(ILS)"
            tooltip={Tooltips.equipmentTemplateMenuAppServ_L}
            selected={appCategories.includes(ApproachCategory.L)}
            toggleSelect={() => toggleCategory(ApproachCategory.L)}
          />
          <EquipmentTemplateRow
            key="eqp-app-serv-K"
            buttonText="K"
            text="(MLS)"
            tooltip={Tooltips.equipmentTemplateMenuAppServ_K}
            selected={appCategories.includes(ApproachCategory.K)}
            toggleSelect={() => toggleCategory(ApproachCategory.K)}
          />
          <EquipmentTemplateRow
            key="eqp-app-serv-A"
            buttonText="A"
            text="(GBAS)"
            tooltip={Tooltips.equipmentTemplateMenuAppServ_A}
            selected={appCategories.includes(ApproachCategory.A)}
            toggleSelect={() => toggleCategory(ApproachCategory.A)}
          />
          <EquipmentTemplateRow
            key="eqp-app-serv-B"
            buttonText="B"
            text="(LPV)"
            tooltip={Tooltips.equipmentTemplateMenuAppServ_B}
            selected={appCategories.includes(ApproachCategory.B)}
            toggleSelect={() => toggleCategory(ApproachCategory.B)}
          />
        </EqpCol2>
        <EqpCol2>
          <EquipmentTemplateRow
            key="eqp-app-serv-S"
            buttonText="S"
            text="(STANDARD)"
            tooltip={Tooltips.equipmentTemplateMenuAppServ_S}
            selected={appCategories.includes(ApproachCategory.S)}
            toggleSelect={() => toggleCategory(ApproachCategory.S)}
          />
        </EqpCol2>
      </OptionsBodyRow>
    </div>
  );
};
