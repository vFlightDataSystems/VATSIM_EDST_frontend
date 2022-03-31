import React, {useState} from "react";
import {Tooltips} from "../../../tooltips";
import {useAppSelector} from "../../../redux/hooks";
import {aselEntrySelector} from "../../../redux/slices/entriesSlice";
import {EquipmentTemplateRow} from "./EquipmentTemplateMenu";
import { OptionsBodyRow } from "../../../styles/optionMenuStyles";
import {EqpCol} from "./styled";
import styled from "styled-components";

export const EqpCol2 = styled(EqpCol)`margin: 0 20px`

enum AppCategoryEnum {
  L = 'L',
  K = 'K',
  A = 'A',
  B = 'B',
  S = 'S'
}

export const EquipmentAppServTemplate: React.FC = () => {
  const entry = useAppSelector(aselEntrySelector);
  const field10a = (entry?.flightplan?.aircraft as string)?.split('/')?.slice(1)?.[0]?.split('-')?.[1]?.match(/[A-Z]\d?/g);
  const appCats = field10a?.[0]?.split('')?.filter(s => Object.keys(AppCategoryEnum).includes(s)) as AppCategoryEnum[];
  const [appCategories, setAppCategories] = useState<AppCategoryEnum[]>(appCats ?? []);

  const toggleCategory = (cat: AppCategoryEnum) => {
      let appCats = [...appCategories];
      let index = appCats.indexOf(cat);
      if (index < 0) {
        setAppCategories([...appCats, cat]);
      }
      else {
        appCats.splice(index, 1);
        setAppCategories(appCats);
      }
  }

  return (<div>
    <OptionsBodyRow padding="4px 0 0 0" margin="10px 0 0 0">
      <EqpCol2>
        <EquipmentTemplateRow
          key="eqp-app-serv-L"
          buttonText="L"
          text="(ILS)"
          tooltip={Tooltips.equipmentTemplateMenuAppServ_L}
          selected={appCategories.includes(AppCategoryEnum.L)}
          toggleSelect={() => toggleCategory(AppCategoryEnum.L)}
        />
        <EquipmentTemplateRow
          key="eqp-app-serv-K"
          buttonText="K"
          text="(MLS)"
          tooltip={Tooltips.equipmentTemplateMenuAppServ_K}
          selected={appCategories.includes(AppCategoryEnum.K)}
          toggleSelect={() => toggleCategory(AppCategoryEnum.K)}
        />
        <EquipmentTemplateRow
          key="eqp-app-serv-A"
          buttonText="A"
          text="(GBAS)"
          tooltip={Tooltips.equipmentTemplateMenuAppServ_A}
          selected={appCategories.includes(AppCategoryEnum.A)}
          toggleSelect={() => toggleCategory(AppCategoryEnum.A)}
        />
        <EquipmentTemplateRow
          key="eqp-app-serv-B"
          buttonText="B"
          text="(LPV)"
          tooltip={Tooltips.equipmentTemplateMenuAppServ_B}
          selected={appCategories.includes(AppCategoryEnum.B)}
          toggleSelect={() => toggleCategory(AppCategoryEnum.B)}
        />
      </EqpCol2>
      <EqpCol2>
        <EquipmentTemplateRow
          key="eqp-app-serv-S"
          buttonText="S"
          text="(STANDARD)"
          tooltip={Tooltips.equipmentTemplateMenuAppServ_S}
          selected={appCategories.includes(AppCategoryEnum.S)}
          toggleSelect={() => toggleCategory(AppCategoryEnum.S)}
        />
      </EqpCol2>
    </OptionsBodyRow>
  </div>);
};