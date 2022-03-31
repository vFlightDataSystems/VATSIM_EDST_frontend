import React, {useContext, useEffect, useRef, useState} from 'react';


import _ from "lodash";
import {EdstButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";
import {EdstTooltip} from "../../resources/EdstTooltip";
import {EdstContext} from "../../../contexts/contexts";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {menuEnum} from "../../../enums";
import {
  aselSelector,
  AselType, closeMenu,
  menuPositionSelector
} from "../../../redux/slices/appSlice";
import {aselEntrySelector} from "../../../redux/slices/entriesSlice";
import {LocalEdstEntryType} from "../../../types";
import {amendEntryThunk} from "../../../redux/thunks/entriesThunks";
import {useFocused} from "../../../hooks";
import {
  EdstInput,
  FidRow,
  OptionsBody,
  OptionsBodyCol,
  OptionsBodyRow,
  OptionsMenu,
  OptionsMenuHeader
} from '../../../styles/optionMenuStyles';
import {Row, Row2, Col1, Col2, ScrollContainer, ScrollRow, ScrollCol, ScrollCol2} from './styled';
import { InputContainer } from '../../InputComponents';

export const HeadingMenu: React.FC = () => {
  const {
    startDrag,
    stopDrag
  } = useContext(EdstContext);
  const asel = useAppSelector(aselSelector) as AselType;
  const entry = useAppSelector(aselEntrySelector) as LocalEdstEntryType;
  const pos = useAppSelector(menuPositionSelector(menuEnum.headingMenu));
  const dispatch = useAppDispatch();

  const [heading, setHeading] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [amend, setAmend] = useState(true);
  const ref = useRef(null);
  const focused = useFocused(ref);

  useEffect(() => {
    setHeading(280);
    setDeltaY(0);
    setAmend(true);
  }, [asel]);

  const handleMouseDown = (event: React.MouseEvent, value: number, direction: string | null = null) => {
    const valueStr = direction === null ? `${amend ? 'H' : ''}${value}`
      : `${value}${direction}`;

    switch (event.button) {
      case 0:
        dispatch(amendEntryThunk({
          cid: entry.cid, planData: {
            [amend ? 'hdg' : 'scratchHdg']: valueStr,
            [!amend ? 'hdg' : 'scratchHdg']: null
          }
        }));
        break;
      case 1:
        dispatch(amendEntryThunk({
          cid: entry.cid, planData: {
            [amend ? 'hdg' : 'scratchHdg']: valueStr
          }
        }));
        break;
      default:
        break;
    }
    dispatch(closeMenu(menuEnum.headingMenu));
  };

  return pos && entry && (<OptionsMenu
    width={190}
    pos={pos}
    ref={ref}
    id="heading-menu"
  >
    <OptionsMenuHeader
      focused={focused}
      onMouseDown={(event) => startDrag(event, ref, menuEnum.headingMenu)}
      onMouseUp={(event) => stopDrag(event)}
    >
      Heading Information
    </OptionsMenuHeader>
    <OptionsBody>
      <FidRow>
        {entry.callsign} {entry.type}/{entry.equipment}
      </FidRow>
      <Row
        // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
      >
        <OptionsBodyCol
          // onMouseDown={() => props.openMenu(routeMenuRef.current, 'spd-hdg-menu', false)}
        >
          <EdstButton content="Amend" selected={amend}
                      onMouseDown={() => setAmend(true)}
                      title={Tooltips.aclHdgAmend}
          />
        </OptionsBodyCol>
        <OptionsBodyCol alignRight={true}>
          <EdstButton content="Scratchpad" selected={!amend}
                      onMouseDown={() => setAmend(false)}
                      title={Tooltips.aclHdgScratchpad}
          />
        </OptionsBodyCol>
      </Row>
      <Row>
        <OptionsBodyCol>
          Heading:
          <InputContainer>
            <EdstInput value={heading} onChange={(e) => setHeading(Number(e.target.value))}/>
          </InputContainer>
        </OptionsBodyCol>
      </Row>
      <Row2 topBorder={true} justifyContent="space-between">
        <EdstTooltip title={Tooltips.aclHdgHdg}>
          <Col1>
            Heading
          </Col1>
        </EdstTooltip>
        <EdstTooltip title={Tooltips.aclHdgTurn}>
          <Col1>
            Turn
          </Col1>
        </EdstTooltip>
      </Row2>
      <Row2 bottomBorder={true}>
        <Col2>
          L &nbsp;&nbsp; R
        </Col2>
      </Row2>
      <ScrollContainer onWheel={(e) => setDeltaY(deltaY + e.deltaY)}>
        {_.range(50, -70, -10).map(i => {
          const centerHdg = ((heading - (deltaY / 100 | 0) * 10 + i) % 360 + 360) % 360;
          const centerRelHdg = 35 + i / 2;
          return <ScrollRow key={`heading-menu-${i}`}>
            <ScrollCol onMouseDown={(e) => handleMouseDown(e, centerHdg)}>
              {String(centerHdg).padStart(3, '0')}
            </ScrollCol>
            <ScrollCol onMouseDown={(e) => handleMouseDown(e, centerHdg + 5)}>
              {String(centerHdg + 5).padStart(3, '0')}
            </ScrollCol>
            <ScrollCol2 onMouseDown={(e) => handleMouseDown(e, centerRelHdg, 'L')}>
              {centerRelHdg}
            </ScrollCol2>
            <ScrollCol2 onMouseDown={(e) => handleMouseDown(e, centerRelHdg, 'R')}>
              {centerRelHdg}
            </ScrollCol2>
          </ScrollRow>;
        })}
        <Row margin="8px 0 0 0" justifyContent="center">
          <EdstButton content="Present Heading" onMouseDown={(event) => {
            switch (event.button) {
              case 0:
                dispatch(amendEntryThunk({
                  cid: entry.cid, planData: {
                    [amend ? 'hdg' : 'scratchHdg']: 'PH',
                    [!amend ? 'hdg' : 'scratchHdg']: null
                  }
                }));
                break;
              case 1:
                dispatch(amendEntryThunk({
                  cid: entry.cid, planData: {
                    [amend ? 'hdg' : 'scratchHdg']: 'PH'
                  }
                }));
                break;
              default:
                break;
            }
            dispatch(closeMenu(menuEnum.headingMenu));
          }}/>
        </Row>
        <OptionsBodyRow margin="0">
          <OptionsBodyCol alignRight={true}>
            <EdstButton content="Exit" onMouseDown={() => dispatch(closeMenu(menuEnum.headingMenu))}/>
          </OptionsBodyCol>
        </OptionsBodyRow>
      </ScrollContainer>
    </OptionsBody>
  </OptionsMenu>);
}