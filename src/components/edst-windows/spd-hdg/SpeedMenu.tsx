import React, {useContext, useEffect, useRef, useState} from 'react';

import _ from "lodash";
import {EdstContext} from "../../../contexts/contexts";
import {EdstButton} from "../../resources/EdstButton";
import {Tooltips} from "../../../tooltips";
import {EdstTooltip} from "../../resources/EdstTooltip";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {menuEnum} from "../../../enums";
import {
  aselSelector,
  AselType, closeMenu,
  menuPositionSelector,
  zStackSelector
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
import { Row, Row3, ScrollContainer, ScrollRow, ScrollCol, ScrollCol3 } from './styled';
import {InputContainer} from "../../InputComponents";

enum signEnum {
  more = '+',
  less = '-',
  none = ''
}

export const SpeedMenu: React.FC = () => {
  const {
    startDrag,
    stopDrag
  } = useContext(EdstContext);
  const asel = useAppSelector(aselSelector) as AselType;
  const entry = useAppSelector(aselEntrySelector) as LocalEdstEntryType;
  const pos = useAppSelector(menuPositionSelector(menuEnum.speedMenu));
  const zStack = useAppSelector(zStackSelector);
  const dispatch = useAppDispatch();
  const [speed, setSpeed] = useState(280);
  const [deltaY, setDeltaY] = useState(0);
  const [sign, setSign] = useState<signEnum>(signEnum.none);
  const [amend, setAmend] = useState(true);
  const ref = useRef(null);
  const focused = useFocused(ref);

  useEffect(() => {
    setSpeed(280);
    setDeltaY(0);
    setSign(signEnum.none);
    setAmend(true);
  }, [asel.cid]);

  const handleScroll = (e: React.WheelEvent) => {
    const newDeltaY = Math.min(Math.max((speed - 400) * 10, deltaY + e.deltaY), (speed - 160) * 10);
    setDeltaY(newDeltaY);
  };

  const handleMouseDown = (event: any, value: number, mach = false) => {
    event.preventDefault();
    const valueStr = !mach ? `${(amend && sign === signEnum.none) ? 'S' : ''}${value}${sign}`
      : `M${Number(value * 100) | 0}${sign}`;
    switch (event.button) {
      case 0:
        dispatch(amendEntryThunk({
          cid: entry.cid, planData: {
            [amend ? 'spd' : 'scratchSpd']: valueStr,
            [!amend ? 'spd' : 'scratchSpd']: null
          }
        }));
        break;
      case 1:
        dispatch(amendEntryThunk({
          cid: entry.cid, planData: {
            [amend ? 'spd' : 'scratchSpd']: valueStr
          }
        }));
        break;
      default:
        break;
    }
    dispatch(closeMenu(menuEnum.speedMenu));
  };

  return pos && entry && (<OptionsMenu
      width={190}
      pos={pos}
      zIndex={zStack.indexOf(menuEnum.speedMenu)}
      ref={ref}
      id="speed-menu"
    >
      <OptionsMenuHeader
        focused={focused}
        onMouseDown={(event) => startDrag(event, ref, menuEnum.speedMenu)}
        onMouseUp={(event) => stopDrag(event)}
      >
        Speed Information
      </OptionsMenuHeader>
      <OptionsBody>
        <FidRow>
          {entry.callsign} {entry.type}/{entry.equipment}
        </FidRow>
        <Row>
          <OptionsBodyCol>
            <EdstButton content="Amend" selected={amend}
                        onMouseDown={() => setAmend(true)}
                        title={Tooltips.aclSpdAmend}
            />
          </OptionsBodyCol>
          <OptionsBodyCol alignRight={true}>
            <EdstButton content="Scratchpad" selected={!amend}
                        onMouseDown={() => setAmend(false)}
                        title={Tooltips.aclSpdScratchpad}
            />
          </OptionsBodyCol>
        </Row>
        <OptionsBodyRow>
          <OptionsBodyCol>
            Speed:
            <InputContainer>
              <EdstInput value={speed} onChange={(e) => setSpeed(Number(e.target.value))}/>
            </InputContainer>
          </OptionsBodyCol>
        </OptionsBodyRow>
        <Row3 topBorder={true}/>
        <Row3 bottomBorder={true}>
          <EdstTooltip content="KNOTS" title={Tooltips.aclSpdKnots}/>
          <EdstButton width={20} height={20} margin="0 2px 0 22px" content="+" selected={sign === signEnum.more}
                      onMouseDown={() => setSign(sign === signEnum.more ? signEnum.none : signEnum.more)}
          />
          <EdstButton width={20} height={20} margin="0 16px 0 2px" content="-" selected={sign === signEnum.less}
                      onMouseDown={() => setSign(sign === signEnum.less ? signEnum.none : signEnum.less)}
          />
          <EdstTooltip content="MACH" title={Tooltips.aclSpdMach}/>
        </Row3>
        <ScrollContainer onWheel={handleScroll}>
          {_.range(5, -6, -1).map(i => {
            const centerSpd = speed - (deltaY / 100 | 0) * 10 + i * 10;
            const centerMach = 0.79 - (deltaY / 100 | 0) / 100 + i / 100;
            return <ScrollRow key={`speed-menu-${i}`}>
              <ScrollCol onMouseDown={(e) => handleMouseDown(e, centerSpd)}>
                {String(centerSpd).padStart(3, '0')}{sign}
              </ScrollCol>
              <ScrollCol onMouseDown={(e) => handleMouseDown(e, centerSpd + 5)}>
                {String(centerSpd + 5).padStart(3, '0')}{sign}
              </ScrollCol>
              <ScrollCol3 onMouseDown={(e) => handleMouseDown(e, centerMach, true)}>
                {String(centerMach.toFixed(2)).slice(1)}{sign}
              </ScrollCol3>
            </ScrollRow>;
          })}
          <OptionsBodyRow margin="0">
            <OptionsBodyCol alignRight={true}>
              <EdstButton content="Exit" onMouseDown={() => dispatch(closeMenu(menuEnum.speedMenu))}/>
            </OptionsBodyCol>
          </OptionsBodyRow>
        </ScrollContainer>
      </OptionsBody>
    </OptionsMenu>
  );
};
