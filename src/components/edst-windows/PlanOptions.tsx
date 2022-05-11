import React, {useRef} from 'react';
import {EdstButton} from "../resources/EdstButton";
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {menuEnum, windowEnum} from "../../enums";
import {openMenuThunk} from "../../redux/thunks/thunks";
import {
  aselSelector,
  AselType, closeMenu,
  menuPositionSelector,
  setAsel,
  zStackSelector,
  pushZStack
} from "../../redux/slices/appSlice";
import {deleteAclEntry, deleteDepEntry, entrySelector} from "../../redux/slices/entriesSlice";
import {useCenterCursor, useDragging, useFocused} from "../../hooks";
import {
  FidRow,
  OptionsBody,
  OptionsBodyCol,
  OptionsBodyRow,
  OptionsMenu,
  OptionsMenuHeader
} from '../../styles/optionMenuStyles';
import styled from "styled-components";
import {EdstDraggingOutline} from "../../styles/draggingStyles";

const PlanOptionsDiv = styled(OptionsMenu)``;
const PlanOptionsBody = styled(OptionsBody)`text-indent: 4px`;

export const PlanOptions: React.FC = () => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector) as AselType;
  const pos = useRootSelector(menuPositionSelector(menuEnum.planOptions));
  const zStack = useRootSelector(zStackSelector);
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  const entry = useRootSelector(entrySelector(asel.cid));
  const dep = asel.window === windowEnum.dep;
  useCenterCursor(ref, [asel]);
  const {startDrag, stopDrag, dragPreviewStyle} = useDragging(ref, menuEnum.equipmentTemplateMenu);

  function openMenu(menu: menuEnum) {
    dispatch(openMenuThunk(menu, ref.current, menuEnum.planOptions, true));
    dispatch(closeMenu(menuEnum.planOptions));
  }

  return pos && (<PlanOptionsDiv
      ref={ref}
      width={220}
      pos={pos}
      zIndex={zStack.indexOf(menuEnum.planOptions)}
      onMouseDown={() => zStack.indexOf(menuEnum.planOptions) > 0 && dispatch(pushZStack(menuEnum.planOptions))}
      id="plan-menu"
    >
      {dragPreviewStyle && <EdstDraggingOutline
          style={dragPreviewStyle}
          onMouseUp={stopDrag}
      />}
      <OptionsMenuHeader
        focused={focused}
        onMouseDown={startDrag}
        onMouseUp={stopDrag}
      >
        Plan Options Menu
      </OptionsMenuHeader>
      <PlanOptionsBody>
        <FidRow>
          {entry.cid} {entry.callsign}
        </FidRow>
        <OptionsBodyRow>
          <EdstTooltip style={{flexGrow: 1}}
                       title={Tooltips.planOptionsAlt}
                       onMouseDown={() => openMenu(menuEnum.altitudeMenu)}
          >
            <OptionsBodyCol hover={true}>
              Altitude...
            </OptionsBodyCol>
          </EdstTooltip>
        </OptionsBodyRow>
        {!dep && <OptionsBodyRow>
            <EdstTooltip
                style={{flexGrow: 1}}
                title={Tooltips.planOptionsSpeed}
                disabled={true}
            >
                <OptionsBodyCol hover={true}>
                    Speed...
                </OptionsBodyCol>
            </EdstTooltip>
        </OptionsBodyRow>}
        <OptionsBodyRow>
          <EdstTooltip
            style={{flexGrow: 1}}
            title={Tooltips.planOptionsRoute}
            onMouseDown={() => openMenu(menuEnum.routeMenu)}
          >
            <OptionsBodyCol hover={true}>
              Route...
            </OptionsBodyCol>
          </EdstTooltip>
        </OptionsBodyRow>
        <OptionsBodyRow>
          <EdstTooltip
            style={{flexGrow: 1}}
            title={Tooltips.planOptionsPrevRoute}
            disabled={entry?.previous_route === undefined}
            onMouseDown={() => openMenu(menuEnum.prevRouteMenu)}
          >
            <OptionsBodyCol hover={true}>
              Previous Route
            </OptionsBodyCol>
          </EdstTooltip>

        </OptionsBodyRow>
        {!dep && <OptionsBodyRow>
            <EdstTooltip
                style={{flexGrow: 1}}
                title={Tooltips.planOptionsStopProbe}
                disabled={true}
            >
                <OptionsBodyCol hover={true}>
                    Stop Probe...
                </OptionsBodyCol>
            </EdstTooltip>

        </OptionsBodyRow>}
        <OptionsBodyRow>
          <EdstTooltip
            style={{flexGrow: 1}}
            title={Tooltips.planOptionsTrialRestr}
            disabled={true}
          >
            <OptionsBodyCol hover={true}>
              {`Trial ${dep ? 'Departure' : 'Restrictions'}...`}
            </OptionsBodyCol>
          </EdstTooltip>
        </OptionsBodyRow>
        {!dep && <OptionsBodyRow>
            <EdstTooltip
                style={{flexGrow: 1}}
                title={Tooltips.planOptionsPlans}
            >
                <OptionsBodyCol hover={true}>
                    Plans
                </OptionsBodyCol>
            </EdstTooltip>
        </OptionsBodyRow>}
        <OptionsBodyRow>
          <EdstTooltip
            style={{flexGrow: 1}}
            title={Tooltips.planOptionsKeep}
          >
            <OptionsBodyCol hover={true}>
              Keep
            </OptionsBodyCol>
          </EdstTooltip>
        </OptionsBodyRow>
        <OptionsBodyRow>
          <EdstTooltip
            style={{flexGrow: 1}}
            title={Tooltips.planOptionsDelete}
            onMouseDown={() => {
              dispatch(asel.window === windowEnum.acl ? deleteAclEntry(asel.cid) : deleteDepEntry(asel.cid));
              dispatch(setAsel(null));
              dispatch(closeMenu(menuEnum.planOptions));
            }}
          >
            <OptionsBodyCol hover={true}>
              Delete
            </OptionsBodyCol>
          </EdstTooltip>
        </OptionsBodyRow>
        <OptionsBodyRow margin="0">
          <OptionsBodyCol alignRight={true}>
            <EdstButton content="Exit" onMouseDown={() => dispatch(closeMenu(menuEnum.planOptions))}/>
          </OptionsBodyCol>
        </OptionsBodyRow>
      </PlanOptionsBody>
    </PlanOptionsDiv>
  );
};
