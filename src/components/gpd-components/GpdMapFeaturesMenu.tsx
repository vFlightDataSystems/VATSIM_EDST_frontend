import React, { useState } from "react";
import _ from "lodash";
import { closeWindow } from "~redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { gpdMapFeatureOptionsSelector, MapFeatureOption, setGpdMapFeatureOptions } from "~redux/slices/gpdSlice";
import { EdstButton, ExitButton } from "components/utils/EdstButton";
import optionStyles from "css/optionMenu.module.scss";
import clsx from "clsx";

export const GpdMapFeaturesMenu = () => {
  const dispatch = useRootDispatch();
  const mapFeatureOptions = useRootSelector(gpdMapFeatureOptionsSelector);
  const [currentOptions, setCurrentOptions] = useState(_.cloneDeep(mapFeatureOptions));

  return (
    <>
      {Object.values(MapFeatureOption).map((option) => {
        return (
          <div className={optionStyles.row} key={option}>
            <div
              className={clsx(optionStyles.col, "flex")}
              onMouseDown={() =>
                setCurrentOptions((prev) => ({
                  ...prev,
                  [option]: !currentOptions[option],
                }))
              }
            >
              <div className={clsx(optionStyles.indicator, { selected: currentOptions[option] })} />
              {option}
            </div>
          </div>
        );
      })}
      <div className={optionStyles.bottomRow}>
        <div className={optionStyles.col}>
          <EdstButton
            content="OK"
            onMouseDown={() => {
              // set data when OK is pressed
              dispatch(setGpdMapFeatureOptions(currentOptions));
              dispatch(closeWindow("GPD_MAP_OPTIONS_MENU"));
            }}
          />
        </div>
        <div className={clsx(optionStyles.col, "right")}>
          <ExitButton onMouseDown={() => dispatch(closeWindow("GPD_MAP_OPTIONS_MENU"))} />
        </div>
      </div>
    </>
  );
};
