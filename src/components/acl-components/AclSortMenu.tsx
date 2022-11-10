import React, { useState } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aclSortDataSelector, setAclSort } from "~redux/slices/aclSlice";
import { EdstWindow } from "enums/edstWindow";
import { Tooltips } from "~/tooltips";
import { OptionsBodyRow, OptionIndicator, OptionIndicatorDiamond } from "styles/optionMenuStyles";
import { SectorRow, SortCol } from "styles/sortStyles";
import { AclSortOption } from "enums/acl/aclSortOption";
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
    <SortMenu edstWindow={EdstWindow.ACL_SORT_MENU} onSubmit={onSubmit}>
      <SectorRow>
        <SortCol onMouseDown={() => setSector(!sector)} title={Tooltips.sortAclSectorNonSector}>
          <OptionIndicator selected={sector} />
          Sector/Non-Sector
        </SortCol>
      </SectorRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption(AclSortOption.ACID)} title={Tooltips.sortAcid}>
          <OptionIndicatorDiamond selected={selectedOption === AclSortOption.ACID} />
          ACID
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption(AclSortOption.BOUNDARY_TIME)} title={Tooltips.sortBoundaryTime}>
          <OptionIndicatorDiamond selected={selectedOption === AclSortOption.BOUNDARY_TIME} />
          Boundary Time
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption(AclSortOption.CONFLICT_STATUS)} disabled title={Tooltips.sortConflictStatus}>
          <OptionIndicatorDiamond selected={selectedOption === AclSortOption.CONFLICT_STATUS} />
          Conflict Status
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption(AclSortOption.CONFLICT_TIME)} disabled title={Tooltips.sortConflictTime}>
          <OptionIndicatorDiamond selected={selectedOption === AclSortOption.CONFLICT_TIME} />
          Conflict Time
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption(AclSortOption.DESTINATION)} title={Tooltips.sortDestination}>
          <OptionIndicatorDiamond selected={selectedOption === AclSortOption.DESTINATION} />
          Destination
        </SortCol>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <SortCol onMouseDown={() => setSelectedOption(AclSortOption.SECTOR_BY_SECTOR)} disabled title={Tooltips.sortSectorBySector}>
          <OptionIndicatorDiamond selected={selectedOption === AclSortOption.SECTOR_BY_SECTOR} />
          Sector-by-Sector
        </SortCol>
      </OptionsBodyRow>
    </SortMenu>
  );
};
