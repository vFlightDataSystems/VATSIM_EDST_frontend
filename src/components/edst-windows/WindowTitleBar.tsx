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
  }}
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
const Block = styled.button<{ focused?: boolean, width?: number, height?: number, flexGrow?: number }>`
  flex-grow: ${props => props.flexGrow ?? 0};
  vertical-align: center;
  background-color: #888888;
  
  width: ${props => props.width ? props.width + 'px' : '24px'};
  height: ${props => props.height ? props.height + 'px' : 'auto'};

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
const InvertedBlock = styled(Block)`
  border-top: 1px solid ${props => props.focused ? "#005757" : "#575757"};
  border-left: 1px solid ${props => props.focused ? "#005757" : "#575757"};
  border-bottom: 1px solid #ADADAD;
  border-right: 1px solid #ADADAD;
`;
const Div = styled.div``;

export const WindowTitleBar: React.FC<{ focused: boolean, closeWindow: () => void, text: string[] }>
  = ({focused, text, closeWindow}) => {
  return (<WindowTitleBarDiv>
    <WindowTitleBarCol focused={focused}>
      <Block>
        <Block as={Div} width={8} height={3} focused={focused}/>
      </Block>
    </WindowTitleBarCol>
    <WindowTitleBarCol middle={true} focused={focused}>
      <Block as={Div} flexGrow={1}>
        {text.map(s => <TitleBarText key={s}>{s}</TitleBarText>)}
      </Block>
    </WindowTitleBarCol>
    <WindowTitleBarCol focused={focused}>
      <Block onClick={closeWindow}>
        <Block as={Div} width={3} height={3} focused={focused}/>
      </Block>
      <Block focused={focused}>
        <InvertedBlock as={Div} width={8} height={8} focused={focused}/>
      </Block>
    </WindowTitleBarCol>
  </WindowTitleBarDiv>);
};