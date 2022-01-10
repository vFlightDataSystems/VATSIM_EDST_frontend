import React, {useEffect, useState} from 'react';

export default function Time() {
  const [dateState, setDateState] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setDateState(new Date()), 1000);
    return () => clearInterval(interval)
  }, []);
  return (
    <div className="edst-header-time no-select">
        {("0"+dateState.getUTCHours()).slice(-2)}{("0"+dateState.getUTCMinutes()).slice(-2)} {("0"+dateState.getUTCSeconds()).slice(-2)}
    </div>
  );
}