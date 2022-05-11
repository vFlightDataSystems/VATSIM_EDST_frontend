import {
  OptionsBodyCol,
  OptionsBodyRow,
  OptionsBottomRow,
  OptionSelectedIndicator,
  OptionsFlexCol
} from "../../../styles/optionMenuStyles";
import {EdstTooltip} from "../../resources/EdstTooltip";
import {EdstButton} from "../../resources/EdstButton";
import {closeMenu} from "../../../redux/slices/appSlice";
import {menuEnum} from "../../../enums";
import React, {useState} from "react";
import {useRootDispatch, useRootSelector} from "../../../redux/hooks";
import {gpdMapFeatureOptionsSelector, mapFeatureOptionEnum, setMapFeatureOptions} from "../../../redux/slices/gpdSlice";
import _ from "lodash";


export const GpdMapFeaturesMenu: React.FC = () => {
  const dispatch = useRootDispatch();
  const mapFeatureOptions = useRootSelector(gpdMapFeatureOptionsSelector);
  const [currentOptions, setCurrentOptions] = useState(_.cloneDeep(mapFeatureOptions));

  return (<>
      {Object.values(mapFeatureOptionEnum).map((option) => {
        return <OptionsBodyRow>
          <EdstTooltip style={{flexGrow: 1}} onMouseDown={() => setCurrentOptions(prev => ({...prev, [option as mapFeatureOptionEnum]: !currentOptions[option as mapFeatureOptionEnum]}))}>
            <OptionsFlexCol>
              <OptionSelectedIndicator
                selected={currentOptions[option as mapFeatureOptionEnum]}
              />
              {option}
            </OptionsFlexCol>
          </EdstTooltip>
        </OptionsBodyRow>
      })}
      <OptionsBottomRow>
        <OptionsBodyCol>
          <EdstButton content="OK" onMouseDown={() => {
            // set data when OK is pressed
            dispatch(setMapFeatureOptions(currentOptions));
            dispatch(closeMenu(menuEnum.gpdMapOptionsMenu));
          }}/>
        </OptionsBodyCol>
        <OptionsBodyCol alignRight={true}>
          <EdstButton content="Exit"
                      onMouseDown={() => dispatch(closeMenu(menuEnum.gpdMapOptionsMenu))}/>
        </OptionsBodyCol>
      </OptionsBottomRow>
    </>
  );
}