import React, { useState } from "react";
import _ from "lodash";
import { OptionIndicator, OptionsBodyCol, OptionsBodyRow, OptionsBottomRow, OptionsFlexCol } from "styles/optionMenuStyles";
import { closeWindow } from "~redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { gpdMapFeatureOptionsSelector, MapFeatureOption, setGpdMapFeatureOptions } from "~redux/slices/gpdSlice";
import { EdstWindow } from "enums/edstWindow";
import { EdstButton, ExitButton } from "components/utils/EdstButton";

export const GpdMapFeaturesMenu = () => {
  const dispatch = useRootDispatch();
  const mapFeatureOptions = useRootSelector(gpdMapFeatureOptionsSelector);
  const [currentOptions, setCurrentOptions] = useState(_.cloneDeep(mapFeatureOptions));

  return (
    <>
      {Object.values(MapFeatureOption).map((option) => {
        return (
          <OptionsBodyRow key={option}>
            <OptionsFlexCol
              onMouseDown={() =>
                setCurrentOptions((prev) => ({
                  ...prev,
                  [option]: !currentOptions[option],
                }))
              }
            >
              <OptionIndicator selected={currentOptions[option]} />
              {option}
            </OptionsFlexCol>
          </OptionsBodyRow>
        );
      })}
      <OptionsBottomRow>
        <OptionsBodyCol>
          <EdstButton
            content="OK"
            onMouseDown={() => {
              // set data when OK is pressed
              dispatch(setGpdMapFeatureOptions(currentOptions));
              dispatch(closeWindow(EdstWindow.GPD_MAP_OPTIONS_MENU));
            }}
          />
        </OptionsBodyCol>
        <OptionsBodyCol alignRight>
          <ExitButton onMouseDown={() => dispatch(closeWindow(EdstWindow.GPD_MAP_OPTIONS_MENU))} />
        </OptionsBodyCol>
      </OptionsBottomRow>
    </>
  );
};
