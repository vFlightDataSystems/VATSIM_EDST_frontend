import React, { useRef, useState } from "react";
import styled from "styled-components";
import _ from "lodash";
import { WindowPosition } from "../../typeDefinitions/types/windowPosition";
import { defaultFontSize, eramFontFamily, NoSelectDiv } from "../../styles/styles";
import { FloatingWindowHeaderColDiv16ch, FloatingWindowHeaderColDivFlex, FloatingWindowHeaderDiv } from "../../styles/floatingWindowStyles";
import { useRootSelector } from "../../redux/hooks";
import { altimeterStateSelector } from "../../redux/slices/altimeterSlice";
import { edstFontGrey } from "../../styles/colors";

type AltimeterStationTemplateDivProps = { pos: WindowPosition };
const AltimeterStationTemplateDiv = styled(NoSelectDiv).attrs((props: AltimeterStationTemplateDivProps) => ({
  left: `${props.pos.x}px`,
  top: `${props.pos.y}px`
}))<AltimeterStationTemplateDivProps>`
  position: absolute;
  display: flex;
  flex-flow: column;
  height: auto;
  width: auto;
  left: ${props => props.left};
  top: ${props => props.top};
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

  font-family: ${eramFontFamily};
  font-size: ${defaultFontSize};
  color: ${edstFontGrey};
`;

type AltimeterStationTemplateProps = {
  pos: WindowPosition;
  onClose: () => void;
};

export const AltimeterStationTemplate = ({ pos, ...props }: AltimeterStationTemplateProps) => {
  const { lines, columns, airports } = useRootSelector(altimeterStateSelector);
  const ref = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  const rows = columns === 1 ? 30 : lines;
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
