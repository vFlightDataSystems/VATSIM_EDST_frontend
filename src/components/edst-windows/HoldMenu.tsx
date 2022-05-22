import React, {useEffect, useRef, useState} from 'react';
import {computeCrossingTimes, formatUtcMinutes} from "../../lib";
import {EdstButton, HoldDirButton16, HoldDirButton20, HoldDirButton50} from "../resources/EdstButton";
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import _ from "lodash";
import {aselEntrySelector, toggleSpa, updateEntry} from "../../redux/slices/entriesSlice";
import {menuEnum} from "../../enums";
import {closeMenu, menuPositionSelector, zStackSelector, pushZStack} from "../../redux/slices/appSlice";
import {LocalEdstEntryType, RouteFixType} from "../../types";
import {amendEntryThunk} from "../../redux/thunks/entriesThunks";
import {useCenterCursor, useDragging, useFocused} from "../../hooks";
import {
  EdstInput,
  FidRow,
  OptionsBody,
  OptionsBodyCol,
  OptionsBodyRow,
  OptionsMenu,
  OptionsMenuHeader
} from '../../styles/optionMenuStyles';
import styled from "styled-components";
import {InputContainer} from "../InputComponents";
import {EdstDraggingOutline} from "../../styles/draggingStyles";

const HoldDiv = styled(OptionsMenu)`width: 420px`;
const FixContainer = styled.div`
  padding: 4px 0;
  border-bottom: 1px solid #ADADAD;
`;

const Row1 = styled(OptionsBodyRow)`justify-content: space-between`
const Row2 = styled(OptionsBodyRow)`padding: 6px 0`;
const LeftCol = styled(OptionsBodyCol)`
  margin-left: 10px;
  flex-grow: 0;
  padding: 0;
  border-bottom: 1px solid #ADADAD;
`;
const Col1 = styled(OptionsBodyCol)`
  justify-content: left;
  display: inline-flex;
  height: 18px;
  padding: 0 4px;
  flex-grow: 0;
  width: 110px;
  margin: 0 12px;
`;
const Col2 = styled(OptionsBodyCol)`
  justify-content: left;
  flex-grow: 1;
  margin: 5px 50px 5px 8px;
  border-bottom: 1px solid #ADADAD;
`;
const Col3 = styled(OptionsBodyCol)`
  justify-content: left;
  margin-top: 2px;

  *[disabled] {
    pointer-events: none;
    border-color: transparent;
  }
`;
const Col5 = styled(OptionsBodyCol)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
`;
const Col7 = styled(OptionsBodyCol)`
  justify-content: left;
  align-items: center;
  margin-left: 10px;
  margin-right: auto;
`;
const EfcInputContainer = styled(InputContainer)`
  margin-left: 20px;
  margin-right: 0;
  //height: 17px;
  width: 55px;
`;

export const HoldMenu: React.FC = () => {
  const entry = useRootSelector(aselEntrySelector) as LocalEdstEntryType;
  const pos = useRootSelector(menuPositionSelector(menuEnum.holdMenu));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();

  const now = new Date();
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const [holdFix, setHoldFix] = useState<string | null>(null);
  const [legLength, setLegLength] = useState<string | number | null>(null);
  const [holdDirection, setHoldDirection] = useState<string | null>(null);
  const [turns, setTurns] = useState<string | null>(null);
  const [efc, setEfc] = useState(utcMinutes);
  const [routeData, setRouteData] = useState<(RouteFixType & { minutesAtFix: number })[] | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const {startDrag, stopDrag, dragPreviewStyle, anyDragging} = useDragging(ref, menuEnum.holdMenu);

  useEffect(() => {
    if (!entry) {
      dispatch(closeMenu(menuEnum.holdMenu));
    } else {
      const routeData = computeCrossingTimes(entry);
      const now = new Date();
      const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
      setHoldFix(entry.hold_data?.hold_fix ?? 'PP');
      setLegLength(entry.hold_data?.leg_length ?? 'STD');
      setHoldDirection(entry.hold_data?.hold_direction ?? 'N');
      setTurns(entry.hold_data?.turns ?? 'RT');
      setEfc(entry.hold_data?.efc ?? utcMinutes + 30);
      setRouteData(routeData ?? null);
    } // eslint-disable-next-line
  }, []);

  const clearedHold = () => {
    if (entry) {
      const holdData = {
        hold_fix: holdFix,
        leg_length: legLength,
        hold_direction: holdDirection,
        turns: turns,
        efc: efc
      };
      dispatch(amendEntryThunk({cid: entry.cid, planData: {hold_data: holdData}}));
    }
    dispatch(closeMenu(menuEnum.holdMenu));
  };

  return pos && entry && (<HoldDiv
      ref={ref}
      pos={pos}
      zIndex={zStack.indexOf(menuEnum.holdMenu)}
      onMouseDown={() => zStack.indexOf(menuEnum.holdMenu) > 0 && dispatch(pushZStack(menuEnum.holdMenu))}
      anyDragging={anyDragging}
      id="hold-menu"
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
        Hold Data Menu
      </OptionsMenuHeader>
      <OptionsBody>
        <FidRow>
          {entry.callsign} {entry.type}/{entry.equipment}
        </FidRow>
        <OptionsBodyRow>
          <EdstTooltip title={Tooltips.holdDirection}>
            <LeftCol>
              Location
            </LeftCol>
          </EdstTooltip>
        </OptionsBodyRow>
        <OptionsBodyRow>
          <OptionsBodyCol>
            <EdstButton content="Present Position" selected={(!holdFix || holdFix === 'PP')}
                        onMouseDown={() => {
                          const now = new Date();
                          const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
                          setHoldFix('PP');
                          setEfc(utcMinutes + 30);
                        }}>
              Present Position
            </EdstButton>
          </OptionsBodyCol>
        </OptionsBodyRow>
        <FixContainer>
          {routeData && _.range(0, Math.min(routeData.length || 0, 10)).map(i =>
            <OptionsBodyRow key={`hold-menu-row-${i}`}>
              {_.range(0, ((routeData.length || 0) / 10 | 0) + 1).map(j => {
                const fixName = routeData?.[Number(i) + Number(j) * 10]?.name;
                const minutesAtFix = routeData?.[Number(i) + Number(j) * 10]?.minutesAtFix;
                return (fixName &&
                    <Col1 hover={true} selected={holdFix === fixName}
                          key={`hold-menu-col-${i}-${j}`}
                          onMouseDown={() => {
                            setHoldFix(fixName);
                            setEfc(minutesAtFix + 30);
                          }}>
                      {fixName}
                        <OptionsBodyCol alignRight={true} margin="0">
                          {("0" + ((minutesAtFix / 60 | 0) % 24)).slice(-2) + ("0" + (minutesAtFix % 60 | 0)).slice(-2)}
                        </OptionsBodyCol>
                    </Col1>);
              })}
            </OptionsBodyRow>)}
        </FixContainer>
        <Row1>
          <EdstTooltip title={Tooltips.holdDirection}>
            <Col2>
              Direction
            </Col2>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.holdTurns}>
            <Col2>
              Turns
            </Col2>
          </EdstTooltip>
          <EdstTooltip title={Tooltips.holdLegLength}>
            <Col2>
              Leg Lengths
            </Col2>
          </EdstTooltip>
        </Row1>
        <Row1>
          <Col3>
            <HoldDirButton16 content="NW" selected={holdDirection === 'NW'}
                             onMouseDown={() => setHoldDirection('NW')}
            />
            <HoldDirButton16 content="N" selected={holdDirection === 'N'}
                             onMouseDown={() => setHoldDirection('N')}
            />
            <HoldDirButton16 content="NE" selected={holdDirection === 'NE'}
                             onMouseDown={() => setHoldDirection('NE')}
            />
          </Col3>
          <Col3>
            <HoldDirButton20 content="LT" selected={turns === 'LT'}
                             onMouseDown={() => setTurns('LT')}
            />
            <HoldDirButton20 content="RT" selected={turns === 'RT'}
                             onMouseDown={() => setTurns('RT')}
            />
          </Col3>
          <Col3>
            <HoldDirButton50 content="STD" selected={!legLength || legLength === 'STD'}
                             onMouseDown={() => setLegLength('STD')}
            />
            <HoldDirButton50 content="15 NM" selected={!legLength || legLength === 15}
                             onMouseDown={() => setLegLength(15)}
            />
          </Col3>
        </Row1>
        <Row1>
          <Col3>
            <HoldDirButton16 content="W" selected={holdDirection === 'W'}
                             onMouseDown={() => setHoldDirection('W')}
            />
            <HoldDirButton16 disabled={true}/>
            <HoldDirButton16 content="E" selected={holdDirection === 'E'}
                             onMouseDown={() => setHoldDirection('E')}
            />
          </Col3>
          <Col3>
            <HoldDirButton20 disabled={true}/>
            <HoldDirButton20 disabled={true}/>
          </Col3>
          <Col3>
            <HoldDirButton50 content="5 NM" selected={!legLength || legLength === 5}
                             onMouseDown={() => setLegLength(5)}
            />
            <HoldDirButton50 content="20 NM" selected={!legLength || legLength === 20}
                             onMouseDown={() => setLegLength(20)}
            />
          </Col3>
        </Row1>
        <Row1>
          <Col3>
            <HoldDirButton16 content="SW" selected={holdDirection === 'SW'}
                             onMouseDown={() => setHoldDirection('SW')}
            />
            <HoldDirButton16 content="S" selected={holdDirection === 'S'}
                             onMouseDown={() => setHoldDirection('S')}
            />
            <HoldDirButton16 content="SE" selected={holdDirection === 'SE'}
                             onMouseDown={() => setHoldDirection('SE')}
            />
          </Col3>
          <Col3>
            <HoldDirButton20 disabled={true}/>
            <HoldDirButton20 disabled={true}/>
          </Col3>
          <Col3>
            <HoldDirButton50 content="10 NM" selected={!legLength || legLength === 10}
                             onMouseDown={() => setLegLength(10)}
            />
            <HoldDirButton50 content="25 NM" selected={!legLength || legLength === 25}
                             onMouseDown={() => setLegLength(25)}
            />
          </Col3>
        </Row1>
        <Row2 bottomBorder={true}>
          <Col5>
            <EdstButton
              content="Delete Hold Instructions"
              padding="0 20px"
              onMouseDown={() => {
                dispatch(amendEntryThunk({cid: entry.cid, planData: {hold_data: null}}));
                dispatch(updateEntry({cid: entry.cid, data: {aclRouteDisplay: null}}));
                dispatch(closeMenu(menuEnum.holdMenu));
              }}
              title={Tooltips.holdDeleteHoldInstr}
            />
          </Col5>
        </Row2>
        <Row1>
          <EdstTooltip title={Tooltips.holdEfc}>
            <Col2>
              EFC
            </Col2>
          </EdstTooltip>
        </Row1>
        <OptionsBodyRow>
          <Col7>
            <EfcInputContainer>
              <EdstInput value={formatUtcMinutes(efc)}
                         readOnly={true}
                // onChange={(e) => setEfc(e.target.value)}
              />
            </EfcInputContainer>
            <EdstButton content="-" margin="0 0 0 10px" width={24} onMouseDown={() => setEfc(efc - 1)}/>
            <EdstButton content="+" margin="0 0 0 4px" width={24} onMouseDown={() => setEfc(efc + 1)}/>
          </Col7>
        </OptionsBodyRow>
        <Row2 bottomBorder={true}>
          <Col5>
            <EdstButton content="Delete EFC" padding="0 6px" onMouseDown={() => setEfc(0)} title={Tooltips.holdDelEfc}/>
          </Col5>
        </Row2>
        <OptionsBodyRow margin="6px 0 0 0">
          <OptionsBodyCol>
            <EdstButton content="Hold/SPA" margin="0 6px 0 0" padding="0 6px" disabled={entry?.hold_data}
                        onMouseDown={() => {
                          if (!entry.spa) {
                            dispatch(toggleSpa(entry.cid));
                          }
                          clearedHold();
                        }}
                        title={Tooltips.holdHoldSpaBtn}
            />
            <EdstButton content="Hold" margin="0 6px 0 0" onMouseDown={clearedHold} disabled={entry?.hold_data}
                        title={Tooltips.holdHoldBtn}/>
            <EdstButton content="Cancel Hold" disabled={!entry?.hold_data}
                        onMouseDown={() => {
                          dispatch(amendEntryThunk({cid: entry.cid, planData: {hold_data: null}}));
                          dispatch(updateEntry({cid: entry.cid, data: {aclRouteDisplay: null}}));
                          dispatch(closeMenu(menuEnum.holdMenu));
                        }}
            />
          </OptionsBodyCol>
          <OptionsBodyCol alignRight={true}>
            <EdstButton content="Exit" onMouseDown={() => dispatch(closeMenu(menuEnum.holdMenu))}/>
          </OptionsBodyCol>
        </OptionsBodyRow>
      </OptionsBody>
    </HoldDiv>
  );
};
