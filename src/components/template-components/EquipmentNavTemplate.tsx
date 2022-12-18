import React, { useEffect, useState } from "react";
import { useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { isEnum } from "~/utility-functions";
import type { EquipmentTemplateBodyProps } from "components/EquipmentTemplateMenu";
import { EquipmentTemplateRow } from "components/EquipmentTemplateMenu";
import optionStyles from "css/optionMenu.module.scss";
import eqpStyles from "css/eqp.module.scss";
import clsx from "clsx";

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
    const field10a: string[] = entry?.icaoEquipmentCodes?.match(/[A-Z]\d?/g) ?? [];
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
      <div className={eqpStyles.titleRow}>
        <div className={eqpStyles.col}>
          <div className={eqpStyles.colTitle}>NAVAIDS</div>
          {Object.values(NavCat).map((category) => (
            <EquipmentTemplateRow
              key={`nav-cat-row-${category}`}
              buttonText={category}
              text={navCatText[category]}
              selected={navCategories.includes(category)}
              toggleSelect={() => toggleCategory(category)}
            />
          ))}
        </div>
        <div className={eqpStyles.col}>
          <div className={eqpStyles.colTitle}>RNAV</div>
          {Object.values(RnavCat).map((category) => (
            <EquipmentTemplateRow
              key={`rnav-cat-row-${category}`}
              buttonText={category}
              text={rnavCatText[category]}
              selected={rnavCategories.includes(category)}
              toggleSelect={() => toggleCategory(category)}
            />
          ))}
        </div>
        <div className={eqpStyles.col}>
          <div className={eqpStyles.contentRow}>
            <div className={eqpStyles.contentCol}>
              <div className={optionStyles.circleIndicator} />
              RNAV
            </div>
            <div className={eqpStyles.contentCol}>
              <div className={optionStyles.circleIndicator} />
              RNP
            </div>
          </div>
          <div className={eqpStyles.contentRow}>
            <div className={eqpStyles.inputContainer}>
              <input />
            </div>
            D (DEPARTURE)
          </div>
          <div className={eqpStyles.contentRow}>
            <div className={eqpStyles.inputContainer}>
              <input />
            </div>
            E (EN ROUTE)
          </div>
          <div className={eqpStyles.contentRow}>
            <div className={eqpStyles.inputContainer}>
              <input />
            </div>
            A (ARRIVAL)
          </div>
          <div className={eqpStyles.contentRow}>
            <div className={eqpStyles.inputContainer}>
              <input />
            </div>
            G (GLOBAL/OCEAN)
          </div>
          <div className={eqpStyles.contentRow}>
            <div className={eqpStyles.inputContainer}>
              <input />
            </div>
            L (LANDING)
          </div>
          <div className={eqpStyles.contentRow}>
            <div className={eqpStyles.inputContainer}>
              <input />
            </div>
            S (SPECIAL)
          </div>
        </div>
        <div className={eqpStyles.col}>
          <div className={eqpStyles.colTitle}>RVSM</div>
          <EquipmentTemplateRow key="eqp-rvsm-row" buttonText="W" text="(RVSM)" selected={rvsm} toggleSelect={() => setRvsm(!rvsm)} />
        </div>
      </div>
      <div className={eqpStyles.inputRow}>
        NAV/
        <div className={clsx(eqpStyles.inputContainer, eqpStyles.mw60)}>
          <input
            readOnly
            value={
              [...(navCategories as string[])]
                .concat([...(rnavCategories as string[])])
                .sort((u, v) => u.localeCompare(v))
                .join("") + (rvsm ? "W" : "")
            }
          />
        </div>
      </div>
    </>
  );
};
