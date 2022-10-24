import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { NoSelectDiv } from "../../styles/NoSelectDiv";

const TimeStyle = styled(NoSelectDiv)`
  font-family: ${props => props.theme.fontProps.eramFontFamily};
  color: ${props => props.theme.colors.grey};
  display: flex;
  justify-content: center;
  align-items: center;
  width: 8ch;
  margin: 1px;
  font-size: 22px;
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
      {date
        .getUTCHours()
        .toString()
        .padStart(2, "0")}
      {date
        .getUTCMinutes()
        .toString()
        .padStart(2, "0")}{" "}
      {date
        .getUTCSeconds()
        .toString()
        .padStart(2, "0")}
    </TimeStyle>
  );
}
