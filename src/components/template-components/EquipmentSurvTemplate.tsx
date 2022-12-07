import React, { useEffect, useState } from "react";
import type { Nullable } from "types/utility-types";
import { useRootSelector } from "~redux/hooks";
import { aselEntrySelector } from "~redux/slices/entrySlice";
import { isEnum } from "~/utility-functions";
import type { EquipmentTemplateBodyProps } from "components/EquipmentTemplateMenu";
import { EquipmentTemplateRow } from "components/EquipmentTemplateMenu";
import clsx from "clsx";
import optionStyles from "css/optionMenu.module.scss";
import eqpStyles from "css/eqp.module.scss";

enum TransponderCat {
  A = "A",
  C = "C",
  X = "X",
  P = "P",
  I = "I",
  S = "S",
  H = "H",
  L = "L",
  E = "E",
}

const transponderCatText = {
  A: "(MODE A WITH NO MODE C)",
  C: "(MODE A WITH MODE C)",
  X: "(MODE S ONLY)",
  P: "(MODE S & PRESSURE ALTITUDE)",
  I: "(MODE S & ACID TRANSMISSION)",
  S: "(MODE S & ACID & PRESSURE ALTITUDE)",
  H: "(MODE S & ACID TRANSMISSION & ENHANCED)",
  L: "(MODE S & ACID & PRESSURE ALTITUDE & ENHANCED)",
  E: "(MODE S & ACID & PRESSURE ALTITUDE & EXTENDED SQUITTER)",
};

enum AdsbB {
  B1 = "B1",
  B2 = "B2",
}

enum AdsbU {
  U1 = "U1",
  U2 = "U2",
}

enum AdsbV {
  V1 = "V1",
  V2 = "V2",
}

export const EquipmentSurvTemplate = ({ setReset }: EquipmentTemplateBodyProps) => {
  const entry = useRootSelector(aselEntrySelector);
  const [transponderCat, setTransponderCat] = useState<Nullable<TransponderCat>>(null);
  const [adsbBCat, setAdsbBCat] = useState<Nullable<AdsbB>>(null);
  const [adsbUCat, setAdsbUCat] = useState<Nullable<AdsbU>>(null);
  const [adsbVCat, setAdsbVCat] = useState<Nullable<AdsbV>>(null);

  useEffect(() => {
    const field10b = entry?.icaoSurveillanceCodes?.match(/[A-Z]\d?/g);

    const transponderCat = field10b?.[0];

    const transponderCategory = transponderCat && isEnum(TransponderCat)(transponderCat) ? transponderCat : null;
    const adsbBInitialCat = (Object.values(AdsbB).filter((t) => field10b?.includes(t))?.[0] as AdsbB | undefined) ?? null;
    const adsbUInitialCat = (Object.values(AdsbU).filter((t) => field10b?.includes(t))?.[0] as AdsbU | undefined) ?? null;
    const adsbVInitialCat = (Object.values(AdsbV).filter((t) => field10b?.includes(t))?.[0] as AdsbV | undefined) ?? null;

    const reset = () => {
      setTransponderCat(transponderCategory);
      setAdsbBCat(adsbBInitialCat);
      setAdsbUCat(adsbUInitialCat);
      setAdsbVCat(adsbVInitialCat);
    };

    setReset(reset);
    reset();
  }, [entry?.icaoSurveillanceCodes, setReset]);

  return (
    <>
      <div className={eqpStyles.titleRow}>
        <div className={eqpStyles.col}>
          <div className={eqpStyles.colTitle}>TRANSPONDER CATEGORY</div>
          <div className={eqpStyles.row}>
            <div className={eqpStyles.contentCol} onMouseDown={() => setTransponderCat(null)}>
              <div className={clsx(optionStyles.circleIndicator, { selected: transponderCat === null })} />
              No Transponder
            </div>
          </div>
          {Object.values(TransponderCat).map((category) => (
            <EquipmentTemplateRow
              circle
              key={category}
              buttonText={category}
              text={transponderCatText[category]}
              selected={transponderCat === category}
              toggleSelect={() => setTransponderCat(category)}
            />
          ))}
        </div>
        <div className={clsx(eqpStyles.col, "w23")}>
          <div className={eqpStyles.colTitle}>ADS-B CATEGORY</div>
          <EquipmentTemplateRow circle buttonText="No 1090" selected={adsbBCat === null} toggleSelect={() => setAdsbBCat(null)} />
          <EquipmentTemplateRow
            circle
            buttonText="B1"
            text="(1090 OUT)"
            selected={adsbBCat === AdsbB.B1}
            toggleSelect={() => setAdsbBCat(AdsbB.B1)}
          />
          <EquipmentTemplateRow
            circle
            buttonText="B2"
            text="(1090 IN/OUT)"
            selected={adsbBCat === AdsbB.B2}
            toggleSelect={() => setAdsbBCat(AdsbB.B2)}
          />
          <EquipmentTemplateRow margin="10px 0 0 0" circle buttonText="No UAT" selected={adsbUCat === null} toggleSelect={() => setAdsbUCat(null)} />
          <EquipmentTemplateRow circle buttonText="U1" text="(UAT OUT)" selected={adsbUCat === AdsbU.U1} toggleSelect={() => setAdsbUCat(AdsbU.U1)} />
          <EquipmentTemplateRow
            circle
            buttonText="U2"
            text="(UAT IN/OUT)"
            selected={adsbUCat === AdsbU.U2}
            toggleSelect={() => setAdsbUCat(AdsbU.U2)}
          />
          <EquipmentTemplateRow margin="10px 0 0 0" circle buttonText="No VDL" selected={adsbVCat === null} toggleSelect={() => setAdsbVCat(null)} />
          <EquipmentTemplateRow circle buttonText="V1" text="(VDL OUT)" selected={adsbVCat === AdsbV.V1} toggleSelect={() => setAdsbVCat(AdsbV.V1)} />
          <EquipmentTemplateRow
            circle
            buttonText="V2"
            text="(VDL IN/OUT)"
            selected={adsbVCat === AdsbV.V2}
            toggleSelect={() => setAdsbVCat(AdsbV.V2)}
          />
        </div>
        <div className={eqpStyles.col}>
          <div className={eqpStyles.colTitle}>
            ADS-B
            <br /> CERTIFICATION
          </div>
          <div className={clsx(eqpStyles.row, eqpStyles.hm18)}>
            <div className={eqpStyles.contentCol}>
              <div className={optionStyles.indicator} />
              260B (1090)
            </div>
          </div>
          <div className={clsx(eqpStyles.row, eqpStyles.hm18)}>
            <div className={eqpStyles.contentCol}>
              <div className={optionStyles.indicator} />
              282B (UAT)
            </div>
          </div>
        </div>
      </div>
      <div className={eqpStyles.inputRow}>
        SUR/
        <div className={clsx(eqpStyles.inputContainer, eqpStyles.mw60)}>
          <input readOnly value={`${transponderCat ?? ""}${adsbBCat ?? ""}${adsbUCat ?? ""}${adsbVCat ?? ""}`} />
        </div>
      </div>
    </>
  );
};
