import React, { useState } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aclSortDataSelector, setAclSort } from "~redux/slices/aclSlice";
import { EdstWindow } from "enums/edstWindow";
import { Tooltips } from "~/tooltips";
import { OptionsBodyRow, OptionIndicator, OptionIndicatorDiamond } from "styles/optionMenuStyles";
import { SectorRow, SortCol } from "styles/sortStyles";
import { AclSortOption } from "enums/acl/aclSortOption";
import { EdstTooltip } from "../../utils/EdstTooltip";
import { SortMenu } from "../SortMenu";

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
            <OptionIndicator selected={sector} />
            Sector/Non-Sector
          </SortCol>
        </EdstTooltip>
      </SectorRow>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setSelectedOption(AclSortOption.ACID)} title={Tooltips.sortAcid}>
          <SortCol>
            <OptionIndicatorDiamond selected={selectedOption === AclSortOption.ACID} />
            ACID
          </SortCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setSelectedOption(AclSortOption.BOUNDARY_TIME)} title={Tooltips.sortBoundaryTime}>
          <SortCol>
            <OptionIndicatorDiamond selected={selectedOption === AclSortOption.BOUNDARY_TIME} />
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
            <OptionIndicatorDiamond selected={selectedOption === AclSortOption.CONFLICT_STATUS} />
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
            <OptionIndicatorDiamond selected={selectedOption === AclSortOption.CONFLICT_TIME} />
            Conflict Time
          </SortCol>
        </EdstTooltip>
      </OptionsBodyRow>
      <OptionsBodyRow>
        <EdstTooltip style={{ flexGrow: 1 }} onMouseDown={() => setSelectedOption(AclSortOption.DESTINATION)} title={Tooltips.sortDestination}>
          <SortCol>
            <OptionIndicatorDiamond selected={selectedOption === AclSortOption.DESTINATION} />
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
            <OptionIndicatorDiamond selected={selectedOption === AclSortOption.SECTOR_BY_SECTOR} />
            Sector-by-Sector
          </SortCol>
        </EdstTooltip>
      </OptionsBodyRow>
    </SortMenu>
  );
};
