import React, { useState } from "react";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { SortMenu } from "../SortMenu";
import { aclSortDataSelector, setAclSort } from "../../../redux/slices/aclSlice";
import { EdstWindow } from "../../../typeDefinitions/enums/edstWindow";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { Tooltips } from "../../../tooltips";
import { OptionsBodyRow, OptionSelectedIndicator } from "../../../styles/optionMenuStyles";
import { SectorRow, SortCol } from "../../../styles/sortStyles";
import { AclSortOption } from "../../../typeDefinitions/enums/acl/aclSortOption";

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
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setSector(!sector)} title={Tooltips.sortAclSectorNonSector}>
          <SortCol>
            <OptionSelectedIndicator selected={sector} />
            Sector/Non-Sector
          </SortCol>
        </EdstTooltip>
      </SectorRow>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setSelectedOption(AclSortOption.ACID)} title={Tooltips.sortAcid}>
          <SortCol>
            <OptionSelectedIndicator selected={selectedOption === AclSortOption.ACID} diamond />
            ACID
          </SortCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setSelectedOption(AclSortOption.BOUNDARY_TIME)} title={Tooltips.sortBoundaryTime}>
          <SortCol>
            <OptionSelectedIndicator selected={selectedOption === AclSortOption.BOUNDARY_TIME} diamond />
            Boundary Time
          </SortCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip
          style={{ flexGrow: 1 }}
          onMouseDown={() => setSelectedOption(AclSortOption.CONFLICT_STATUS)}
          disabled
          title={Tooltips.sortConflictStatus}
        >
          <SortCol>
            <OptionSelectedIndicator selected={selectedOption === AclSortOption.CONFLICT_STATUS} diamond />
            Conflict Status
          </SortCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip
          style={{ flexGrow: 1 }}
          onMouseDown={() => setSelectedOption(AclSortOption.CONFLICT_TIME)}
          disabled
          title={Tooltips.sortConflictTime}
        >
          <SortCol>
            <OptionSelectedIndicator selected={selectedOption === AclSortOption.CONFLICT_TIME} diamond />
            Conflict Time
          </SortCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setSelectedOption(AclSortOption.DESTINATION)} title={Tooltips.sortDestination}>
          <SortCol>
            <OptionSelectedIndicator selected={selectedOption === AclSortOption.DESTINATION} diamond />
            Destination
          </SortCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip
          style={{ flexGrow: 1 }}
          onMouseDown={() => setSelectedOption(AclSortOption.SECTOR_BY_SECTOR)}
          disabled
          title={Tooltips.sortSectorBySector}
        >
          <SortCol>
            <OptionSelectedIndicator selected={selectedOption === AclSortOption.SECTOR_BY_SECTOR} diamond />
            Sector-by-Sector
          </SortCol>
        </EdstTooltip>
      </OptionsBodyRow>
    </SortMenu>
  );
};
