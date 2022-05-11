import React, {useContext, useEffect, useRef, useState} from 'react';

import {EdstContext} from "../../contexts/contexts";
import {computeFrdString, getDepString, getDestString} from "../../lib";
import {EdstButton} from "../resources/EdstButton";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {menuEnum, windowEnum} from "../../enums";
import {aselEntrySelector} from "../../redux/slices/entriesSlice";
import {aselSelector, closeMenu, menuPositionSelector, setInputFocused, zStackSelector, pushZStack} from "../../redux/slices/appSlice";
import {openMenuThunk} from "../../redux/thunks/thunks";
import {EdstTooltip} from "../resources/EdstTooltip";
import {Tooltips} from "../../tooltips";
import {useCenterCursor, useFocused} from "../../hooks";
import {
  EdstInput,
  EdstTextArea,
  OptionsBody,
  OptionsMenu,
  OptionsMenuHeader
} from '../../styles/optionMenuStyles';
import styled from "styled-components";

const TemplateBodyDiv = styled(OptionsBody)`padding: 10px 0 2px 0`;

const TemplateRowDiv = styled.div<{ alignRight?: boolean }>`
  padding: 2px 12px;
  display: flex;
  flex-grow: 1;
  border: none;
  overflow: hidden;

  ${props => props.alignRight && {width: "auto"}};

  &.left {
    flex-grow: 1;
  }
`;

const TemplateCol = styled.div<{ bottomRow?: boolean, alignRight?: boolean, width?: number, textIndent?: boolean }>`
  align-items: center;
  vertical-align: center;
  padding: 0 2px;
  justify-content: left;
  display: flex;
  flex-shrink: 0;
  width: ${props => props.width ? props.width + "px" : "auto"};
  ${props => props.textIndent && {"text-indent": "6px"}}

  ${props => props.bottomRow && {
    padding: "2px"
  }}

  ${props => props.alignRight && {
    width: "auto",
    "margin-left": "auto"
  }}
`;

const FlexCol = styled(TemplateCol)`
  flex-grow: 1;
  flex-shrink: 1;
  width: auto;
`;

type TemplateInputProps = {
  title?: string,
  value: string | number,
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onFocus: () => void,
  onBlur: () => void
  rows?: number
}

const TemplateInput: React.FC<TemplateInputProps> = ({title, ...props}) => {
  return <EdstTooltip title={title} style={{flexGrow: 1, width: "auto"}}>
    <TemplateCol style={{flexGrow: 1, width: "auto", border: "1px solid transparent"}}>
      <EdstInput {...props}/>
    </TemplateCol>
  </EdstTooltip>;
}

const TemplateTextArea: React.FC<TemplateInputProps> = ({title, ...props}) => {
  return <EdstTooltip title={title} style={{flexGrow: 1, width: "auto"}}>
    <TemplateCol style={{flexGrow: 1, width: "auto", border: "1px solid transparent"}}>
      <EdstTextArea {...props}/>
    </TemplateCol>
  </EdstTooltip>;
}

export const TemplateMenu: React.FC = () => {
  const {
    startDrag,
    stopDrag
  } = useContext(EdstContext);
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector);
  const entry = useRootSelector(aselEntrySelector);
  const pos = useRootSelector(menuPositionSelector(menuEnum.templateMenu));
  const zStack = useRootSelector(zStackSelector);
  // const [displayRawRoute, setDisplayRawRoute] = useState(false);

  const route = (asel?.window === windowEnum.dep
      ? entry?.route?.concat(getDestString(entry?.dest) ?? '')
      : entry?._route?.replace(/^\.*/, '')?.concat(getDestString(entry?.dest) ?? ''))
    ?? '';
  const frd = entry?.referenceFix ? computeFrdString(entry.referenceFix) : '';

  const [aidInput, setAidInput] = useState(entry?.callsign ?? '');
  const [numInput, setNumInput] = useState(entry ? 1 : '');
  const [saiInput, setSaiInput] = useState('');
  const [typeInput, setTypeInput] = useState(entry?.type ?? '');
  const [equipInput, setEquipInput] = useState(entry?.equipment ?? '');
  const [beaconInput, setBeaconInput] = useState(entry?.beacon ?? '');
  const [speedInput, setSpeedInput] = useState(entry?.flightplan?.ground_speed ?? '');
  const [frdInput, setFrdInput] = useState(frd);
  const [timeInput, setTimeInput] = useState('EXX00');
  const [altInput, setAltInput] = useState(entry?.altitude ?? '');
  const [routeInput, setRouteInput] = useState((asel?.window === windowEnum.dep
    ? (getDepString(entry?.dep) ?? '') + route : (entry?.cleared_direct?.fix && route.startsWith(entry.cleared_direct?.fix)
    ? entry.cleared_direct?.frd + '..' : '') + route) ?? '');
  const [rmkInput, setRmkInput] = useState(entry?.remarks ?? '');

  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref, [asel]);

  useEffect(() => {
    return () => {
      dispatch(setInputFocused(false));
    } // eslint-disable-next-line
  }, []);

  return pos && (<OptionsMenu
    ref={ref}
    width={850}
    pos={pos}
    zIndex={zStack.indexOf(menuEnum.templateMenu)}
    onMouseDown={() => zStack.indexOf(menuEnum.templateMenu) > 0 && dispatch(pushZStack(menuEnum.templateMenu))}
    id="template-menu"
  >
    <OptionsMenuHeader
      focused={focused}
      onMouseDown={(event) => startDrag(event, ref, menuEnum.templateMenu)}
      onMouseUp={(event) => stopDrag(event)}
    >
      {asel ? 'Amendment' : 'Flight Plan'} Menu
    </OptionsMenuHeader>
    <TemplateBodyDiv>
      <TemplateRowDiv>
        <TemplateCol width={90} textIndent={true}>
          AID
        </TemplateCol>
        <TemplateCol width={50} textIndent={true}>
          NUM
        </TemplateCol>
        <TemplateCol width={50} textIndent={true}>
          SAI
        </TemplateCol>
        <TemplateCol width={62} textIndent={true}>
          TYP
        </TemplateCol>
        <TemplateCol width={66}>
          <EdstButton content="EQP..."
            onMouseDown={() => dispatch(openMenuThunk(menuEnum.equipmentTemplateMenu, ref.current))}
            title={Tooltips.templateMenuEqpButton}
          />
        </TemplateCol>
        <TemplateCol width={60} textIndent={true}>
          BCN
        </TemplateCol>
        <TemplateCol width={70} textIndent={true}>
          SPD
        </TemplateCol>
        <TemplateCol width={120} textIndent={true}>
          FIX
        </TemplateCol>
        <TemplateCol width={70} textIndent={true}>
          TIM
        </TemplateCol>
        <FlexCol textIndent={true}>
          ALT
        </FlexCol>
        <TemplateCol>
          <EdstButton margin="0 2px 0 0" disabled={true} content="More..." title={Tooltips.templateMenuMore} />
        </TemplateCol>
      </TemplateRowDiv>
      <TemplateRowDiv>
        <TemplateCol width={90}>
          <EdstTooltip title={Tooltips.templateMenuAid}>
            <TemplateInput
              value={aidInput}
              onChange={(event) => setAidInput(event.target.value.toUpperCase())}
              onFocus={() => dispatch(setInputFocused(true))}
              onBlur={() => dispatch(setInputFocused(false))}
            />
          </EdstTooltip>
        </TemplateCol>
        <TemplateCol width={50}>
          <EdstTooltip title={Tooltips.templateMenuNum}>
            <TemplateInput
              value={numInput}
              onChange={(event) => setNumInput(event.target.value.toUpperCase())}
              onFocus={() => dispatch(setInputFocused(true))}
              onBlur={() => dispatch(setInputFocused(false))}
            />
          </EdstTooltip>
        </TemplateCol>
        <TemplateCol width={50}>
          <EdstTooltip title={Tooltips.templateMenuSai}>
            <TemplateInput
              value={saiInput}
              onChange={(event) => setSaiInput(event.target.value.toUpperCase())}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
          </EdstTooltip>
        </TemplateCol>
        <TemplateCol width={60}>
          <EdstTooltip title={Tooltips.templateMenuTyp}>
            <TemplateInput
              value={typeInput}
              onChange={(event) => setTypeInput(event.target.value.toUpperCase())}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
          </EdstTooltip>
        </TemplateCol>
        <TemplateCol width={69}>
          <EdstTooltip title={Tooltips.templateMenuEqpBox}>
            <TemplateInput
              value={equipInput}
              onChange={(event) => setEquipInput(event.target.value.toUpperCase())}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
          </EdstTooltip>
        </TemplateCol>
        <TemplateCol width={60}>
          <EdstTooltip title={Tooltips.templateMenuBcn}>
            <TemplateInput
              value={beaconInput}
              onChange={(event) => setBeaconInput(event.target.value.toUpperCase())}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
          </EdstTooltip>
        </TemplateCol>
        <TemplateCol width={70}>
          <EdstTooltip title={Tooltips.templateMenuSpd}>
            <TemplateInput
              value={speedInput}
              onChange={(event) => setSpeedInput(event.target.value.toUpperCase())}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
          </EdstTooltip>
        </TemplateCol>
        <TemplateCol width={120}>
          <EdstTooltip title={Tooltips.templateMenuFix}>
            <TemplateInput
              value={frdInput}
              onChange={(event) => setFrdInput(event.target.value.toUpperCase())}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
          </EdstTooltip>
        </TemplateCol>
        <TemplateCol width={70}>
          <EdstTooltip title={Tooltips.templateMenuTim}>
            <TemplateInput
              value={timeInput}
              onChange={(event) => setTimeInput(event.target.value.toUpperCase())}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
          </EdstTooltip>
        </TemplateCol>
        <FlexCol>
          <EdstTooltip title={Tooltips.templateMenuAlt}>
            <TemplateInput
              value={altInput}
              onChange={(event) => setAltInput(event.target.value.toUpperCase())}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
          </EdstTooltip>
        </FlexCol>
      </TemplateRowDiv>
      <TemplateRowDiv>
        <TemplateCol width={50} textIndent={true}>
          RTE
        </TemplateCol>
      </TemplateRowDiv>
      <TemplateRowDiv>
        <TemplateTextArea
          title={Tooltips.templateMenuRte}
          value={routeInput}
          onChange={(event) => setRouteInput(event.target.value.toUpperCase())}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          rows={3}
        />
      </TemplateRowDiv>
      <TemplateRowDiv>
        <TemplateCol width={50} textIndent={true}>
          RMK
        </TemplateCol>
        <TemplateRowDiv alignRight={true} />
        <TemplateCol>
          <EdstButton disabled={true} content="Create FP..." title={Tooltips.templateMenuCreateFp} />
        </TemplateCol>
      </TemplateRowDiv>
      <TemplateRowDiv>
        <TemplateTextArea
          title={Tooltips.templateMenuRmk}
          value={rmkInput}
          onChange={(event) => setRmkInput(event.target.value.toUpperCase())}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          rows={3}
        />
      </TemplateRowDiv>
      <TemplateRowDiv>
        <TemplateCol bottomRow={true}>
          <EdstButton disabled={true} content="Send" title={Tooltips.templateMenuSend} />
        </TemplateCol>
        <TemplateCol bottomRow={true} alignRight={true}>
          <EdstButton content="Exit" title={Tooltips.templateMenuExit}
            onMouseDown={() => dispatch(closeMenu(menuEnum.templateMenu))} />
        </TemplateCol>
      </TemplateRowDiv>
    </TemplateBodyDiv>
  </OptionsMenu>
  );
};
