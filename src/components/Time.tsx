import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { edstFontGrey } from "../styles/colors";
import { eramFontFamily } from "../styles/styles";

const TimeStyle = styled.div`
  font-family: ${eramFontFamily};
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
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <TimeStyle>
      {`0${date.getUTCHours()}`.slice(-2)}
      {`0${date.getUTCMinutes()}`.slice(-2)} {`0${date.getUTCSeconds()}`.slice(-2)}
    </TimeStyle>
  );
}
