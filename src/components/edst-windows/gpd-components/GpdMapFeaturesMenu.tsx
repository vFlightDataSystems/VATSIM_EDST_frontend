import React, { useState } from "react";
import _ from "lodash";
import { OptionsBodyCol, OptionsBodyRow, OptionsBottomRow, OptionSelectedIndicator, OptionsFlexCol } from "../../../styles/optionMenuStyles";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { EdstButton } from "../../resources/EdstButton";
import { closeMenu } from "../../../redux/slices/appSlice";
import { EdstMenu } from "../../../enums";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { gpdMapFeatureOptionsSelector, mapFeatureOption, setMapFeatureOptions } from "../../../redux/slices/gpdSlice";

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
              dispatch(closeMenu(EdstMenu.gpdMapOptionsMenu));
            }}
          />
        </OptionsBodyCol>
        <OptionsBodyCol alignRight>
          <EdstButton content="Exit" onMouseDown={() => dispatch(closeMenu(EdstMenu.gpdMapOptionsMenu))} />
        </OptionsBodyCol>
      </OptionsBottomRow>
    </>
  );
};
