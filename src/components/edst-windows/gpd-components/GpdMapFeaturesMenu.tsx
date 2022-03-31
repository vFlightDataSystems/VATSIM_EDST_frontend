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
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {gpdMapFeatureOptionsSelector, MapFeatureOptionEnum, setMapFeatureOptions} from "../../../redux/slices/gpdSlice";
import _ from "lodash";


export const GpdMapFeaturesMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const mapFeatureOptions = useAppSelector(gpdMapFeatureOptionsSelector);
  const [currentOptions, setCurrentOptions] = useState(_.cloneDeep(mapFeatureOptions));

  return (<>
      {Object.values(MapFeatureOptionEnum).map((option) => {
        return <OptionsBodyRow>
          <EdstTooltip style={{flexGrow: 1}} onMouseDown={() => setCurrentOptions(prev => ({...prev, [option as MapFeatureOptionEnum]: !currentOptions[option as MapFeatureOptionEnum]}))}>
            <OptionsFlexCol>
              <OptionSelectedIndicator
                selected={currentOptions[option as MapFeatureOptionEnum]}
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