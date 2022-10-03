import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { NoSelectDiv } from "../../styles/NoSelectDiv";

const TimeStyle = styled(NoSelectDiv)`
  font-family: ${props => props.theme.fontProperties.eramFontFamily};
  color: ${props => props.theme.colors.grey};
  text-align: center;
  align-items: center;
  width: 90px;
  margin: 1px;
  font-size: 20px;
  line-height: 1em;
  height: 100%;
`;

export function Time() {
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <TimeStyle>
      {String(date.getUTCHours()).padStart(2, "0")}
      {String(date.getUTCMinutes()).padStart(2, "0")} {String(date.getUTCSeconds()).padStart(2, "0")}
    </TimeStyle>
  );
}
