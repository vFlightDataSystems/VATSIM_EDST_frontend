import React from "react";
import styled from "styled-components";

const WindowTitleBarDiv = styled.div`
  display: flex;
  justify-content: space-between;
  height: 24px;
`;
const WindowTitleBarCol = styled.div<{ middle?: boolean, focused?: boolean }>`
  display: inline-flex;

  ${props => props.middle && {
    color: "#000000",
    "flex-grow": "1"
  }};
  > div, button {
    vertical-align: center;
    background-color: #888888;
    border-top: 1px solid #ADADAD;
    border-left: 1px solid #ADADAD;
    border-bottom: 1px solid #575757;
    border-right: 1px solid #575757;

    ${props => props.focused && {
      "background-color": "#008585"
    }}
  }
`;
const TitleBarText = styled.div`margin: 0 12px;`;
const Block = styled.div<{ focused?: boolean, flexGrow?: number }>`
  flex-grow: ${props => props.flexGrow ?? 0};
  vertical-align: center;
  background-color: #888888;
  
  width: 24px;
  height: auto;

  ${props => props.focused && {
    "background-color": "#008585"
  }}

  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid ${props => props.focused ? "#005757" : "#575757"};
  border-right: 1px solid ${props => props.focused ? "#005757" : "#575757"};
  border-top: 1px solid #ADADAD;
  border-left: 1px solid #ADADAD;

  &:is(button):active {
    border-bottom: 1px solid #ADADAD;
    border-right: 1px solid #ADADAD;
    border-top: 1px solid ${props => props.focused ? "#005757" : "#575757"};
    border-left: 1px solid ${props => props.focused ? "#005757" : "#575757"};
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
  border-top: 1px solid ${props => props.focused ? "#005757" : "#575757"};
  border-left: 1px solid ${props => props.focused ? "#005757" : "#575757"};
  border-bottom: 1px solid #ADADAD;
  border-right: 1px solid #ADADAD;
`;
const InvertedBlock8x8 = styled(InvertedBlock)`
  width: 8px;
  height: 8px;
`;

export const WindowTitleBar: React.FC<{ focused: boolean, closeWindow: () => void, text: string[] }>
  = ({focused, text, closeWindow}) => {
  return (<WindowTitleBarDiv>
    <WindowTitleBarCol focused={focused}>
      <Block as="button">
        <Block8x3 focused={focused}/>
      </Block>
    </WindowTitleBarCol>
    <WindowTitleBarCol middle={true} focused={focused}>
      <Block flexGrow={1}>
        {text.map(s => <TitleBarText key={s}>{s}</TitleBarText>)}
      </Block>
    </WindowTitleBarCol>
    <WindowTitleBarCol focused={focused}>
      <Block as="button" onClick={closeWindow}>
        <Block3x3 focused={focused}/>
      </Block>
      <Block as="button" focused={focused}>
        <InvertedBlock8x8 focused={focused}/>
      </Block>
    </WindowTitleBarCol>
  </WindowTitleBarDiv>);
};