import React, { useRef, useState } from "react";
import styled from "styled-components";
import _ from "lodash";
import { WindowPosition } from "../../typeDefinitions/types/windowPosition";
import { NoSelectDiv } from "../../styles/NoSelectDiv";
import { FloatingWindowHeaderColDiv16ch, FloatingWindowHeaderColDivFlex, FloatingWindowHeaderDiv } from "../../styles/floatingWindowStyles";
import { useRootSelector } from "../../redux/hooks";
import { altimeterAirportsSelector } from "../../redux/slices/weatherSlice";

type AltimeterStationTemplateDivProps = { pos: WindowPosition };
const AltimeterStationTemplateDiv = styled(NoSelectDiv)<AltimeterStationTemplateDivProps>`
  position: absolute;
  display: flex;
  flex-flow: column;
  height: auto;
  width: auto;
  ${props => ({
    left: `${props.pos.left}px`,
    top: `${props.pos.top}px`
  })};
`;

const AltimeterStationTemplateRowDiv = styled.div`
  height: 1.1em;
  display: inline-flex;
`;

const AltimeterStationTemplateInput = styled.input`
  resize: none;
  white-space: initial;
  overflow: hidden;
  padding: 0 0.7ch;
  width: 6ch;
  outline: none;
  text-transform: uppercase;
  background-color: #000000;
  border: 1px solid #adadad;

  font-family: ${props => props.theme.fontProps.eramFontFamily};
  font-size: ${props => props.theme.fontProps.fontSize};
  color: ${props => props.theme.colors.grey};
`;

type AltimeterStationTemplateProps = {
  pos: WindowPosition;
  onClose: () => void;
};

export const AltimeterSettingTemplate = ({ pos, ...props }: AltimeterStationTemplateProps) => {
  const airports = useRootSelector(altimeterAirportsSelector);
  const ref = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  const rows = 30;
  const columns = 1;
  const [inputValues, setInputValues] = useState<string[]>(_.range(rows * columns).map(i => airports[i] ?? ""));

  const updateInput = (index: number, value: string) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = value;
    setInputValues(newInputValues);
  };

  return (
    <AltimeterStationTemplateDiv pos={pos} ref={ref}>
      <FloatingWindowHeaderDiv>
        <FloatingWindowHeaderColDivFlex>AS</FloatingWindowHeaderColDivFlex>
        <FloatingWindowHeaderColDiv16ch onMouseDown={props.onClose} ref={xRef}>
          X
        </FloatingWindowHeaderColDiv16ch>
      </FloatingWindowHeaderDiv>
      {_.range(0, rows, 1).map(i => (
        <AltimeterStationTemplateRowDiv key={i}>
          {_.range(0, columns, 1).map(j => (
            <AltimeterStationTemplateInput
              key={j}
              value={inputValues[i * columns + j]}
              onChange={event => updateInput(i * columns + j, event.target.value)}
            />
          ))}
        </AltimeterStationTemplateRowDiv>
      ))}
    </AltimeterStationTemplateDiv>
  );
};
