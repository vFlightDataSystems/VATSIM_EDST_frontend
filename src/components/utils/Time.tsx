import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { edstFontGrey } from "../../styles/colors";
import { eramFontFamily, NoSelectDiv } from "../../styles/styles";

const TimeStyle = styled(NoSelectDiv)`
  font-family: ${eramFontFamily};
  color: ${edstFontGrey};
  text-align: center;
  align-items: center;
  width: 90px;
  margin: 1px;
  font-size: 20px;
  line-height: 20px;
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
