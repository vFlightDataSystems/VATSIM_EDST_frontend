import { useEffect, useLayoutEffect, useRef } from "react";

export function useOnUnmount(handler: () => void) {
  const handlerRef = useRef<typeof handler | null>(null);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    return () => handlerRef.current!();
  }, []);
}
