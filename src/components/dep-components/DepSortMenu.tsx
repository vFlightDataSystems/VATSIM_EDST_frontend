import React, { useState } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { Tooltips } from "~/tooltips";
import { OptionsBodyRow, OptionIndicatorDiamond } from "styles/optionMenuStyles";
import { SortCol } from "styles/sortStyles";
import { depSortOptionSelector, setDepSort } from "~redux/slices/depSlice";
import { SortMenu } from "components/SortMenu";

export const DepSortMenu = () => {
  const dispatch = useRootDispatch();
  const depSelectedSortOption = useRootSelector(depSortOptionSelector);
  const [selectedOption, setSelectedOption] = useState(depSelectedSortOption);

  const onSubmit = () => {
    dispatch(setDepSort(selectedOption));
  };

  return (
    <SortMenu menu="DEP_SORT_MENU" onSubmit={onSubmit}>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption("DEP_ACID_SORT_OPTION")} title={Tooltips.sortAcid}>
          <OptionIndicatorDiamond selected={selectedOption === "DEP_ACID_SORT_OPTION"} />
          ACID
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption("DEP_DESTINATION_SORT_OPTION")} title={Tooltips.sortDestination}>
          <OptionIndicatorDiamond selected={selectedOption === "DEP_DESTINATION_SORT_OPTION"} />
          Destination
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption("DEP_ORIGIN_SORT_OPTION")} title={Tooltips.sortOrigin}>
          <OptionIndicatorDiamond selected={selectedOption === "DEP_ORIGIN_SORT_OPTION"} />
          Origin
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption("DEP_P_TIME_SORT_OPTION")} disabled title={Tooltips.sortPTime}>
          <OptionIndicatorDiamond selected={selectedOption === "DEP_P_TIME_SORT_OPTION"} />
          P-Time
        </SortCol>
      </OptionsBodyRow>
    </SortMenu>
  );
};
