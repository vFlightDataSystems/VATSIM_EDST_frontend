import React, { useState } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { depSortOptionSelector, setDepSort } from "~redux/slices/depSlice";
import { SortMenu } from "components/SortMenu";
import type { DepSortOption } from "types/dep/depSortOption";
import optionStyles from "css/optionMenu.module.scss";
import sortStyles from "css/sortMenu.module.scss";
import clsx from "clsx";

export const DepSortMenu = () => {
  const dispatch = useRootDispatch();
  const depSelectedSortOption = useRootSelector(depSortOptionSelector);
  const [selectedOption, setSelectedOption] = useState(depSelectedSortOption);

  const onSubmit = () => {
    dispatch(setDepSort(selectedOption));
  };

  const renderOption = (option: DepSortOption, content: string, disabled?: boolean) => (
    <div className={clsx(optionStyles.row, { isDisabled: disabled })}>
      <div className={sortStyles.col} onMouseDown={() => setSelectedOption(option)}>
        <div className={clsx(optionStyles.diamondIndicator, { selected: selectedOption === option })} />
        {content}
      </div>
    </div>
  );

  return (
    <SortMenu menu="DEP_SORT_MENU" onSubmit={onSubmit}>
      {renderOption("DEP_ACID_SORT_OPTION", "ACID")}
      {renderOption("DEP_DESTINATION_SORT_OPTION", "Destination")}
      {renderOption("DEP_ORIGIN_SORT_OPTION", "Origin")}
      {renderOption("DEP_P_TIME_SORT_OPTION", "P-Time", true)}
    </SortMenu>
  );
};
