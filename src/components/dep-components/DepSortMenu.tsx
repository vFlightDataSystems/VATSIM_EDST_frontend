import React, { useState } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { EdstWindow } from "enums/edstWindow";
import { Tooltips } from "~/tooltips";
import { OptionsBodyRow, OptionIndicatorDiamond } from "styles/optionMenuStyles";
import { SortCol } from "styles/sortStyles";
import { depSortOptionSelector, setDepSort } from "~redux/slices/depSlice";
import { DepSortOption } from "enums/dep/depSortOption";
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
        <SortCol onMouseDown={() => setSelectedOption(DepSortOption.ACID)} title={Tooltips.sortAcid}>
          <OptionIndicatorDiamond selected={selectedOption === DepSortOption.ACID} />
          ACID
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption(DepSortOption.DESTINATION)} title={Tooltips.sortDestination}>
          <OptionIndicatorDiamond selected={selectedOption === DepSortOption.DESTINATION} />
          Destination
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption(DepSortOption.ORIGIN)} title={Tooltips.sortOrigin}>
          <OptionIndicatorDiamond selected={selectedOption === DepSortOption.ORIGIN} />
          Origin
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption(DepSortOption.P_TIME)} disabled title={Tooltips.sortPTime}>
          <OptionIndicatorDiamond selected={selectedOption === DepSortOption.P_TIME} />
          P-Time
        </SortCol>
      </OptionsBodyRow>
    </SortMenu>
  );
};
