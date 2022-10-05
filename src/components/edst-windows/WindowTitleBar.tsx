import React from "react";
import styled from "styled-components";
import { createBorder } from "../../styles/styles";

const buttonBorder = createBorder("1px", "#adadad", "#575757");
const blockBorder = createBorder("1px", "#adadad", "#575757");
const blockBorderInverted = createBorder("1px", "#575757", "#adadad");
const blockBorderBlue = createBorder("1px", "#adadad", "#005757");
const blockBorderBlueInverted = createBorder("1px", "#005757", "#adadad");

const WindowTitleBarDiv = styled.div`
  display: flex;
  justify-content: space-between;
  height: 24px;
`;
const WindowTitleBarCol = styled.div<{ middle?: boolean; focused?: boolean }>`
  display: inline-flex;

  ${props =>
    props.middle && {
      color: "#000000",
      "flex-grow": "1"
    }};
  > div,
  button {
    vertical-align: center;
    background-color: #888888;
    ${buttonBorder};

    ${props =>
      props.focused && {
        "background-color": "#008585"
      }}
  }
`;
const TitleBarText = styled.div`
  margin: 0 12px;
`;
const Block = styled.div<{ focused?: boolean; flexGrow?: number }>`
  flex-grow: ${props => props.flexGrow ?? 0};
  vertical-align: center;
  background-color: #888888;
  margin: 0;

  width: 24px;
  height: auto;

  ${props =>
    props.focused && {
      "background-color": "#008585"
    }}

  display: inline-flex;
  justify-content: center;
  align-items: center;
  ${props => (props.focused ? blockBorderBlue : blockBorder)};

  &:is(button):active {
    ${props => (props.focused ? blockBorderBlueInverted : blockBorderInverted)};
  }
`;
const Block3x3 = styled(Block)`
  width: 3px;
  height: 3px;
`;
const Block8x3 = styled(Block)`
  width: 8px;
  height: 3px;
`;
const InvertedBlock = styled(Block)`
  ${props => (props.focused ? blockBorderBlueInverted : blockBorderInverted)};
`;
const InvertedBlock8x8 = styled(InvertedBlock)`
  width: 8px;
  height: 8px;
`;

type WindowTitleBarProps = {
  focused: boolean;
  closeWindow: () => void;
  toggleFullscreen: () => void;
  startDrag: React.MouseEventHandler<HTMLDivElement>;
  text: string[];
};

/**
 * Window title bar for various components
 * @param focused focused state of window, title bar background becomes cyan if true
 * @param text text to display in the title bar
 * @param closeWindow eventHandler for close button
 * @param toggleFullscreen eventHandler for minimize/maximize button
 * @param startDrag startDrag event handler
 */
export const WindowTitleBar = ({ focused, text, closeWindow, toggleFullscreen, startDrag }: WindowTitleBarProps) => {
  return (
    <WindowTitleBarDiv>
      <WindowTitleBarCol focused={focused}>
        <Block as="button">
          <Block8x3 focused={focused} />
        </Block>
      </WindowTitleBarCol>
      <WindowTitleBarCol middle focused={focused} onMouseDown={startDrag}>
        <Block flexGrow={1}>
          {text.map(s => (
            <TitleBarText key={s}>{s}</TitleBarText>
          ))}
        </Block>
      </WindowTitleBarCol>
      <WindowTitleBarCol focused={focused}>
        <Block as="button" onClick={closeWindow}>
          <Block3x3 focused={focused} />
        </Block>
        <Block as="button" focused={focused} onClick={toggleFullscreen}>
          <InvertedBlock8x8 focused={focused} />
        </Block>
      </WindowTitleBarCol>
    </WindowTitleBarDiv>
  );
};
