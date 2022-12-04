import React, { useEffect, useState } from "react";
import timeStyles from "css/time.module.scss";

export function Time() {
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className={timeStyles.time}>
      {date.getUTCHours().toString().padStart(2, "0")}
      {date.getUTCMinutes().toString().padStart(2, "0")} {date.getUTCSeconds().toString().padStart(2, "0")}
    </div>
  );
}
