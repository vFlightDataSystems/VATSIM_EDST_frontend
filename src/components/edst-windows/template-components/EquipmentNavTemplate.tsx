import {EdstTooltip} from "../../resources/EdstTooltip";
import React, {useState} from "react";
import {Tooltips} from "../../../tooltips";
import {useAppSelector} from "../../../redux/hooks";
import {aselEntrySelector} from "../../../redux/slices/entriesSlice";
import {EquipmentTemplateRow} from "./EquipmentTemplateMenu";

enum NavCatEnum {
  F = 'F',
  O = 'O',
  D = 'D',
  T = 'T'
}

const navCatText = {
  F: '(ADF)',
  O: '(VOR)',
  D: '(DME)',
  T: '(TACAN)'
}

enum RnavCatEnum {
  G = 'G',
  I = 'I',
  C = 'C',
  R = 'R',
  X = 'X'
}

const rnavCatText = {
  G: '(GPS/GNSS)',
  I: '(INS)',
  C: '(LORAN C)',
  R: '(PBN APPROVED)',
  X: '(MNPS APPROVED)'
}

export const EquipmentNavTemplate: React.FC = () => {
  const entry = useAppSelector(aselEntrySelector);
  const field10a = (entry?.flightplan?.aircraft as string)?.split('/')?.slice(1)?.[0]?.split('-')?.[1]?.match(/[A-Z]\d?/g);
  const navaidCats = field10a?.filter(s => Object.keys(NavCatEnum).includes(s)) as NavCatEnum[];
  const [navCategories, setNavCategories] = useState<NavCatEnum[]>(navaidCats ?? []);

  const rnavCats = field10a?.filter(s => Object.keys(RnavCatEnum).includes(s)) as RnavCatEnum[];
  const [rnavCategories, setRnavCategories] = useState<RnavCatEnum[]>(rnavCats ?? []);

  const initialRvsm = !!field10a?.includes('W');
  const [rvsm, setRvsm] = useState<boolean>(initialRvsm);

  const toggleCategory = (cat: NavCatEnum | RnavCatEnum) => {
    if (Object.keys(NavCatEnum).includes(cat)) {
      let navCats = [...navCategories];
      let index = navCats.indexOf(cat as NavCatEnum);
      if (index < 0) {
        setNavCategories([...navCats, cat as NavCatEnum]);
      }
      else {
        navCats.splice(index, 1);
        setNavCategories(navCats);
      }
    }
    else if (Object.keys(RnavCatEnum).includes(cat)) {
      let rnavCats = [...rnavCategories];
      let index = rnavCats.indexOf(cat as RnavCatEnum);
      if (index < 0) {
        setRnavCategories([...rnavCats, cat as RnavCatEnum]);
      }
      else {
        rnavCats.splice(index, 1);
        setRnavCategories(rnavCats);
      }
    }
  }

  return (<div>
    <div className="options-row margin-top">
      <div className="eqp-col">
        <div className="eqp-template-row col-title">
          NAVAIDS
        </div>
        {Object.keys(NavCatEnum).map((category) =>
          <EquipmentTemplateRow
            key={`nav-cat-row-${category}`}
            buttonText={category}
            text={navCatText[category as NavCatEnum]}
            tooltip={Tooltips[`equipmentTemplateMenuNAV_${category as NavCatEnum}`]}
            selected={navCategories.includes(category as NavCatEnum)}
            toggleSelect={() => toggleCategory(category as NavCatEnum)}
          />
        )}
      </div>
      <div className="eqp-col">
        <div className="eqp-template-row col-title">
          RNAV
        </div>
        {Object.keys(RnavCatEnum).map((category) =>
          <EquipmentTemplateRow
            key={`rnav-cat-row-${category}`}
            buttonText={category}
            text={rnavCatText[category as RnavCatEnum]}
            tooltip={Tooltips[`equipmentTemplateMenuNAV_${category as RnavCatEnum}`]}
            selected={rnavCategories.includes(category as RnavCatEnum)}
            toggleSelect={() => toggleCategory(category as RnavCatEnum)}
          />
        )}
      </div>
      <div className="eqp-col">
        <div className="eqp-template-row">
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_Rnav}>
            <div className={`button-indicator circle`}/>
            RNAV
          </EdstTooltip>
          <EdstTooltip className="eqp-content-col btn" title={Tooltips.equipmentTemplateMenuNAV_Rnp}>
            <div className={`button-indicator circle`}/>
            RNP
          </EdstTooltip>
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="input-container small" title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
            <input/>
          </EdstTooltip>
          D (DEPARTURE)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="input-container small" title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
            <input/>
          </EdstTooltip>
          E (EN ROUTE)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="input-container small" title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
            <input/>
          </EdstTooltip>
          A (ARRIVAL)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="input-container small" title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
            <input/>
          </EdstTooltip>
          G (GLOBAL/OCEAN)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="input-container small" title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
            <input/>
          </EdstTooltip>
          L (LANDING)
        </div>
        <div className="eqp-template-row">
          <EdstTooltip className="input-container small" title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
            <input/>
          </EdstTooltip>
          S (SPECIAL)
        </div>
      </div>
      <div className="eqp-col">
        <div className="eqp-template-row col-title">
          RVSM
        </div>
        <EquipmentTemplateRow
          key={`eqp-rvsm-row`}
          buttonText="W"
          text="(RVSM)"
          tooltip={Tooltips[`equipmentTemplateMenuNAV_W`]}
          selected={rvsm}
          toggleSelect={() => setRvsm(!rvsm)}
        />
      </div>
    </div>
    <div className="eqp-template-row bottom-row">
      NAV/
      <EdstTooltip className="input-container flex" title={Tooltips.equipmentTemplateMenuNAV_Nav}>
        <input value={[...navCategories as string[]].concat([...rnavCategories as string[]])
          .sort((u,v) => u.localeCompare(v)).join('') + (rvsm ? 'W' : '')}
               onChange={() => {}}
        />
      </EdstTooltip>
    </div>
  </div>);
};