import React, { useState } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aclSortDataSelector, setAclSort } from "~redux/slices/aclSlice";
import { SortMenu } from "components/SortMenu";
import type { AclSortOption } from "types/acl/aclSortOption";
import optionStyles from "css/optionMenu.module.scss";
import sortStyles from "css/sortMenu.module.scss";
import clsx from "clsx";

export const AclSortMenu = () => {
  const dispatch = useRootDispatch();
  const aclSortData = useRootSelector(aclSortDataSelector);
  const [sector, setSector] = useState(aclSortData.sector);
  const [selectedOption, setSelectedOption] = useState(aclSortData.selectedOption);

  const onSubmit = () => {
    dispatch(setAclSort({ selectedOption, sector }));
  };

  const renderOption = (option: AclSortOption, content: string, disabled?: boolean) => (
    <div className={clsx(optionStyles.row, { isDisabled: disabled })}>
      <div className={sortStyles.col} onMouseDown={() => setSelectedOption(option)}>
        <div className={clsx(optionStyles.diamondIndicator, { selected: selectedOption === option })} />
        {content}
      </div>
    </div>
  );

  return (
    <SortMenu menu="ACL_SORT_MENU" onSubmit={onSubmit}>
      <div className={sortStyles.sectorRow}>
        <div className={sortStyles.col} onMouseDown={() => setSector(!sector)}>
          <div className={clsx(optionStyles.indicator, { selected: sector })} />
          Sector/Non-Sector
        </div>
      </div>
      {renderOption("ACL_ACID_SORT_OPTION", "ACID")}
      {renderOption("ACL_BOUNDARY_TIME_SORT_OPTION", "Boundary Time")}
      {renderOption("ACL_CONFLICT_STATUS_SORT_OPTION", "Conflict Status", true)}
      {renderOption("ACL_CONFLICT_TIME_SORT_OPTION", "Conflict Time", true)}
      {renderOption("ACL_DESTINATION_SORT_OPTION", "Destination")}
      {renderOption("ACL_SECTOR_BY_SECTOR_SORT_OPTION", "Sector-by-Sector", true)}
    </SortMenu>
  );
};
