import React, { useState } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aclSortDataSelector, setAclSort } from "~redux/slices/aclSlice";
import { Tooltips } from "~/tooltips";
import { OptionsBodyRow, OptionIndicator, OptionIndicatorDiamond } from "styles/optionMenuStyles";
import { SectorRow, SortCol } from "styles/sortStyles";
import { SortMenu } from "components/SortMenu";

export const AclSortMenu = () => {
  const dispatch = useRootDispatch();
  const aclSortData = useRootSelector(aclSortDataSelector);
  const [sector, setSector] = useState(aclSortData.sector);
  const [selectedOption, setSelectedOption] = useState(aclSortData.selectedOption);

  const onSubmit = () => {
    dispatch(setAclSort({ selectedOption, sector }));
  };

  return (
    <SortMenu menu="ACL_SORT_MENU" onSubmit={onSubmit}>
      <SectorRow>
        <SortCol onMouseDown={() => setSector(!sector)} title={Tooltips.sortAclSectorNonSector}>
          <OptionIndicator selected={sector} />
          Sector/Non-Sector
        </SortCol>
      </SectorRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption("ACL_ACID_SORT_OPTION")} title={Tooltips.sortAcid}>
          <OptionIndicatorDiamond selected={selectedOption === "ACL_ACID_SORT_OPTION"} />
          ACID
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption("ACL_BOUNDARY_TIME_SORT_OPTION")} title={Tooltips.sortBoundaryTime}>
          <OptionIndicatorDiamond selected={selectedOption === "ACL_BOUNDARY_TIME_SORT_OPTION"} />
          Boundary Time
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption("ACL_CONFLICT_STATUS_SORT_OPTION")} disabled title={Tooltips.sortConflictStatus}>
          <OptionIndicatorDiamond selected={selectedOption === "ACL_CONFLICT_STATUS_SORT_OPTION"} />
          Conflict Status
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption("ACL_CONFLICT_TIME_SORT_OPTION")} disabled title={Tooltips.sortConflictTime}>
          <OptionIndicatorDiamond selected={selectedOption === "ACL_CONFLICT_TIME_SORT_OPTION"} />
          Conflict Time
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption("ACL_DESTINATION_SORT_OPTION")} title={Tooltips.sortDestination}>
          <OptionIndicatorDiamond selected={selectedOption === "ACL_DESTINATION_SORT_OPTION"} />
          Destination
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption("ACL_SECTOR_BY_SECTOR_SORT_OPTION")} disabled title={Tooltips.sortSectorBySector}>
          <OptionIndicatorDiamond selected={selectedOption === "ACL_SECTOR_BY_SECTOR_SORT_OPTION"} />
          Sector-by-Sector
        </SortCol>
      </OptionsBodyRow>
    </SortMenu>
  );
};
