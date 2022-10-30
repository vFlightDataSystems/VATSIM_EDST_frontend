import React, { useState } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { EdstWindow } from "enums/edstWindow";
import { Tooltips } from "~/tooltips";
import { OptionsBodyRow, OptionIndicatorDiamond } from "styles/optionMenuStyles";
import { SortCol } from "styles/sortStyles";
import { depSortOptionSelector, setDepSort } from "~redux/slices/depSlice";
import { DepSortOption } from "enums/dep/depSortOption";
import { EdstTooltip } from "components/utils/EdstTooltip";
import { SortMenu } from "components/SortMenu";

export const DepSortMenu = () => {
  const dispatch = useRootDispatch();
  const depSelectedSortOption = useRootSelector(depSortOptionSelector);
  const [selectedOption, setSelectedOption] = useState(depSelectedSortOption);

  const onSubmit = () => {
    dispatch(setDepSort(selectedOption));
  };

  return (
    <SortMenu edstWindow={EdstWindow.DEP_SORT_MENU} onSubmit={onSubmit}>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setSelectedOption(DepSortOption.ACID)} title={Tooltips.sortAcid}>
          <SortCol>
            <OptionIndicatorDiamond selected={selectedOption === DepSortOption.ACID} />
            ACID
          </SortCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setSelectedOption(DepSortOption.DESTINATION)} title={Tooltips.sortDestination}>
          <SortCol>
            <OptionIndicatorDiamond selected={selectedOption === DepSortOption.DESTINATION} />
            Destination
          </SortCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setSelectedOption(DepSortOption.ORIGIN)} title={Tooltips.sortOrigin}>
          <SortCol>
            <OptionIndicatorDiamond selected={selectedOption === DepSortOption.ORIGIN} />
            Origin
          </SortCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setSelectedOption(DepSortOption.P_TIME)} disabled title={Tooltips.sortPTime}>
          <SortCol>
            <OptionIndicatorDiamond selected={selectedOption === DepSortOption.P_TIME} />
            P-Time
          </SortCol>
        </EdstTooltip>
      </OptionsBodyRow>
    </SortMenu>
  );
};
