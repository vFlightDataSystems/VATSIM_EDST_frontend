import React, {useContext, useRef} from 'react';
import {EdstButton} from "../resources/EdstButton";
import {EdstContext} from "../../contexts/contexts";
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {menuEnum, windowEnum} from "../../enums";
import {openMenuThunk} from "../../redux/thunks/thunks";
import {
  aselSelector,
  AselType, closeMenu,
  menuPositionSelector,
  setAsel,
  zStackSelector,
  setZStack
} from "../../redux/slices/appSlice";
import {deleteAclEntry, deleteDepEntry} from "../../redux/slices/entriesSlice";
import {useCenterCursor, useFocused} from "../../hooks";
import {
  FidRow,
  OptionsBody,
  OptionsBodyCol,
  OptionsBodyRow,
  OptionsMenu,
  OptionsMenuHeader
} from '../../styles/optionMenuStyles';
import styled from "styled-components";

const PlanOptionsBody = styled(OptionsBody)`text-indent: 4px`;

export const PlanOptions: React.FC = () => {
  const dispatch = useAppDispatch();
  const asel = useAppSelector(aselSelector) as AselType;
  const pos = useAppSelector(menuPositionSelector(menuEnum.planOptions));
  const zStack = useAppSelector(zStackSelector);
  const {startDrag, stopDrag} = useContext(EdstContext);
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  const entry = useAppSelector(state => state.entries[asel.cid]);
  const dep = asel.window === windowEnum.dep;

  useCenterCursor(ref, [asel]);

  function openMenu(menu: menuEnum) {
    dispatch(openMenuThunk(menu, ref.current, menuEnum.planOptions, true));
    dispatch(closeMenu(menuEnum.planOptions));
  }

  return pos && (<OptionsMenu
      ref={ref}
      width={220}
      pos={pos}
      zIndex={zStack.indexOf(menuEnum.planOptions)}
      onMouseDown={() => zStack.indexOf(menuEnum.planOptions) > 0 && dispatch(setZStack(menuEnum.planOptions))}
      id="plan-menu"
    >
      <OptionsMenuHeader
        focused={focused}
        onMouseDown={(event) => startDrag(event, ref, menuEnum.planOptions)}
        onMouseUp={(event) => stopDrag(event)}
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
                title={Tooltips.planOptionsSpeed} // @ts-ignore
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
            title={Tooltips.planOptionsPrevRoute} // @ts-ignore
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
                title={Tooltips.planOptionsStopProbe} // @ts-ignore
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
            title={Tooltips.planOptionsTrialRestr} // @ts-ignore
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
    </OptionsMenu>
  );
};
