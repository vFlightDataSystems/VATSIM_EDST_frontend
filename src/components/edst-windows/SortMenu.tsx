import React, { useRef, useState } from "react";

import styled from "styled-components";
import { EdstButton } from "../resources/EdstButton";
import { EdstTooltip } from "../resources/EdstTooltip";
import { Tooltips } from "../../tooltips";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { setAclSort } from "../../redux/slices/aclSlice";
import { setDepSort } from "../../redux/slices/depSlice";
import { closeWindow, zStackSelector, pushZStack, windowSelector } from "../../redux/slices/appSlice";
import { useCenterCursor, useDragging, useFocused } from "../../hooks/utils";
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
import { EdstWindow, SortOptions } from "../../namespaces";

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
  //height: 20px;
  padding: 0 6px;

  &:hover {
    border: 1px solid #adadad;
  }
`;

export const SortMenu: React.FC = () => {
  const dispatch = useRootDispatch();
  const windowProps = useRootSelector(windowSelector(EdstWindow.SORT_MENU));
  const window = windowProps.openedBy;
  const sortData = useRootSelector(state => state[window === EdstWindow.ACL ? "acl" : "dep"].sortData);
  const zStack = useRootSelector(zStackSelector);
  const [sortState, setSortState] = useState({ ...sortData });
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.SORT_MENU);

  const sortStateCopy = { ...sortState };

  return (
    windowProps?.position && (
      <SortDiv
        ref={ref}
        width={window === EdstWindow.ACL ? 220 : 190}
        pos={windowProps.position}
        zIndex={zStack.indexOf(EdstWindow.SORT_MENU)}
        onMouseDown={() => zStack.indexOf(EdstWindow.SORT_MENU) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.SORT_MENU))}
        anyDragging={anyDragging}
        id="sort-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <SortHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          Sort Menu
        </SortHeader>
        <SortBody>
          {window === EdstWindow.ACL && (
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
                sortStateCopy.selectedOption = SortOptions.ACID;
                setSortState(sortStateCopy);
              }}
              title={Tooltips.sortAcid}
            >
              <SortCol>
                <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.ACID} diamond />
                ACID
              </SortCol>
            </EdstTooltip>
          </OptionsBodyRow>
          {window === EdstWindow.ACL && (
            <OptionsBodyRow>
              <EdstTooltip
                style={{ flexGrow: 1 }}
                onMouseDown={() => {
                  sortStateCopy.selectedOption = SortOptions.BOUNDARY_TIME;
                  setSortState(sortStateCopy);
                }}
                title={Tooltips.sortBoundaryTime}
              >
                <SortCol>
                  <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.BOUNDARY_TIME} diamond />
                  Boundary Time
                </SortCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          {window === EdstWindow.ACL && (
            <OptionsBodyRow>
              <EdstTooltip
                style={{ flexGrow: 1 }}
                onMouseDown={() => {
                  sortStateCopy.selectedOption = SortOptions.CONFLICT_STATUS;
                  setSortState(sortStateCopy);
                }}
                disabled
                title={Tooltips.sortConflictStatus}
              >
                <SortCol>
                  <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.CONFLICT_STATUS} diamond />
                  Conflict Status
                </SortCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          {window === EdstWindow.ACL && (
            <OptionsBodyRow>
              <EdstTooltip
                style={{ flexGrow: 1 }}
                onMouseDown={() => {
                  sortStateCopy.selectedOption = SortOptions.CONFLICT_TIME;
                  setSortState(sortStateCopy);
                }}
                disabled
                title={Tooltips.sortConflictTime}
              >
                <SortCol>
                  <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.CONFLICT_TIME} diamond />
                  Conflict Time
                </SortCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          <OptionsBodyRow>
            <EdstTooltip
              style={{ flexGrow: 1 }}
              onMouseDown={() => {
                sortStateCopy.selectedOption = SortOptions.DESTINATION;
                setSortState(sortStateCopy);
              }}
              title={Tooltips.sortDestination}
            >
              <SortCol>
                <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.DESTINATION} diamond />
                Destination
              </SortCol>
            </EdstTooltip>
          </OptionsBodyRow>
          {window === EdstWindow.ACL && (
            <OptionsBodyRow>
              <EdstTooltip
                style={{ flexGrow: 1 }}
                onMouseDown={() => {
                  sortStateCopy.selectedOption = SortOptions.SECTOR_BY_SECTOR;
                  setSortState(sortStateCopy);
                }}
                disabled
                title={Tooltips.sortSectorBySector}
              >
                <SortCol>
                  <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.SECTOR_BY_SECTOR} diamond />
                  Sector-by-Sector
                </SortCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          {window === EdstWindow.DEP && (
            <OptionsBodyRow>
              <EdstTooltip
                style={{ flexGrow: 1 }}
                onMouseDown={() => {
                  sortStateCopy.selectedOption = SortOptions.ORIGIN;
                  setSortState(sortStateCopy);
                }}
                title={Tooltips.sortOrigin}
              >
                <SortCol>
                  <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.ORIGIN} diamond />
                  Origin
                </SortCol>
              </EdstTooltip>
            </OptionsBodyRow>
          )}
          {window === EdstWindow.DEP && (
            <OptionsBodyRow>
              <EdstTooltip
                style={{ flexGrow: 1 }}
                onMouseDown={() => {
                  sortStateCopy.selectedOption = SortOptions.P_TIME;
                  setSortState(sortStateCopy);
                }}
                disabled
                title={Tooltips.sortPTime}
              >
                <SortCol>
                  <OptionSelectedIndicator selected={sortState.selectedOption === SortOptions.P_TIME} diamond />
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
                  dispatch(EdstWindow.ACL ? setAclSort(sortState) : setDepSort(sortState));
                  dispatch(closeWindow(EdstWindow.SORT_MENU));
                }}
              />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(EdstWindow.SORT_MENU))} />
            </OptionsBodyCol>
          </OptionsBottomRow>
        </SortBody>
      </SortDiv>
    )
  );
};
