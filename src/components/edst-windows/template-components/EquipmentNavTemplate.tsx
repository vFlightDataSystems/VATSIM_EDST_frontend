import {EdstTooltip} from "../../resources/EdstTooltip";
import React, {useState} from "react";
import {Tooltips} from "../../../tooltips";
import {useAppSelector} from "../../../redux/hooks";
import {aselEntrySelector} from "../../../redux/slices/entriesSlice";
import {EquipmentTemplateRow} from "./EquipmentTemplateMenu";
import {EdstInput, OptionsBodyRow, OptionSelectedIndicator} from "../../../styles/optionMenuStyles";
import {
  EqpCol,
  EqpColTitle,
  EqpContentCol,
  EqpContentRow,
  EqpInput,
  EqpInputContainer,
  EqpInputRow
} from "./styled";

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
    <OptionsBodyRow margin="10px 0 0 0" padding="4px 0 0 0">
      <EqpCol>
        <EqpColTitle>
          NAVAIDS
        </EqpColTitle>
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
      </EqpCol>
      <EqpCol>
        <EqpColTitle>
          RNAV
        </EqpColTitle>
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
      </EqpCol>
      <EqpCol>
        <EqpContentRow>
          <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_Rnav}>
            <EqpContentCol>
              <OptionSelectedIndicator circle={true}/>
              RNAV
            </EqpContentCol>

          </EdstTooltip>
          <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_Rnp}>
            <EqpContentCol>
              <OptionSelectedIndicator circle={true}/>
              RNP
            </EqpContentCol>
          </EdstTooltip>
        </EqpContentRow>
        <EqpContentRow>
          <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
            <EqpInputContainer>
              <EdstInput/>
            </EqpInputContainer>
          </EdstTooltip>
          D (DEPARTURE)
        </EqpContentRow>
        <EqpContentRow>
          <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
            <EqpInputContainer>
              <EdstInput/>
            </EqpInputContainer>
          </EdstTooltip>
          E (EN ROUTE)
        </EqpContentRow>
        <EqpContentRow>
          <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
            <EqpInputContainer>
              <EdstInput/>
            </EqpInputContainer>
          </EdstTooltip>
          A (ARRIVAL)
        </EqpContentRow>
        <EqpContentRow>
          <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
            <EqpInputContainer>
              <EdstInput/>
            </EqpInputContainer>
          </EdstTooltip>
          G (GLOBAL/OCEAN)
        </EqpContentRow>
        <EqpContentRow>
          <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
            <EqpInputContainer>
              <EdstInput/>
            </EqpInputContainer>
          </EdstTooltip>
          L (LANDING)
        </EqpContentRow>
        <EqpContentRow>
          <EdstTooltip title={Tooltips.equipmentTemplateMenuNAV_RnavRnpFields}>
            <EqpInputContainer>
              <EdstInput/>
            </EqpInputContainer>
          </EdstTooltip>
          S (SPECIAL)
        </EqpContentRow>
      </EqpCol>
      <EqpCol>
        <EqpColTitle>
          RVSM
        </EqpColTitle>
        <EquipmentTemplateRow
          key={`eqp-rvsm-row`}
          buttonText="W"
          text="(RVSM)"
          tooltip={Tooltips[`equipmentTemplateMenuNAV_W`]}
          selected={rvsm}
          toggleSelect={() => setRvsm(!rvsm)}
        />
      </EqpCol>
    </OptionsBodyRow>
    <EqpInputRow>
      NAV/
      <EdstTooltip style={{display: "flex", justifyContent: "left", flexGrow: "1"}} title={Tooltips.equipmentTemplateMenuNAV_Nav}>
        <EqpInputContainer width="60%">
          <EqpInput value={[...navCategories as string[]].concat([...rnavCategories as string[]])
            .sort((u,v) => u.localeCompare(v)).join('') + (rvsm ? 'W' : '')}
                 onChange={() => {}}
          />
        </EqpInputContainer>
      </EdstTooltip>
    </EqpInputRow>
  </div>);
};