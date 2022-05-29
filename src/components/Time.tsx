import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { edstFontGrey } from "../styles/colors";

const TimeStyle = styled.div`
  display: inline-flex;
  justify-content: center;
  height: 30px;
  line-height: 28px;
  width: 100px;
  margin: 0 1px;
  color: ${edstFontGrey};
  font-size: 20px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

export function Time() {
  const [dateState, setDateState] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setDateState(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <TimeStyle>
      {`0${dateState.getUTCHours()}`.slice(-2)}
      {`0${dateState.getUTCMinutes()}`.slice(-2)} {`0${dateState.getUTCSeconds()}`.slice(-2)}
    </TimeStyle>
  );
}
