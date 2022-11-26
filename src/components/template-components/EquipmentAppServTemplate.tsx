import React, { useEffect, useState } from "react";
import { Tooltips } from "~/tooltips";
import { useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { isEnum } from "~/utility-functions";
import type { EquipmentTemplateBodyProps } from "components/EquipmentTemplateMenu";
import { EquipmentTemplateRow } from "components/EquipmentTemplateMenu";
import eqpStyles from "css/eqp.module.scss";
import clsx from "clsx";

enum ApproachCategory {
  L = "L",
  K = "K",
  A = "A",
  B = "B",
  S = "S",
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
    const field10a = entry?.icaoEquipmentCodes?.match(/[A-Z]\d?/g) ?? [];

    const appCats = field10a.filter(isApproachCat);

    const reset = () => {
      setAppCategories(appCats);
    };

    setReset(reset);
    reset();
  }, [entry?.icaoEquipmentCodes, setReset]);

  return (
    <div className={eqpStyles.titleRow}>
      <div className={clsx(eqpStyles.col, eqpStyles.m20)}>
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
      </div>
      <div className={clsx(eqpStyles.col, eqpStyles.m16)}>
        <EquipmentTemplateRow
          key="eqp-app-serv-S"
          buttonText="S"
          text="(STANDARD)"
          tooltip={Tooltips.equipmentTemplateMenuAppServ_S}
          selected={appCategories.includes(ApproachCategory.S)}
          toggleSelect={() => toggleCategory(ApproachCategory.S)}
        />
      </div>
    </div>
  );
};
