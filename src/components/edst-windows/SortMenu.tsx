import React, { useRef, useState } from "react";

import styled from "styled-components";
import { EdstButton } from "../resources/EdstButton";
import { EdstTooltip } from "../resources/EdstTooltip";
import { Tooltips } from "../../tooltips";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { setAclSort } from "../../redux/slices/aclSlice";
import { setDepSort } from "../../redux/slices/depSlice";
import { EdstMenu, SortOptions, EdstWindow } from "../../enums";
import { closeMenu, menuSelector, zStackSelector, pushZStack } from "../../redux/slices/appSlice";
import { useCenterCursor, useDragging, useFocused } from "../../hooks";
import {
  OptionsBody,
  OptionsBodyCol,
  OptionsBodyRow,
  OptionsBottomRow,
  OptionSelectedIndicator,
  OptionsMenu,
  OptionsMenuHeader
} from "../../styles/optionMenuStyles";
import { EdstDraggingOutline } from "../../styles/draggingStyles";

const SortDiv = styled(OptionsMenu)<{ width: number }>(props => ({ width: `${props.width}px` }));
const SortHeader = styled(OptionsMenuHeader)``;
const SortBody = styled(OptionsBody)`
  padding: 4px 0;
`;

const SectorRow = styled(OptionsBodyRow)`
  padding-bottom: 4px;
  margin-bottom: 20px;
  border-bottom: 1px solid #adadad;
`;

const SortCol = styled(OptionsBodyCol)`
  justify-content: left;
  align-content: center;
  //height: 20px;
  padding: 0 6px;

  &:hover {
    border: 1px solid #adadad;
  }
`;

export const SortMenu: React.FC = () => {
  const dispatch = useRootDispatch();
  const menuProps = useRootSelector(menuSelector(EdstMenu.sortMenu));
  const window = menuProps.openedBy;
  const sortData = useRootSelector(state => state[window === EdstWindow.acl ? "acl" : "dep"].sortData);
  const zStack = useRootSelector(zStackSelector);
  const [sortState, setSortState] = useState({ ...sortData });
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstMenu.sortMenu);

  const sortStateCopy = { ...sortState };

  return (
    menuProps?.position && (
      <SortDiv
        ref={ref}
        width={window === EdstWindow.acl ? 220 : 190}
        pos={menuProps.position}
        zIndex={zStack.indexOf(EdstMenu.sortMenu)}
        onMouseDown={() => zStack.indexOf(EdstMenu.sortMenu) > 0 && dispatch(pushZStack(EdstMenu.sortMenu))}
        anyDragging={anyDragging}
        id="sort-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <SortHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          Sort Menu
        </SortHeader>
        <SortBody>
          {window === EdstWindow.acl && (
            <SectorRow>
              <EdstTooltip
                style={{ flexGrow: 1 }}
                onMouseDown={() => {
                  sortStateCopy.sector = !sortState.sector;
                  setSortState(sortStateCopy);
                }}
                title={Tooltips.sortAclSectorNonSector}
              >
                <SortCol>
                  <OptionSelectedIndicator selected={sortState.sector} />
                  Sector/Non-Sector
                </SortCol>
              </EdstTooltip>
            </SectorRow>
          )}
          <OptionsBodyRow>
            <EdstTooltip
              style={{ flexGrow: 1 }}
              onMouseDown={() => {
                sortStateCopy.selectedOption = SortOptions.acid;
                setSortState(sortStateCopy);
              }}
              title={Tooltips.sortAcid}
            >
              <SortCol>
                <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.acid} diamond />
                ACID
              </SortCol>
            </EdstTooltip>
          </OptionsBodyRow>
          {window === EdstWindow.acl && (
            <OptionsBodyRow>
              <EdstTooltip
                style={{ flexGrow: 1 }}
                onMouseDown={() => {
                  sortStateCopy.selectedOption = SortOptions.boundaryTime;
                  setSortState(sortStateCopy);
                }}
                title={Tooltips.sortBoundaryTime}
              >
                <SortCol>
                  <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.boundaryTime} diamond />
                  Boundary Time
                </SortCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          {window === EdstWindow.acl && (
            <OptionsBodyRow>
              <EdstTooltip
                style={{ flexGrow: 1 }}
                onMouseDown={() => {
                  sortStateCopy.selectedOption = SortOptions.conflictStatus;
                  setSortState(sortStateCopy);
                }}
                disabled
                title={Tooltips.sortConflictStatus}
              >
                <SortCol>
                  <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.conflictStatus} diamond />
                  Conflict Status
                </SortCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          {window === EdstWindow.acl && (
            <OptionsBodyRow>
              <EdstTooltip
                style={{ flexGrow: 1 }}
                onMouseDown={() => {
                  sortStateCopy.selectedOption = SortOptions.conflictTime;
                  setSortState(sortStateCopy);
                }}
                disabled
                title={Tooltips.sortConflictTime}
              >
                <SortCol>
                  <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.conflictTime} diamond />
                  Conflict Time
                </SortCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          <OptionsBodyRow>
            <EdstTooltip
              style={{ flexGrow: 1 }}
              onMouseDown={() => {
                sortStateCopy.selectedOption = SortOptions.destination;
                setSortState(sortStateCopy);
              }}
              title={Tooltips.sortDestination}
            >
              <SortCol>
                <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.destination} diamond />
                Destination
              </SortCol>
            </EdstTooltip>
          </OptionsBodyRow>
          {window === EdstWindow.acl && (
            <OptionsBodyRow>
              <EdstTooltip
                style={{ flexGrow: 1 }}
                onMouseDown={() => {
                  sortStateCopy.selectedOption = SortOptions.sectorBySector;
                  setSortState(sortStateCopy);
                }}
                disabled
                title={Tooltips.sortSectorBySector}
              >
                <SortCol>
                  <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.sectorBySector} diamond />
                  Sector-by-Sector
                </SortCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          {window === EdstWindow.dep && (
            <OptionsBodyRow>
              <EdstTooltip
                style={{ flexGrow: 1 }}
                onMouseDown={() => {
                  sortStateCopy.selectedOption = SortOptions.origin;
                  setSortState(sortStateCopy);
                }}
                title={Tooltips.sortOrigin}
              >
                <SortCol>
                  <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.origin} diamond />
                  Origin
                </SortCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          {window === EdstWindow.dep && (
            <OptionsBodyRow>
              <EdstTooltip
                style={{ flexGrow: 1 }}
                onMouseDown={() => {
                  sortStateCopy.selectedOption = SortOptions.pTime;
                  setSortState(sortStateCopy);
                }}
                disabled
                title={Tooltips.sortPTime}
              >
                <SortCol>
                  <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.pTime} diamond />
                  P-Time
                </SortCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          <OptionsBottomRow>
            <OptionsBodyCol>
              <EdstButton
                content="OK"
                onMouseDown={() => {
                  dispatch(
                    EdstWindow.acl
                      ? setAclSort({
                          selectedOption: sortState.selectedOption,
                          sector: sortState.sector
                        })
                      : setDepSort(sortState.selectedOption)
                  );
                  dispatch(closeMenu(EdstMenu.sortMenu));
                }}
              />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <EdstButton content="Exit" onMouseDown={() => dispatch(closeMenu(EdstMenu.sortMenu))} />
            </OptionsBodyCol>
          </OptionsBottomRow>
        </SortBody>
      </SortDiv>
    )
  );
};
