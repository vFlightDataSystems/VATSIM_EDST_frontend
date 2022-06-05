import React, { useState } from "react";
import _ from "lodash";
import { OptionsBodyCol, OptionsBodyRow, OptionsBottomRow, OptionSelectedIndicator, OptionsFlexCol } from "../../../styles/optionMenuStyles";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { EdstButton } from "../../resources/EdstButton";
import { closeWindow } from "../../../redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { gpdMapFeatureOptionsSelector, mapFeatureOption, setMapFeatureOptions } from "../../../redux/slices/gpdSlice";
import { EdstWindow } from "../../../namespaces";

export const GpdMapFeaturesMenu: React.FC = () => {
  const dispatch = useRootDispatch();
  const mapFeatureOptions = useRootSelector(gpdMapFeatureOptionsSelector);
  const [currentOptions, setCurrentOptions] = useState(_.cloneDeep(mapFeatureOptions));

  return (
    <>
      {Object.values(mapFeatureOption).map(option => {
        return (
          <OptionsBodyRow key={`map-feature-option-${option}`}>
            <EdstTooltip
              style={{ flexGrow: 1 }}
              onMouseDown={() => setCurrentOptions(prev => ({ ...prev, [option as mapFeatureOption]: !currentOptions[option as mapFeatureOption] }))}
            >
              <OptionsFlexCol>
                <OptionSelectedIndicator selected={currentOptions[option as mapFeatureOption]} />
                {option}
              </OptionsFlexCol>
            </EdstTooltip>
          </OptionsBodyRow>
        );
      })}
      <OptionsBottomRow>
        <OptionsBodyCol>
          <EdstButton
            content="OK"
            onMouseDown={() => {
              // set data when OK is pressed
              dispatch(setMapFeatureOptions(currentOptions));
              dispatch(closeWindow(EdstWindow.GPD_MAP_OPTIONS_MENU));
            }}
          />
        </OptionsBodyCol>
        <OptionsBodyCol alignRight>
          <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(EdstWindow.GPD_MAP_OPTIONS_MENU))} />
        </OptionsBodyCol>
      </OptionsBottomRow>
    </>
  );
};
